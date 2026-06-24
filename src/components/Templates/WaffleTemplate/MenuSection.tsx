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
import { sortCategories } from "@/lib/menuCategoryOrder";
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
import CategoryCards from "./CategoryCards";
import SectionHeader from "./SectionHeader";

import { WaffleProductCard, type WaffleCartOptions } from "./WaffleProduct";

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

  const firstCategoryId = sortedCategories[0]?.id ?? 0;
  const [selectedCategoryId, setSelectedCategoryId] = useState(firstCategoryId);
  const [activeCategoryId, setActiveCategoryId] = useState(firstCategoryId);

  useEffect(() => {
    if (
      sortedCategories.length > 0 &&
      !sortedCategories.some((c) => c.id === activeCategoryId)
    ) {
      const nextId = sortedCategories[0].id;
      setSelectedCategoryId(nextId);
      setActiveCategoryId(nextId);
    }
  }, [sortedCategories, activeCategoryId]);

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

  useEffect(() => {
    return subscribeSkyCartUpdated(() => setCart(readSkyCartFromCookie()));
  }, []);

  const handleAddToCart = useCallback(
    (item: MenuItem, quantity: number, options?: WaffleCartOptions) => {
      if (quantity <= 0) return;
      upsertSkyCartFromMenuItemWithOptions(item, quantity, {
        locale,
        size: options?.size ?? null,
        variant: options?.variant ?? null,
      });
      toast.success(
        locale === "ar" ? "تمت الإضافة إلى السلة" : "Added to cart",
      );
    },
    [locale],
  );

  const renderProduct = (item: MenuItem, index: number) => (
    <WaffleProductCard
      key={item.id}
      item={item}
      currencyLabel={currencyLabel}
      isTableOrder={isTableOrder}
      cartQuantity={getCartQuantityForMenuItem(cart, item.id)}
      onAddToCart={handleAddToCart}
      showBestSeller={index === 0}
    />
  );

  if (!sortedCategories.length) {
    return (
      <section id="menu" className="px-4 py-10 text-center">
        <p className="text-sm text-white/70">
          {locale === "ar" ? "لا توجد تصنيفات بعد." : "No categories yet."}
        </p>
      </section>
    );
  }

  return (
    <section
      id="menu"
      className={`pb-4 ${isTableOrder ? "pb-24" : ""}`}
      aria-label={locale === "ar" ? "قائمة الطعام" : "Food menu"}
    >
      <SectionHeader className="mb-4" />

      <CategoryCards
        categories={sortedCategories}
        activeCategoryId={selectedCategoryId}
        onSelect={handleCategorySelect}
      />

      <div
        className={`mt-5 transition-opacity duration-150 ${isPending ? "pointer-events-none opacity-50" : "opacity-100"}`}
      >
        {initialLoading ? (
          <MenuCatalogSkeleton variant="onecard" count={3} />
        ) : items.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm font-medium text-white/70">
              {locale === "ar"
                ? "لا توجد منتجات في هذا التصنيف."
                : "No items in this category."}
            </p>
          </div>
        ) : (
          <div
            className={"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}
          >
            {items.map((item, index) => renderProduct(item, index))}
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
