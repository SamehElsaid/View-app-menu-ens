import type { MenuItem, MenuItemSizeOption, MenuItemVariantOption } from "@/types/menu";

export type MenuCatalogMeta = {
  total: number | null;
  hasMore: boolean;
  limit: number;
  page: number;
};

export type MenuCatalogPagination = {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasMore?: boolean;
};

export type CatalogProduct = {
  id: number;
  price: number;
  image?: string | null;
  sortOrder?: number;
  name: string;
  nameAr: string;
  nameEn: string;
  description?: string | null;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  categoryId: number;
  categoryName: string;
  categoryNameAr: string;
  categoryNameEn: string;
  originalPrice?: number | null;
  discountPercent?: number | null;
  sizes?: MenuItemSizeOption[] | null;
  variants?: MenuItemVariantOption[] | null;
};

export type CatalogCategorySummary = {
  id: number;
  image?: string | null;
  sortOrder?: number;
  name: string;
  nameAr?: string;
  nameEn?: string;
  itemsCount?: number;
};

export type MenuCatalogData = {
  menuId?: number;
  slug?: string;
  locale?: string;
  currency?: string;
  categories?: CatalogCategorySummary[];
  products: CatalogProduct[];
  filters?: {
    categoryId?: number | null;
  };
  pagination?: MenuCatalogPagination | null;
};

export type MenuCatalogApiResponse = {
  success?: boolean;
  data?: MenuCatalogData;
};

export const MENU_BOOTSTRAP_ITEM_CAP = 50;
export const MENU_CATALOG_PAGE_SIZE = 30;
/** How far below the viewport (in viewport heights) prefetch begins. */
export const MENU_CATALOG_PREFETCH_VIEWPORT_MULTIPLIER = 2.75;
/** Minimum prefetch zone in px (~2–3 screens on mobile). */
export const MENU_CATALOG_PREFETCH_MIN_PX = 1200;

export function mapCatalogProductToMenuItem(product: CatalogProduct): MenuItem {
  return {
    id: product.id,
    name: product.name,
    nameAr: product.nameAr,
    nameEn: product.nameEn,
    description: product.description ?? null,
    descriptionAr: product.descriptionAr ?? null,
    descriptionEn: product.descriptionEn ?? null,
    price: product.price,
    image: product.image ?? null,
    category: product.categoryName,
    categoryId: product.categoryId,
    categoryName: product.categoryName,
    categoryNameAr: product.categoryNameAr,
    categoryNameEn: product.categoryNameEn,
    originalPrice: product.originalPrice ?? null,
    discountPercent: product.discountPercent ?? null,
    available: true,
    sortOrder: product.sortOrder ?? 0,
    sizes: product.sizes ?? null,
    variants: product.variants ?? null,
  };
}
