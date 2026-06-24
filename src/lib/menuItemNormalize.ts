import type { Category, MenuItem } from "@/types/menu";

function normalizePrice(val: unknown): number {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
}

export function normalizeMenuItem(item: MenuItem): MenuItem {
  return {
    ...item,
    price: normalizePrice(item.price),
    originalPrice:
      item.originalPrice != null ? normalizePrice(item.originalPrice) : null,
    sizes: Array.isArray(item.sizes)
      ? item.sizes
          .filter(Boolean)
          .map((s) => ({ ...s, price: normalizePrice(s.price) }))
      : null,
    variants: Array.isArray(item.variants)
      ? item.variants
          .filter(Boolean)
          .map((v) => ({ ...v, price: normalizePrice(v.price) }))
      : null,
  };
}

export function normalizeMenuItems(items: MenuItem[]): MenuItem[] {
  return items.map(normalizeMenuItem);
}

export function normalizeCategories(cats: Category[]): Category[] {
  return cats.map((cat) => ({
    ...cat,
    menuItems: Array.isArray(cat.menuItems)
      ? normalizeMenuItems(cat.menuItems)
      : (cat.menuItems ?? []),
  }));
}

/**
 * Merges incoming items into the existing set by id.
 *
 * Incoming items (e.g. from catalog pagination) may be "shallow" — they
 * intentionally omit enriched fields like `sizes`, `variants`, `allergens`,
 * and `ingredients` that the bootstrap already loaded. A blind overwrite would
 * silently lose that data and cause the detail modal to render without options.
 *
 * Strategy: incoming wins for every field it explicitly carries, but enriched
 * fields that are absent (`undefined`) on the incoming item are preserved from
 * the previously loaded richer version.
 */
export function mergeMenuItemsById(
  existing: MenuItem[],
  incoming: MenuItem[],
): MenuItem[] {
  if (!incoming.length) return existing;

  const byId = new Map(existing.map((item) => [item.id, item]));
  for (const item of incoming) {
    const prev = byId.get(item.id);
    if (prev) {
      byId.set(item.id, {
        ...prev,
        ...item,
        sizes: item.sizes !== undefined ? item.sizes : prev.sizes,
        variants: item.variants !== undefined ? item.variants : prev.variants,
        allergens: item.allergens !== undefined ? item.allergens : prev.allergens,
        ingredients: item.ingredients !== undefined ? item.ingredients : prev.ingredients,
      });
    } else {
      byId.set(item.id, item);
    }
  }
  return [...byId.values()];
}
