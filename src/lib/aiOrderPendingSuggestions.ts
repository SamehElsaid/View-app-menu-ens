import { normalizeArabicInput } from "@/lib/aiOrderConversation";
import { parseQuantityFromMessage } from "@/lib/aiOrderQuantity";
import { findMenuItemsMatchingText } from "@/lib/aiOrderRemoveIntent";
import type { MenuItem } from "@/types/menu";

export const PENDING_SUGGESTIONS_STORAGE_KEY =
  "ensmenu_ai_order_pending_suggestions";

const PENDING_TTL_MS = 5 * 60 * 1000;

export type PendingSuggestions = {
  itemIds: number[];
  createdAt: number;
};

export function readPendingSuggestions(): PendingSuggestions | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PENDING_SUGGESTIONS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingSuggestions;
    if (!Array.isArray(parsed?.itemIds)) return null;
    if (Date.now() - parsed.createdAt > PENDING_TTL_MS) {
      sessionStorage.removeItem(PENDING_SUGGESTIONS_STORAGE_KEY);
      return null;
    }
    const itemIds = parsed.itemIds.filter(
      (id) => Number.isInteger(id) && id > 0,
    );
    if (!itemIds.length) return null;
    return { itemIds, createdAt: parsed.createdAt };
  } catch {
    return null;
  }
}

export function writePendingSuggestions(itemIds: number[]): void {
  if (typeof window === "undefined" || !itemIds.length) return;
  const payload: PendingSuggestions = {
    itemIds,
    createdAt: Date.now(),
  };
  sessionStorage.setItem(
    PENDING_SUGGESTIONS_STORAGE_KEY,
    JSON.stringify(payload),
  );
}

export function clearPendingSuggestions(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PENDING_SUGGESTIONS_STORAGE_KEY);
}

const PRICE_INQUIRY_PHRASES = [
  "بكام",
  "بكم",
  "كام",
  "كم",
  "السعر",
  "سعر",
  "سعره",
  "سعرها",
  "بكام دول",
  "بكام ده",
  "بكام دي",
  "كام السعر",
  "كم السعر",
  "سعره كام",
  "سعرها كام",
  "price",
] as const;

export function isPriceInquiryIntent(message: string): boolean {
  const normalized = normalizeArabicInput(message);
  if (!normalized) return false;

  return PRICE_INQUIRY_PHRASES.some((phrase) => {
    const p = normalizeArabicInput(phrase);
    return (
      normalized === p ||
      normalized.startsWith(`${p} `) ||
      normalized.endsWith(` ${p}`) ||
      normalized.includes(` ${p} `) ||
      normalized.includes(p)
    );
  });
}

function parseOrdinalSuggestionIndex(
  message: string,
  optionCount: number,
): number | null {
  const normalized = normalizeArabicInput(message);

  const ordinals: ReadonlyArray<{ words: string[]; index: number }> = [
    { words: ["الاول", "الأول", "اول", "أول", "الاولى"], index: 1 },
    { words: ["التاني", "الثاني", "التانى", "تاني", "ثاني", "الثانيه"], index: 2 },
    { words: ["الثالث", "التالت", "تالت", "ثالث", "الثالثه"], index: 3 },
    { words: ["الرابع", "رابع"], index: 4 },
    { words: ["الخامس", "خامس"], index: 5 },
  ];

  for (const { words, index } of ordinals) {
    if (index > optionCount) continue;
    if (
      words.some((w) => {
        const ww = normalizeArabicInput(w);
        return (
          normalized === ww ||
          normalized.startsWith(`${ww} `) ||
          normalized.endsWith(` ${ww}`) ||
          normalized.includes(` ${ww} `)
        );
      })
    ) {
      return index - 1;
    }
  }

  const trimmed = message.trim();
  if (/^[1-9]\d*$/.test(trimmed)) {
    const n = Number(trimmed);
    if (n >= 1 && n <= optionCount) return n - 1;
  }

  const parsedQty = parseQuantityFromMessage(message);
  if (parsedQty != null && parsedQty >= 1 && parsedQty <= optionCount) {
    return parsedQty - 1;
  }

  return null;
}

function wantsBothPendingItems(message: string): boolean {
  const normalized = normalizeArabicInput(message);
  return (
    normalized === "الاتنين" ||
    normalized === "الاتنين" ||
    normalized === "الاثنين" ||
    normalized === "الاتنينهم" ||
    normalized === "الاتنين" ||
    normalized.includes("الاتنين") ||
    normalized.includes("الاثنين")
  );
}

function itemMatchesReply(message: string, item: MenuItem): boolean {
  const msg = normalizeArabicInput(message);
  if (!msg) return false;

  for (const raw of [item.nameAr, item.name, item.nameEn]) {
    const name = normalizeArabicInput(raw ?? "");
    if (name.length < 2) continue;
    if (msg.includes(name) || name.includes(msg)) return true;

    for (const token of name.split(/\s+/)) {
      const t = normalizeArabicInput(token);
      if (t.length >= 3 && (msg.includes(t) || t.includes(msg))) return true;
    }
  }

  return false;
}

export type PendingSuggestionsResolution =
  | { kind: "price" }
  | { kind: "pick"; itemId: number }
  | { kind: "pick_all" }
  | { kind: "ambiguous"; itemIds: number[] }
  | { kind: "unrelated" };

export function resolvePendingSuggestionsMessage(
  message: string,
  pending: PendingSuggestions,
  menuItems: MenuItem[],
): PendingSuggestionsResolution {
  const options = pending.itemIds
    .map((id) => menuItems.find((m) => m.id === id))
    .filter((m): m is MenuItem => Boolean(m));

  if (!options.length) return { kind: "unrelated" };

  if (isPriceInquiryIntent(message)) {
    return { kind: "price" };
  }

  if (options.length === 2 && wantsBothPendingItems(message)) {
    return { kind: "pick_all" };
  }

  const index = parseOrdinalSuggestionIndex(message, options.length);
  if (index != null) {
    return { kind: "pick", itemId: options[index]!.id };
  }

  const nameMatches = options.filter((item) => itemMatchesReply(message, item));
  if (nameMatches.length === 1) {
    return { kind: "pick", itemId: nameMatches[0]!.id };
  }
  if (nameMatches.length > 1) {
    return { kind: "ambiguous", itemIds: nameMatches.map((m) => m.id) };
  }

  const broadMatches = findMenuItemsMatchingText(message, options);
  if (broadMatches.length === 1) {
    return { kind: "pick", itemId: broadMatches[0]!.id };
  }
  if (broadMatches.length > 1) {
    return { kind: "ambiguous", itemIds: broadMatches.map((m) => m.id) };
  }

  return { kind: "unrelated" };
}

export function buildPendingSuggestionsPriceReply(
  items: MenuItem[],
  displayName: (item: MenuItem) => string,
  formatPrice: (amount: number) => string,
): string {
  if (items.length === 1) {
    const item = items[0]!;
    return `${displayName(item)}: ${formatPrice(item.price)}`;
  }

  const lines = items.map(
    (item, i) => `${i + 1}. ${displayName(item)} — ${formatPrice(item.price)}`,
  );
  return `الأسعار:\n${lines.join("\n")}`;
}
