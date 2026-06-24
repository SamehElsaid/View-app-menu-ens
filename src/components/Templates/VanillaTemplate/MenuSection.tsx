"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { toast } from "react-toastify";
import { useLocale } from "next-intl";
import type { Category, MenuItem } from "@/types/menu";
import { buildCategorySections, sortCategories } from "@/lib/menuCategoryOrder";
import { useCurrencyLabel } from "@/lib/useCurrencyLabel";
import { useIsOrderingEnabled } from "@/hooks/useIsOrderingEnabled";
import { useMenuCatalogPagination } from "@/hooks/useMenuCatalogPagination";
import MenuCatalogSentinel from "@/components/Global/MenuCatalogSentinel";
import MenuCatalogSkeleton from "@/components/Global/MenuCatalogSkeleton";
import {
  getCartQuantityForMenuItem,
  upsertSkyCartFromMenuItemWithOptions,
  readSkyCartFromCookie,
  subscribeSkyCartUpdated,
  type SkyCart,
} from "@/lib/skyTemplateCart";
import { ONECARD_PRODUCT_GRID } from "../OneCardTemplate/OneCardLayout";
import CategoryCards from "./CategoryCards";
import {
  VanillaProductCard,
  type VanillaCartOptions,
} from "./VanillaProduct";

export type MenuSectionProps = {
  categories: Category[];
  currency: string;
};

export default function MenuSection({
  categories,
  currency,
}: MenuSectionProps) {
  const locale = useLocale() as "ar" | "en";
  const currencyLabel = useCurrencyLabel()(currency);
  const { isOrderingEnabled: isTableOrder } = useIsOrderingEnabled();
  const [isPending, startTransition] = useTransition();

  const sortedCategories = useMemo(
    () => sortCategories(categories),
    [categories],
  );

  const [selectedCategoryId, setSelectedCategoryId] = useState(0);
  const [activeCategoryId, setActiveCategoryId] = useState(0);

  const handleCategorySelect = useCallback((id: number) => {
    setSelectedCategoryId(id);
    startTransition(() => {
      setActiveCategoryId(id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { items, initialLoading, loadingMore, hasMore, sentinelRef } =
    useMenuCatalogPagination(activeCategoryId);

  const [cart, setCart] = useState<SkyCart>(() =>
    typeof document === "undefined" ? {} : readSkyCartFromCookie(),
  );

  const categorySections = useMemo(
    () => buildCategorySections(sortedCategories, items),
    [sortedCategories, items],
  );

  useEffect(() => {
    return subscribeSkyCartUpdated(() => setCart(readSkyCartFromCookie()));
  }, []);

  const handleAddToCart = useCallback(
    (item: MenuItem, quantity: number, options?: VanillaCartOptions) => {
      if (quantity <= 0) return;
      upsertSkyCartFromMenuItemWithOptions(item, quantity, {
        locale,
        size: options?.size ?? null,
        variant: options?.variant ?? null,
      });
      toast.success(locale === "ar" ? "تمت الإضافة إلى السلة" : "Added to cart");
    },
    [locale],
  );

  const renderProduct = (item: MenuItem) => (
    <VanillaProductCard
      key={item.id}
      item={item}
      currencyLabel={currencyLabel}
      isTableOrder={isTableOrder}
      cartQuantity={getCartQuantityForMenuItem(cart, item.id)}
      onAddToCart={handleAddToCart}
    />
  );

  if (!sortedCategories.length) {
    return (
      <section id="menu" className="px-4 py-10 text-center">
        <p className="text-sm text-zinc-500">
          {locale === "ar" ? "لا توجد تصنيفات بعد." : "No categories yet."}
        </p>
      </section>
    );
  }

  return (
    <section
      id="menu"
      className={`pb-6 ${isTableOrder ? "pb-24" : ""}`}
      aria-label={locale === "ar" ? "قائمة الطعام" : "Food menu"}
    >
      <CategoryCards
        categories={sortedCategories}
        activeCategoryId={selectedCategoryId}
        onSelect={handleCategorySelect}
        showAll
      />

      <div
        className={`mt-5 transition-opacity duration-150 ${isPending ? "opacity-50 pointer-events-none" : "opacity-100"}`}
      >
        {activeCategoryId === 0 ? (
          categorySections.length > 0 ? (
            <div className={`${ONECARD_PRODUCT_GRID} px-1 sm:px-2`}>
              {categorySections.map((section) => (
                <div key={section.categoryId} className="contents">
                  {section.items.map((item) => renderProduct(item))}
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-12 text-center">
              <p className="text-sm font-medium text-zinc-500">
                {locale === "ar" ? "لا توجد منتجات بعد." : "No items yet."}
              </p>
            </div>
          )
        ) : initialLoading ? (
          <MenuCatalogSkeleton variant="onecard" count={6} />
        ) : items.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm font-medium text-zinc-500">
              {locale === "ar"
                ? "لا توجد منتجات في هذا التصنيف."
                : "No items in this category."}
            </p>
          </div>
        ) : (
          <div className={`${ONECARD_PRODUCT_GRID} px-1 sm:px-2`}>
            {items.map((item) => renderProduct(item))}
          </div>
        )}
      </div>

      <MenuCatalogSentinel
        sentinelRef={sentinelRef}
        loadingMore={loadingMore}
        hasMore={hasMore}
        skeletonVariant="onecard"
      />
    </section>
  );
}
