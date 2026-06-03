import { normalizeArabicInput } from "@/lib/aiOrderConversation";
import type { MenuItem } from "@/types/menu";

/** Longest first so "مش عايزه" strips before "مش عايز". */
const REMOVE_KEYWORDS = [
  "مش عايزه",
  "مش عايز",
  "إلغاء",
  "الغاء",
  "الغي",
  "احذف",
  "امسح",
  "شيل",
  "remove",
  "delete",
] as const;

const SORTED_REMOVE_KEYWORDS = [...REMOVE_KEYWORDS].sort(
  (a, b) => normalizeArabicInput(b).length - normalizeArabicInput(a).length,
);

export function isRemoveIntent(message: string): boolean {
  const normalized = normalizeArabicInput(message);
  if (!normalized) return false;

  return SORTED_REMOVE_KEYWORDS.some((kw) => {
    const k = normalizeArabicInput(kw);
    return (
      normalized === k ||
      normalized.startsWith(`${k} `) ||
      normalized.endsWith(` ${k}`) ||
      normalized.includes(` ${k} `) ||
      normalized.includes(k)
    );
  });
}

/** Message text after stripping remove keywords (for product name search). */
export function stripRemoveKeywords(message: string): string {
  let text = normalizeArabicInput(message);

  for (const kw of SORTED_REMOVE_KEYWORDS) {
    const k = normalizeArabicInput(kw);
    if (!k) continue;
    text = text.split(k).join(" ");
  }

  return text.replace(/\s+/g, " ").trim();
}

type NameMatch = { item: MenuItem; nameLength: number; priority: number };

/**
 * Find menu items whose name appears in the search text.
 * Arabic names are checked first (lower priority number = preferred).
 */
export function findMenuItemsMatchingText(
  searchText: string,
  menuItems: MenuItem[],
): MenuItem[] {
  const normalized = normalizeArabicInput(searchText);
  if (normalized.length < 2) return [];

  const rawMatches: NameMatch[] = [];

  for (const item of menuItems) {
    const candidates: { raw: string; priority: number }[] = [
      { raw: item.nameAr ?? "", priority: 0 },
      { raw: item.name ?? "", priority: 1 },
      { raw: item.nameEn ?? "", priority: 2 },
    ];

    for (const { raw, priority } of candidates) {
      const name = normalizeArabicInput(raw);
      if (name.length < 2) continue;
      if (!normalized.includes(name)) continue;

      rawMatches.push({ item, nameLength: name.length, priority });
      break;
    }
  }

  if (!rawMatches.length) return [];

  const byId = new Map<number, NameMatch>();
  for (const match of rawMatches) {
    const existing = byId.get(match.item.id);
    if (
      !existing ||
      match.nameLength > existing.nameLength ||
      (match.nameLength === existing.nameLength &&
        match.priority < existing.priority)
    ) {
      byId.set(match.item.id, match);
    }
  }

  const deduped = [...byId.values()].sort((a, b) => {
    if (b.nameLength !== a.nameLength) return b.nameLength - a.nameLength;
    return a.priority - b.priority;
  });

  const maxLen = deduped[0]!.nameLength;
  return deduped
    .filter((m) => m.nameLength >= maxLen - 1 || maxLen < 4)
    .filter(
      (m, _i, arr) =>
        !arr.some(
          (other) =>
            other.item.id !== m.item.id &&
            other.nameLength > m.nameLength &&
            normalizeArabicInput(
              other.item.nameAr || other.item.name || other.item.nameEn || "",
            ).includes(
              normalizeArabicInput(
                m.item.nameAr || m.item.name || m.item.nameEn || "",
              ),
            ),
        ),
    )
    .map((m) => m.item);
}

export function findMenuItemsForRemoveIntent(
  message: string,
  menuItems: MenuItem[],
): MenuItem[] {
  const searchText = stripRemoveKeywords(message);
  return findMenuItemsMatchingText(searchText, menuItems);
}
