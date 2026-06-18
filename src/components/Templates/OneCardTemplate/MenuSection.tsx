"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useLocale } from "next-intl";
import type { Category, MenuItem } from "@/types/menu";
import { sortCategories } from "@/lib/menuCategoryOrder";
import { useCurrencyLabel } from "@/lib/useCurrencyLabel";
import { useIsOrderingEnabled } from "@/hooks/useIsOrderingEnabled";
import { useTrackMenuItemClick } from "@/hooks/useTrackMenuItemClick";
import {
  getCartQuantityForMenuItem,
  upsertSkyCartFromMenuItemWithOptions,
  readSkyCartFromCookie,
  subscribeSkyCartUpdated,
  type SkyCart,
} from "@/lib/skyTemplateCart";
import CategoryCircles from "./CategoryCircles";
import OneCardProduct, {
  OneCardProductCard,
  type OneCardCartOptions,
} from "./OneCardProduct";

export type MenuSectionProps = {
  items: MenuItem[];
  categories: Category[];
  currency: string;
};

export default function MenuSection({
  items,
  categories,
  currency,
}: MenuSectionProps) {
  const locale = useLocale() as "ar" | "en";
  const currencyLabel = useCurrencyLabel()(currency);
  const { isOrderingEnabled: isTableOrder } = useIsOrderingEnabled();
  const { trackItem } = useTrackMenuItemClick();

  const sortedCategories = useMemo(
    () => sortCategories(categories),
    [categories],
  );

  const [activeCategoryId, setActiveCategoryId] = useState<number>(
    () => sortedCategories[0]?.id ?? 0,
  );
  const [slideIndex, setSlideIndex] = useState(0);
  const [cart, setCart] = useState<SkyCart>(() =>
    typeof document === "undefined" ? {} : readSkyCartFromCookie(),
  );

  useEffect(() => {
    if (sortedCategories.length === 0) return;
    const hasActive = sortedCategories.some((c) => c.id === activeCategoryId);
    if (!hasActive) {
      setActiveCategoryId(sortedCategories[0].id as number);
    }
  }, [sortedCategories, activeCategoryId]);

  const filteredItems = useMemo(
    () => items.filter((item) => item.categoryId === activeCategoryId),
    [items, activeCategoryId],
  );

  const current = filteredItems[slideIndex] ?? null;
  const total = filteredItems.length;

  useEffect(() => {
    setSlideIndex(0);
  }, [activeCategoryId]);

  useEffect(() => {
    const sync = () => setCart(readSkyCartFromCookie());
    sync();
    return subscribeSkyCartUpdated(sync);
  }, []);

  const trackAt = (index: number) => {
    const item = filteredItems[index];
    if (item?.id) trackItem(item.id);
  };

  const goPrev = () => {
    const next = slideIndex <= 0 ? Math.max(0, total - 1) : slideIndex - 1;
    setSlideIndex(next);
    trackAt(next);
  };

  const goNext = () => {
    const next = slideIndex >= total - 1 ? 0 : slideIndex + 1;
    setSlideIndex(next);
    trackAt(next);
  };

  const handleAddToCart = (
    item: MenuItem,
    quantity: number,
    options?: OneCardCartOptions,
  ) => {
    if (quantity <= 0) return;
    upsertSkyCartFromMenuItemWithOptions(item, quantity, {
      locale,
      size: options?.size ?? null,
      variant: options?.variant ?? null,
    });
    toast.success(
      locale === "ar" ? "تمت الإضافة إلى السلة" : "Added to cart",
    );
  };

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
      <CategoryCircles
        categories={sortedCategories}
        activeCategoryId={activeCategoryId}
        onSelect={setActiveCategoryId}
      />

      <div className="lg:hidden">
        <OneCardProduct
          item={current}
          currencyLabel={currencyLabel}
          isTableOrder={isTableOrder}
          cartQuantity={
            current?.id ? getCartQuantityForMenuItem(cart, current.id) : 0
          }
          slideIndex={slideIndex}
          total={total}
          onPrev={goPrev}
          onNext={goNext}
          onAddToCart={handleAddToCart}
        />
      </div>

      <div className="hidden lg:block">
        {filteredItems.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm font-medium text-zinc-500">
              {locale === "ar"
                ? "لا توجد عناصر في هذا التصنيف."
                : "No items in this category."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4 px-2 xl:gap-5">
            {filteredItems.map((item) => (
              <OneCardProductCard
                key={item.id}
                item={item}
                currencyLabel={currencyLabel}
                isTableOrder={isTableOrder}
                cartQuantity={getCartQuantityForMenuItem(cart, item.id)}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
