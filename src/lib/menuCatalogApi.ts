import { axiosGet } from "@/shared/axiosCall";
import type { Category } from "@/types/menu";
import {
  MENU_BOOTSTRAP_ITEM_CAP,
  MENU_CATALOG_PAGE_SIZE,
  mapCatalogProductToMenuItem,
  type CatalogCategorySummary,
  type MenuCatalogApiResponse,
  type MenuCatalogData,
  type MenuCatalogMeta,
  type MenuCatalogPagination,
} from "@/types/menuCatalog";
import { normalizeMenuItems } from "@/lib/menuItemNormalize";
import type { MenuItem } from "@/types/menu";

export type FetchMenuCatalogParams = {
  page: number;
  pageSize?: number;
  categoryId?: number;
};

export type MenuCatalogFetchResult = {
  items: MenuItem[];
  meta: MenuCatalogMeta;
  categories: CatalogCategorySummary[];
};

function resolveHasMore(
  pagination: MenuCatalogPagination | null | undefined,
  itemCount: number,
  limit: number,
  page: number,
): boolean {
  if (typeof pagination?.hasMore === "boolean") {
    return pagination.hasMore;
  }

  const totalPages = pagination?.totalPages;
  if (typeof totalPages === "number") {
    return page < totalPages;
  }

  const total = pagination?.total;
  if (typeof total === "number") {
    return page * limit < total;
  }

  return itemCount >= limit;
}

function toCatalogMeta(
  pagination: MenuCatalogPagination | null | undefined,
  itemCount: number,
  page: number,
  limit: number,
): MenuCatalogMeta {
  return {
    page,
    limit,
    total: pagination?.total ?? null,
    hasMore: resolveHasMore(pagination, itemCount, limit, page),
  };
}

function parseCatalogPayload(body: MenuCatalogApiResponse | undefined): MenuCatalogData | null {
  if (!body?.data) return null;
  return body.data;
}

export function mergeCatalogCategoryCounts(
  existing: Category[],
  incoming: CatalogCategorySummary[],
): Category[] {
  if (!incoming.length) return existing;

  const counts = new Map(incoming.map((category) => [category.id, category.itemsCount]));

  return existing.map((category) => ({
    ...category,
    itemsCount: counts.get(category.id) ?? category.itemsCount,
  }));
}

export async function fetchMenuCatalog(
  slug: string,
  locale: string,
  params: FetchMenuCatalogParams,
): Promise<MenuCatalogFetchResult | null> {
  const pageSize = params.pageSize ?? MENU_CATALOG_PAGE_SIZE;
  const query: Record<string, unknown> = {
    page: params.page,
    pageSize,
    locale,
  };

  if (params.categoryId != null && params.categoryId > 0) {
    query.categoryId = params.categoryId;
  }

  const response = await axiosGet<MenuCatalogApiResponse>(
    `/public/menu/${slug}/catalog`,
    locale,
    undefined,
    query,
    true,
  );

  if (!response.status) {
    return null;
  }

  const payload = parseCatalogPayload(response.data);
  if (!payload) {
    return null;
  }

  const rawProducts = payload.products ?? [];
  const items = normalizeMenuItems(
    rawProducts.map((product) => mapCatalogProductToMenuItem(product)),
  );

  return {
    items,
    meta: toCatalogMeta(payload.pagination, items.length, params.page, pageSize),
    categories: payload.categories ?? [],
  };
}

/** First catalog page not yet covered by bootstrap items (page 1 when count is 0). */
export function resolveNextCatalogPage(bootstrapItemCount: number): number {
  let page = 1;

  while (page * MENU_CATALOG_PAGE_SIZE <= bootstrapItemCount) {
    page += 1;
  }

  return page;
}

export function resolveBootstrapCatalogMeta(
  itemCount: number,
  totalItems?: number | null,
): MenuCatalogMeta {
  const total = typeof totalItems === "number" ? totalItems : null;
  const hasMore =
    typeof total === "number"
      ? itemCount < total
      : itemCount >= MENU_BOOTSTRAP_ITEM_CAP;

  return {
    page: 0,
    limit: itemCount,
    total,
    hasMore,
  };
}
