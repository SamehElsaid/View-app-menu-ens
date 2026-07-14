import { normalizeArabicInput } from "@/lib/aiOrderConversation";
import type { MenuItem } from "@/types/menu";

export const LAST_CART_ITEM_STORAGE_KEY = "ensmenu_ai_order_last_cart_item_id";
export const LAST_CART_LINE_STORAGE_KEY = "ensmenu_ai_order_last_cart_line_key";

const ARABIC_QUANTITY_WORDS: Record<string, number> = {
  واحد: 1,
  واحدة: 1,
  وحده: 1,
  وحدة: 1,
  اتنين: 2,
  اثنين: 2,
  اثنان: 2,
  اتنان: 2,
  تلاتة: 3,
  ثلاثة: 3,
  ثلاث: 3,
  اربعة: 4,
  أربعة: 4,
  اربع: 4,
  خمسة: 5,
  خمس: 5,
  ستة: 6,
  سبعة: 7,
  تمانية: 8,
  ثمانية: 8,
  تسعة: 9,
  عشرة: 10,
};

const INCREASE_LAST_ITEM_PHRASES = [
  "زود كمان واحد",
  "زود كمان واحدة",
  "زود واحدة",
  "زود واحد",
  "كمان واحد",
  "كمان واحدة",
  "ضيف واحد كمان",
  "ضيف واحدة كمان",
  "زود كمان 1",
  "كمان 1",
] as const;

function matchesPhrase(normalized: string, phrases: readonly string[]): boolean {
  const normalizedPhrases = phrases
    .map((p) => normalizeArabicInput(p))
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  return normalizedPhrases.some(
    (phrase) =>
      normalized === phrase ||
      normalized.startsWith(`${phrase} `) ||
      normalized.endsWith(` ${phrase}`) ||
      normalized.includes(` ${phrase} `) ||
      normalized.includes(phrase),
  );
}

export function readLastCartItemId(): number | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(LAST_CART_ITEM_STORAGE_KEY);
  if (!raw) return null;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function writeLastCartItemId(itemId: number): void {
  if (typeof window === "undefined") return;
  if (!Number.isInteger(itemId) || itemId <= 0) return;
  localStorage.setItem(LAST_CART_ITEM_STORAGE_KEY, String(itemId));
}

export function clearLastCartItemId(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LAST_CART_ITEM_STORAGE_KEY);
}

export function readLastCartLineKey(): string | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(LAST_CART_LINE_STORAGE_KEY);
  return raw?.trim() ? raw.trim() : null;
}

export function writeLastCartLineKey(lineKey: string): void {
  if (typeof window === "undefined") return;
  const trimmed = lineKey.trim();
  if (!trimmed) return;
  localStorage.setItem(LAST_CART_LINE_STORAGE_KEY, trimmed);
}

export function clearLastCartLineKey(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LAST_CART_LINE_STORAGE_KEY);
}

export function parseQuantityFromMessage(message: string): number | null {
  const normalized = normalizeArabicInput(message);

  const digitMatch = normalized.match(/(?:^|\s)(\d{1,3})(?:\s|$)/);
  if (digitMatch) {
    const qty = Number(digitMatch[1]);
    if (qty >= 1 && qty <= 999) return qty;
  }

  const sortedWords = Object.entries(ARABIC_QUANTITY_WORDS).sort(
    (a, b) => b[0].length - a[0].length,
  );
  for (const [word, qty] of sortedWords) {
    const nw = normalizeArabicInput(word);
    if (
      normalized === nw ||
      normalized.startsWith(`${nw} `) ||
      normalized.endsWith(` ${nw}`) ||
      normalized.includes(` ${nw} `)
    ) {
      return qty;
    }
  }

  return null;
}

export function findMenuItemOrderInMessage(
  message: string,
  menuItems: MenuItem[],
): { itemId: number; quantity: number } | null {
  const normalized = normalizeArabicInput(message);
  const quantity = parseQuantityFromMessage(message) ?? 1;

  let best: { itemId: number; nameLength: number } | null = null;

  for (const item of menuItems) {
    for (const raw of [item.nameAr, item.name, item.nameEn]) {
      const name = normalizeArabicInput(raw ?? "");
      if (name.length < 3) continue;
      if (!normalized.includes(name)) continue;
      if (!best || name.length > best.nameLength) {
        best = { itemId: item.id, nameLength: name.length };
      }
    }
  }

  if (!best) return null;
  return { itemId: best.itemId, quantity };
}

export function isIncreaseLastItemIntent(message: string): boolean {
  return isIncreaseQuantityIntent(message);
}

/** Delta to add for "زود كمان اتنين" etc. Defaults to 1. */
export function parseIncreaseDeltaFromMessage(message: string): number {
  return parseQuantityFromMessage(message) ?? 1;
}

/**
 * Increase last cart line (زود …) without naming a product.
 * Does not match "ضيف كمان" / add-more flows.
 */
export function isIncreaseQuantityIntent(message: string): boolean {
  const normalized = normalizeArabicInput(message);
  if (matchesPhrase(normalized, INCREASE_LAST_ITEM_PHRASES)) return true;

  const hasZood =
    normalized.includes("زود") || normalized.includes("زودلي");
  if (!hasZood) return false;

  if (parseQuantityFromMessage(message) != null) return true;
  if (normalized.includes("كمان")) return true;

  return normalized === "زود" || normalized.startsWith("زود ");
}

/** @deprecated Prefer isIncreaseQuantityIntent */
export function isAmbiguousQuantityChangeIntent(message: string): boolean {
  return isIncreaseQuantityIntent(message);
}
