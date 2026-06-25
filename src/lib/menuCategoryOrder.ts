import type { Category, MenuItem } from "@/types/menu";

type Sortable = { sortOrder?: number; id: number };

function compareSortOrder(a: Sortable, b: Sortable): number {
  return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
}

/** Sorts by sortOrder ASC, preserving API response order for equal sortOrder values. */
export function sortCategories<T extends Sortable>(categories: T[]): T[] {
  return [...categories].sort(compareSortOrder);
}

export function sortMenuItems<T extends Sortable>(items: T[]): T[] {
  return [...items].sort(compareSortOrder);
}

/**
 * Menu items ordered by dashboard category order, then item sortOrder within each category.
 */
export function sortMenuItemsForDisplay(
  items: MenuItem[],
  categories: Category[] | null | undefined,
): MenuItem[] {
  if (!categories?.length) {
    return sortMenuItems(items);
  }

  const categoryRank = new Map(
    sortCategories(categories).map((category, index) => [category.id, index]),
  );

  return [...items].sort((a, b) => {
    const rankA = categoryRank.get(a.categoryId) ?? Number.MAX_SAFE_INTEGER;
    const rankB = categoryRank.get(b.categoryId) ?? Number.MAX_SAFE_INTEGER;
    if (rankA !== rankB) return rankA - rankB;
    return compareSortOrder(a, b);
  });
}

export type CategorySection = {
  categoryId: number;
  items: MenuItem[];
};

/** Category sections in dashboard order (only categories that have items). */
export function buildCategorySections(
  categories: Category[] | null | undefined,
  items: MenuItem[],
): CategorySection[] {
  const sortedItems = sortMenuItemsForDisplay(items, categories);
  const itemsByCategoryId = new Map<number, MenuItem[]>();

  for (const item of sortedItems) {
    const categoryId = item.categoryId;
    if (categoryId == null) continue;
    const bucket = itemsByCategoryId.get(categoryId);
    if (bucket) {
      bucket.push(item);
    } else {
      itemsByCategoryId.set(categoryId, [item]);
    }
  }

  if (categories?.length) {
    const sections: CategorySection[] = [];
    for (const category of sortCategories(categories)) {
      const categoryItems = itemsByCategoryId.get(category.id);
      if (categoryItems?.length) {
        sections.push({ categoryId: category.id, items: categoryItems });
      }
    }
    for (const [categoryId, categoryItems] of itemsByCategoryId) {
      if (!sections.some((section) => section.categoryId === categoryId)) {
        sections.push({ categoryId, items: categoryItems });
      }
    }
    return sections;
  }

  return [...itemsByCategoryId.entries()]
    .map(([categoryId, categoryItems]) => ({
      categoryId,
      items: categoryItems,
      minOrder: Math.min(...categoryItems.map((item) => item.sortOrder ?? 0)),
    }))
    .sort(
      (a, b) =>
        a.minOrder - b.minOrder || a.categoryId - b.categoryId,
    )
    .map(({ categoryId, items: categoryItems }) => ({
      categoryId,
      items: categoryItems,
    }));
}
