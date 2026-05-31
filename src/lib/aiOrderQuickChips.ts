import type { MenuItem } from "@/types/menu";

export type QuickChip = {
  id: string;
  label: string;
  /** Sent verbatim to n8n as the user message. */
  message: string;
};

type MenuCategoryRow = {
  id: number;
  nameAr: string;
  nameEn: string;
  sortOrder: number;
};

const MAX_CATEGORY_CHIPS = 4;

const FALLBACK_CHIPS_AR: QuickChip[] = [
  { id: "fallback-recommend", label: "🔥 رشحلي", message: "رشحلي" },
  { id: "fallback-pick", label: "😋 اختارلي", message: "اختارلي" },
  { id: "fallback-sweet", label: "🍓 حاجة حلوة", message: "حاجة حلوة" },
  { id: "fallback-cold", label: "🧊 حاجة ساقعة", message: "حاجة ساقعة" },
];

const FALLBACK_CHIPS_EN: QuickChip[] = [
  {
    id: "fallback-recommend",
    label: "🔥 Recommend something",
    message: "Recommend something",
  },
  { id: "fallback-pick", label: "😋 Choose for me", message: "Choose for me" },
  { id: "fallback-sweet", label: "🍓 Something sweet", message: "Something sweet" },
  { id: "fallback-cold", label: "🧊 Something cold", message: "Something cold" },
];

function normalizeText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .toLowerCase();
}

function emojiForCategoryName(nameAr: string, nameEn: string): string {
  const blob = normalizeText(`${nameAr} ${nameEn}`);
  if (blob.includes("قهو") || blob.includes("coffee")) return "☕";
  if (blob.includes("مشروب") || blob.includes("drink")) return "🥤";
  if (blob.includes("عصير") || blob.includes("juice")) return "🍹";
  if (blob.includes("حلو") || blob.includes("dessert")) return "🍰";
  if (blob.includes("فطار") || blob.includes("breakfast")) return "🍳";
  if (
    blob.includes("اكل") ||
    blob.includes("طعام") ||
    blob.includes("food") ||
    blob.includes("وجبات") ||
    blob.includes("وجبه")
  ) {
    return "🍽️";
  }
  return "";
}

function categoryNamesFromItem(item: MenuItem): {
  nameAr: string;
  nameEn: string;
} {
  const nameAr =
    item.categoryNameAr?.trim() ||
    item.categoryName?.trim() ||
    item.category?.trim() ||
    "";
  const nameEn =
    item.categoryNameEn?.trim() ||
    item.categoryNameAr?.trim() ||
    item.categoryName?.trim() ||
    item.category?.trim() ||
    "";
  return { nameAr, nameEn };
}

function collectCategories(menuItems: MenuItem[]): MenuCategoryRow[] {
  const byId = new Map<number, MenuCategoryRow>();

  for (const item of menuItems) {
    if (item.available === false) continue;
    const { nameAr, nameEn } = categoryNamesFromItem(item);
    if (!nameAr && !nameEn) continue;

    const sortOrder = item.sortOrder ?? 0;
    const existing = byId.get(item.categoryId);
    const row: MenuCategoryRow = {
      id: item.categoryId,
      nameAr: nameAr || nameEn,
      nameEn: nameEn || nameAr,
      sortOrder,
    };

    if (!existing || sortOrder < existing.sortOrder) {
      byId.set(item.categoryId, row);
    }
  }

  return [...byId.values()].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function categoryDisplayName(
  category: MenuCategoryRow,
  isArabic: boolean,
): string {
  if (isArabic) {
    return category.nameAr.trim() || category.nameEn.trim();
  }
  return category.nameEn.trim() || category.nameAr.trim();
}

function categoryToChip(category: MenuCategoryRow, isArabic: boolean): QuickChip {
  const name = categoryDisplayName(category, isArabic);
  const emoji = emojiForCategoryName(category.nameAr, category.nameEn);
  return {
    id: `category-${category.id}`,
    label: emoji ? `${emoji} ${name}` : name,
    message: name,
  };
}

export function buildCategoryQuickChips(
  menuItems: MenuItem[],
  isArabic: boolean,
): QuickChip[] {
  const categories = collectCategories(menuItems);
  if (!categories.length) {
    return isArabic ? [...FALLBACK_CHIPS_AR] : [...FALLBACK_CHIPS_EN];
  }
  return categories.map((cat) => categoryToChip(cat, isArabic));
}

function shufflePick<T>(items: T[], count: number, rng: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy.slice(0, Math.min(count, copy.length));
}

/** Up to 4 random category chips; fallback generics when menu has no categories. */
export function pickRandomQuickChips(
  menuItems: MenuItem[],
  isArabic: boolean,
  count = MAX_CATEGORY_CHIPS,
  rng: () => number = Math.random,
): QuickChip[] {
  const pool = buildCategoryQuickChips(menuItems, isArabic);
  const categories = collectCategories(menuItems);
  const limit = categories.length
    ? Math.min(count, MAX_CATEGORY_CHIPS, pool.length)
    : Math.min(pool.length, MAX_CATEGORY_CHIPS);
  return shufflePick(pool, limit, rng);
}
