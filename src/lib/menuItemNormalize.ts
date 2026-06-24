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

export function mergeMenuItemsById(
  existing: MenuItem[],
  incoming: MenuItem[],
): MenuItem[] {
  if (!incoming.length) return existing;

  const byId = new Map(existing.map((item) => [item.id, item]));
  for (const item of incoming) {
    byId.set(item.id, item);
  }
  return [...byId.values()];
}
