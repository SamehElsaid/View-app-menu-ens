"use client";

import { useMemo } from "react";
import { useLocale } from "next-intl";
import type { Category, MenuItem } from "@/types/menu";
import { useCurrencyLabel } from "@/lib/useCurrencyLabel";
import { sortMenuItems } from "@/lib/menuCategoryOrder";
import { useCoffee } from "./CoffeeContext";
import { useCoffeeTheme } from "./CoffeeThemeContext";
import MenuCard from "./MenuCard";

export type ProductGridProps = {
  items: MenuItem[];
  categories: Category[];
  currency: string;
};

export default function ProductGrid({
  items,
  categories,
  currency,
}: ProductGridProps) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const { activeCategoryId, isTableOrder, cartById, addToCart } = useCoffee();
  const { colors, primary } = useCoffeeTheme();
  const currencyLabel = useCurrencyLabel()(currency);

  const filteredItems = useMemo(() => {
    const base =
      activeCategoryId == null
        ? items
        : items.filter((item) => item.categoryId === activeCategoryId);
    return sortMenuItems(base);
  }, [items, activeCategoryId]);

  const activeCategory = categories.find((c) => c.id === activeCategoryId);
  const sectionTitle =
    activeCategoryId == null
      ? ""
      : isAr
        ? activeCategory?.nameAr?.trim() || activeCategory?.name?.trim() || ""
        : activeCategory?.nameEn?.trim() || activeCategory?.name?.trim() || "";

  if (!items.length) {
    return (
      <div className="py-16 text-center">
        <p className="text-base" style={{ color: colors.textMuted }}>
          {isAr
            ? "لا توجد منتاجاتفي القائمة حالياً"
            : "No menu items available"}
        </p>
      </div>
    );
  }

  return (
    <section
      id="retro-menu-products"
      className="scroll-mt-[calc(var(--retro-nav-offset)+3.5rem)]"
      aria-labelledby="retro-menu-heading"
    >
      {sectionTitle ? (
        <header className="mb-6 text-center sm:mb-10">
          <h2
            id="retro-menu-heading"
            className="font-serif text-xl font-bold tracking-tight sm:text-3xl"
            style={{ color: primary }}
          >
            {sectionTitle}
          </h2>
          <div
            className="mx-auto mt-3 h-0.5 w-12 rounded-full"
            style={{ backgroundColor: primary }}
            aria-hidden
          />
        </header>
      ) : null}

      {filteredItems.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-base" style={{ color: colors.textMuted }}>
            {isAr ? "لا توجد منتاجاتفي هذا القسم" : "No items in this category"}
          </p>
        </div>
      ) : (
        <div className="mx-auto grid max-w-[300px] grid-cols-1 gap-3 sm:max-w-none sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          {filteredItems.map((item, index) => (
            <MenuCard
              key={item.id}
              item={item}
              index={index}
              currencyLabel={currencyLabel}
              isTableOrder={isTableOrder}
              cartQuantity={cartById[item.id]?.quantity ?? 0}
              onAddToCart={addToCart}
            />
          ))}
        </div>
      )}
    </section>
  );
}
