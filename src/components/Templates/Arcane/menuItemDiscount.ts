import type { MenuItem } from "@/types/menu";

export function getItemDiscount(item: MenuItem) {
  const hasDiscount =
    item.originalPrice != null && item.originalPrice > item.price;
  const discountPercent =
    item.discountPercent ??
    (hasDiscount && item.originalPrice
      ? Math.round(
          ((item.originalPrice - item.price) / item.originalPrice) * 100,
        )
      : null);

  return { hasDiscount, discountPercent };
}
