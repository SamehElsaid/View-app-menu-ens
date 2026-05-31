import { normalizeArabicInput } from "@/lib/aiOrderConversation";
import { parseQuantityFromMessage } from "@/lib/aiOrderQuantity";
import { findMenuItemsMatchingText } from "@/lib/aiOrderRemoveIntent";
import type { MenuItem } from "@/types/menu";

export const PENDING_SELECTION_STORAGE_KEY =
  "ensmenu_ai_order_pending_selection";

const PENDING_TTL_MS = 30 * 60 * 1000;

export type PendingSelection = {
  type: "product_choice";
  options: number[];
  createdAt: number;
};

export function readPendingSelection(): PendingSelection | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PENDING_SELECTION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingSelection;
    if (parsed?.type !== "product_choice" || !Array.isArray(parsed.options)) {
      return null;
    }
    if (Date.now() - parsed.createdAt > PENDING_TTL_MS) {
      sessionStorage.removeItem(PENDING_SELECTION_STORAGE_KEY);
      return null;
    }
    const options = parsed.options.filter(
      (id) => Number.isInteger(id) && id > 0,
    );
    if (options.length < 2) return null;
    return { ...parsed, options };
  } catch {
    return null;
  }
}

export function writePendingSelection(selection: PendingSelection): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(
    PENDING_SELECTION_STORAGE_KEY,
    JSON.stringify(selection),
  );
}

export function clearPendingSelection(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PENDING_SELECTION_STORAGE_KEY);
}

export function createProductChoicePending(optionIds: number[]): PendingSelection {
  return {
    type: "product_choice",
    options: optionIds,
    createdAt: Date.now(),
  };
}

function itemNames(item: MenuItem): string[] {
  return [item.nameAr, item.name, item.nameEn].filter(Boolean) as string[];
}

/** User query matches item if message contains name or name contains query (e.g. "ايس كريم"). */
export function findMenuItemsMatchingOrderQuery(
  message: string,
  menuItems: MenuItem[],
): MenuItem[] {
  const normalized = normalizeArabicInput(message);
  if (normalized.length < 2) return [];

  const matched: MenuItem[] = [];
  const seen = new Set<number>();

  for (const item of menuItems) {
    if (item.available === false) continue;

    let hit = false;
    for (const raw of itemNames(item)) {
      const name = normalizeArabicInput(raw);
      if (name.length < 2) continue;
      if (normalized.includes(name) || name.includes(normalized)) {
        hit = true;
        break;
      }
      for (const token of name.split(/\s+/)) {
        const t = normalizeArabicInput(token);
        if (t.length >= 3 && normalized.includes(t)) {
          hit = true;
          break;
        }
      }
      if (hit) break;
    }

    if (hit && !seen.has(item.id)) {
      seen.add(item.id);
      matched.push(item);
    }
  }

  return matched.sort((a, b) => {
    const lenA = normalizeArabicInput(a.nameAr || a.name || "").length;
    const lenB = normalizeArabicInput(b.nameAr || b.name || "").length;
    return lenB - lenA;
  });
}

function optionMatchesReply(message: string, item: MenuItem): boolean {
  const msg = normalizeArabicInput(message);
  if (!msg) return false;

  for (const raw of itemNames(item)) {
    const name = normalizeArabicInput(raw);
    if (name.length < 2) continue;
    if (msg.includes(name) || name.includes(msg)) return true;

    for (const token of name.split(/\s+/)) {
      const t = normalizeArabicInput(token);
      if (t.length >= 3 && (msg.includes(t) || t.includes(msg))) return true;
    }
  }

  return false;
}

export function parsePendingOptionIndex(
  message: string,
  optionCount: number,
): number | null {
  const trimmed = message.trim();
  if (/^[1-9]\d*$/.test(trimmed)) {
    const n = Number(trimmed);
    if (n >= 1 && n <= optionCount) return n - 1;
  }
  const parsed = parseQuantityFromMessage(message);
  if (parsed != null && parsed >= 1 && parsed <= optionCount) {
    return parsed - 1;
  }
  return null;
}

export type PendingChoiceResolution =
  | { kind: "pick"; itemId: number }
  | { kind: "ambiguous"; itemIds: number[] }
  | { kind: "retry" }
  | { kind: "unrelated" };

export function resolvePendingProductChoice(
  message: string,
  pending: PendingSelection,
  menuItems: MenuItem[],
): PendingChoiceResolution {
  const options = pending.options
    .map((id) => menuItems.find((m) => m.id === id))
    .filter((m): m is MenuItem => Boolean(m));

  if (options.length < 2) {
    return { kind: "unrelated" };
  }

  const index = parsePendingOptionIndex(message, options.length);
  if (index != null) {
    return { kind: "pick", itemId: options[index]!.id };
  }

  const textMatches = options.filter((item) => optionMatchesReply(message, item));
  if (textMatches.length === 1) {
    return { kind: "pick", itemId: textMatches[0]!.id };
  }
  if (textMatches.length > 1) {
    return { kind: "ambiguous", itemIds: textMatches.map((m) => m.id) };
  }

  const broadMatches = findMenuItemsMatchingText(message, options);
  if (broadMatches.length === 1) {
    return { kind: "pick", itemId: broadMatches[0]!.id };
  }
  if (broadMatches.length > 1) {
    return { kind: "ambiguous", itemIds: broadMatches.map((m) => m.id) };
  }

  return { kind: "retry" };
}

export function buildProductChoicePrompt(
  items: MenuItem[],
  displayName: (item: MenuItem) => string,
): string {
  const names = items.map(displayName).filter(Boolean);
  if (names.length === 2) {
    return `${names[0]} ولا ${names[1]}؟`;
  }
  const lines = names.map((name, i) => `${i + 1}. ${name}`);
  return `${lines.join("\n")}\nاختار رقم أو اكتب الاسم:`;
}
