import type {
  MenuItem,
  MenuItemSizeOption,
  MenuItemVariantOption,
} from "@/types/menu";

function toFiniteNumber(val: unknown): number | null {
  const n = Number(val);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function getMenuItemSizes(item: MenuItem): MenuItemSizeOption[] {
  if (!Array.isArray(item.sizes)) return [];
  const result: MenuItemSizeOption[] = [];
  for (const size of item.sizes) {
    if (!size) continue;
    const price = toFiniteNumber(size.price);
    if (price === null) continue;
    result.push({ ...size, price });
  }
  return result;
}

export function getMenuItemVariants(item: MenuItem): MenuItemVariantOption[] {
  if (!Array.isArray(item.variants)) return [];
  const result: MenuItemVariantOption[] = [];
  for (const variant of item.variants) {
    if (!variant) continue;
    const price = toFiniteNumber(variant.price);
    if (price === null) continue;
    result.push({ ...variant, price });
  }
  return result;
}

export function hasMenuItemOptions(item: MenuItem): boolean {
  return (
    getMenuItemSizes(item).length > 0 || getMenuItemVariants(item).length > 0
  );
}

export function getMenuItemMinPrice(item: MenuItem): number {
  const sizes = getMenuItemSizes(item);
  const variants = getMenuItemVariants(item);
  const variantMin = variants.length
    ? Math.min(...variants.map((variant) => variant.price))
    : 0;

  if (sizes.length) {
    return Math.min(...sizes.map((size) => size.price)) + variantMin;
  }

  return item.price + variantMin;
}

export function computeMenuItemUnitPrice(
  item: MenuItem,
  size?: MenuItemSizeOption | null,
  variant?: MenuItemVariantOption | null,
): number {
  const basePrice = size?.price ?? item.price;
  return basePrice + (variant?.price ?? 0);
}

export function pickSizeLabel(
  size: MenuItemSizeOption,
  locale: string,
): string {
  return locale === "ar" ? size.nameAr || size.nameEn : size.nameEn || size.nameAr;
}

export function pickVariantLabel(
  variant: MenuItemVariantOption,
  locale: string,
): string {
  return locale === "ar"
    ? variant.labelAr || variant.labelEn
    : variant.labelEn || variant.labelAr;
}
