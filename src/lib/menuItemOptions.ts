import type {
  MenuItem,
  MenuItemSizeOption,
  MenuItemVariantOption,
} from "@/types/menu";

export function getMenuItemSizes(item: MenuItem): MenuItemSizeOption[] {
  if (!Array.isArray(item.sizes)) return [];
  return item.sizes.filter(
    (size) =>
      size &&
      typeof size.price === "number" &&
      Number.isFinite(size.price) &&
      size.price >= 0,
  );
}

export function getMenuItemVariants(item: MenuItem): MenuItemVariantOption[] {
  if (!Array.isArray(item.variants)) return [];
  return item.variants.filter(
    (variant) =>
      variant &&
      typeof variant.price === "number" &&
      Number.isFinite(variant.price) &&
      variant.price >= 0,
  );
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
