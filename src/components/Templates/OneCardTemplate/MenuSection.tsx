"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useLocale } from "next-intl";
import type { Category, MenuItem } from "@/types/menu";
import { sortCategories } from "@/lib/menuCategoryOrder";
import { useCurrencyLabel } from "@/lib/useCurrencyLabel";
import { useIsOrderingEnabled } from "@/hooks/useIsOrderingEnabled";
import {
  getCartQuantityForMenuItem,
  upsertSkyCartFromMenuItemWithOptions,
  readSkyCartFromCookie,
  subscribeSkyCartUpdated,
  type SkyCart,
} from "@/lib/skyTemplateCart";
import CategoryCircles from "./CategoryCircles";
import {
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

  const sortedCategories = useMemo(
    () => sortCategories(categories),
    [categories],
  );

  const [activeCategoryId, setActiveCategoryId] = useState<number>(
    () => sortedCategories[0]?.id ?? 0,
  );
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

  useEffect(() => {
    const sync = () => setCart(readSkyCartFromCookie());
    sync();
    return subscribeSkyCartUpdated(sync);
  }, []);

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
    toast.success(locale === "ar" ? "تمت الإضافة إلى السلة" : "Added to cart");
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

      {filteredItems.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <p className="text-sm font-medium text-zinc-500">
            {locale === "ar"
              ? "لا توجد منتاجاتفي هذا التصنيف."
              : "No items in this category."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 px-2 sm:grid-cols-2 lg:grid-cols-4 xl:gap-5">
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
    </section>
  );
}
