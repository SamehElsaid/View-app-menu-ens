import {
  getMenuItemMinPrice,
  getMenuItemSizes,
  getMenuItemVariants,
} from "@/lib/menuItemOptions";
import type { AiMenuCatalogItem } from "@/types/aiOrder";
import type { MenuItem } from "@/types/menu";

/** Build the lightweight catalog payload sent to n8n for every chat turn. */
export function buildAiMenuCatalog(menuItems: MenuItem[]): AiMenuCatalogItem[] {
  return menuItems.map((item) => {
    const sizes = getMenuItemSizes(item).map((size) => ({
      nameAr: size.nameAr,
      nameEn: size.nameEn,
      price: size.price,
    }));
    const variants = getMenuItemVariants(item).map((variant) => ({
      labelAr: variant.labelAr,
      labelEn: variant.labelEn,
      price: variant.price,
    }));

    return {
      id: item.id,
      nameAr: item.nameAr ?? item.name ?? "",
      nameEn: item.nameEn ?? item.name ?? "",
      price: item.price,
      minPrice: getMenuItemMinPrice(item),
      categoryId: item.categoryId ?? 0,
      categoryNameAr: item.categoryNameAr ?? item.categoryName ?? "",
      categoryNameEn: item.categoryNameEn ?? item.categoryName ?? "",
      available: item.available !== false,
      sizes,
      variants,
    };
  });
}
