import type { MenuItem } from "@/types/menu";

/**
 * Derives all discount display and pricing data from a menu item.
 *
 * Two pricing models are supported:
 *
 * Model A — API already applied the discount:
 *   originalPrice: 15.99, price: 12.99, discountPercent: 19 (optional)
 *   → price IS the final/sale price. discountedPrice === item.price.
 *
 * Model B — Only a discount rate is provided (no pre-computed sale price):
 *   originalPrice: null, price: 12.99, discountPercent: 10
 *   → price is the BASE price. discountedPrice = 12.99 × 0.9 = 11.69
 *
 * The distinction: when originalPrice is null AND discountPercent > 0,
 * we compute the sale price from the discount rate.
 */
export function getItemDiscount(item: MenuItem) {
  const hasOriginalPrice =
    item.originalPrice != null && item.originalPrice > item.price;
  const hasDiscountPercent =
    item.discountPercent != null && item.discountPercent > 0;

  const hasDiscount = hasOriginalPrice || hasDiscountPercent;

  const discountPercent =
    item.discountPercent ??
    (hasOriginalPrice && item.originalPrice
      ? Math.round(
          ((item.originalPrice - item.price) / item.originalPrice) * 100,
        )
      : null);

  /**
   * Model B: item.price is the base price, so compute the actual sale price.
   * Model A: item.price is already the sale price — leave it unchanged.
   */
  const discountedPrice =
    hasDiscountPercent && !hasOriginalPrice
      ? Math.round(item.price * (1 - item.discountPercent! / 100) * 100) / 100
      : item.price;

  /**
   * The price to display with strikethrough (the "was" price):
   * Model A → item.originalPrice
   * Model B → item.price  (the base price before the percent reduction)
   */
  const strikethroughPrice: number | null = hasOriginalPrice
    ? (item.originalPrice as number)
    : hasDiscountPercent
      ? item.price
      : null;

  return { hasDiscount, discountPercent, discountedPrice, strikethroughPrice };
}

/**
 * Applies the item-level discount to any arbitrary price value (e.g. a size price).
 *
 * Only applies when we are in Model B (discountPercent set, no originalPrice),
 * because in Model A the prices returned by the API are already at the sale level.
 */
export function applyItemDiscountToPrice(item: MenuItem, price: number): number {
  const hasOriginalPrice =
    item.originalPrice != null && item.originalPrice > item.price;
  const hasDiscountPercent =
    item.discountPercent != null && item.discountPercent > 0;

  if (hasDiscountPercent && !hasOriginalPrice) {
    return Math.round(price * (1 - item.discountPercent! / 100) * 100) / 100;
  }

  return price;
}

/**
 * Returns the "before discount" total to display as strikethrough alongside the
 * running selected-unit-price in a modal.
 *
 * This is dynamic — it must update whenever the user picks a different size or variant.
 *
 * Model B (discountPercent only):
 *   raw base = selected size price (or item.price if no size), then add variant.
 *
 * Model A (originalPrice set, price is already the sale):
 *   raw base = item.originalPrice when no size is involved (sizes have their own prices
 *   and there is no corresponding "original" for each size row).
 *
 * Returns null when there is no discount, or when the raw total equals the discounted total.
 */
export function getSelectedTotalStrikethrough(
  item: MenuItem,
  selectedUnitPrice: number,
  selectedSizePrice?: number | null,
  selectedVariantPrice?: number | null,
): number | null {
  const hasOriginalPrice =
    item.originalPrice != null && item.originalPrice > item.price;
  const hasDiscountPercent =
    item.discountPercent != null && item.discountPercent > 0;
  const variantExtra = selectedVariantPrice ?? 0;

  let rawTotal: number | null = null;

  if (hasDiscountPercent && !hasOriginalPrice) {
    // Model B: discount applies to the base price (size or item)
    const rawBase = selectedSizePrice ?? item.price;
    rawTotal = rawBase + variantExtra;
  } else if (hasOriginalPrice && !selectedSizePrice) {
    // Model A without a size: original total = originalPrice + variant
    rawTotal = (item.originalPrice as number) + variantExtra;
  }

  if (rawTotal === null || rawTotal === selectedUnitPrice) return null;
  return rawTotal;
}
