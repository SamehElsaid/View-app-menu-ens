import type { Category, MenuItem } from "@/types/menu";

export type QuickChip = {
  id: string;
  label: string;
  /** Sent verbatim to n8n as the user message (fallback chips only). */
  message: string;
  /**
   * When set, chip browses catalog via API instead of calling n8n.
   * `0` = all products; `> 0` = category id.
   */
  categoryId?: number;
};

type MenuCategoryRow = {
  id: number;
  nameAr: string;
  nameEn: string;
  sortOrder: number;
};

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

function collectCategoriesFromItems(menuItems: MenuItem[]): MenuCategoryRow[] {
  const byId = new Map<number, MenuCategoryRow>();

  for (const item of menuItems) {
    if (item.available === false) continue;
    const { nameAr, nameEn } = categoryNamesFromItem(item);
    if (!nameAr && !nameEn) continue;
    if (!Number.isInteger(item.categoryId) || item.categoryId <= 0) continue;

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

function collectCategoriesFromStore(
  categories: Category[] | null | undefined,
): MenuCategoryRow[] {
  if (!categories?.length) return [];

  return categories
    .filter((category) => Number.isInteger(category.id) && category.id > 0)
    .map((category) => ({
      id: category.id,
      nameAr:
        category.nameAr?.trim() ||
        category.name?.trim() ||
        category.nameEn?.trim() ||
        "",
      nameEn:
        category.nameEn?.trim() ||
        category.name?.trim() ||
        category.nameAr?.trim() ||
        "",
      sortOrder: category.sortOrder ?? 0,
    }))
    .filter((row) => row.nameAr || row.nameEn)
    .sort((a, b) => a.sortOrder - b.sortOrder);
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
    categoryId: category.id,
  };
}

function allProductsChip(isArabic: boolean): QuickChip {
  return isArabic
    ? {
        id: "category-all",
        label: "🍽️ كل المنتجات",
        message: "كل المنتجات",
        categoryId: 0,
      }
    : {
        id: "category-all",
        label: "🍽️ All products",
        message: "All products",
        categoryId: 0,
      };
}

/**
 * All category chips (plus «all products»), for in-chat catalog browse.
 * Falls back to generic suggestion chips when no categories exist.
 */
export function buildAllCategoryQuickChips(
  menuItems: MenuItem[],
  isArabic: boolean,
  storeCategories?: Category[] | null,
): QuickChip[] {
  const fromStore = collectCategoriesFromStore(storeCategories);
  const categories = fromStore.length
    ? fromStore
    : collectCategoriesFromItems(menuItems);

  if (!categories.length) {
    return isArabic ? [...FALLBACK_CHIPS_AR] : [...FALLBACK_CHIPS_EN];
  }

  return [allProductsChip(isArabic), ...categories.map((cat) => categoryToChip(cat, isArabic))];
}

/** @deprecated Prefer buildAllCategoryQuickChips for chat browse UX. */
export function buildCategoryQuickChips(
  menuItems: MenuItem[],
  isArabic: boolean,
): QuickChip[] {
  return buildAllCategoryQuickChips(menuItems, isArabic);
}

function shufflePick<T>(items: T[], count: number, rng: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy.slice(0, Math.min(count, copy.length));
}

/**
 * Up to 4 random category chips; kept for any non-browse callers.
 * Chat UI should use buildAllCategoryQuickChips.
 */
export function pickRandomQuickChips(
  menuItems: MenuItem[],
  isArabic: boolean,
  count = 4,
  rng: () => number = Math.random,
): QuickChip[] {
  const pool = buildAllCategoryQuickChips(menuItems, isArabic).filter(
    (chip) => chip.categoryId == null || chip.categoryId > 0,
  );
  if (!pool.length) {
    return isArabic ? [...FALLBACK_CHIPS_AR] : [...FALLBACK_CHIPS_EN];
  }
  return shufflePick(pool, Math.min(count, pool.length), rng);
}
