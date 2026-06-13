"use client";

import type { MenuItem } from "@/types/menu";

import type { SkyCartItem } from "@/lib/skyTemplateCart";

import { useArcaneTheme } from "./ArcaneThemeContext";

import ProductMenuCard from "./ProductMenuCard";

type ProductMenuGridProps = {
  items: MenuItem[];

  activeIndex: number;

  isAr: boolean;

  currencyLabel: string;

  isTableOrder: boolean;

  cartById: Record<number, SkyCartItem>;

  onSelect: (index: number) => void;

  onAddToCart: (item: MenuItem, quantity: number) => void;
};

export default function ProductMenuGrid({
  items,

  activeIndex,

  isAr,

  currencyLabel,

  isTableOrder,

  cartById,

  onSelect,

  onAddToCart,
}: ProductMenuGridProps) {
  const { primary } = useArcaneTheme();

  return (
    <section
      className="mt-10 border-t border-[#eeeeee] pt-8 sm:mt-14 sm:pt-10"
      aria-label={isAr ? "عناصر القائمة" : "Menu items"}
    >
      <div
        className={`mb-6 flex items-end justify-between gap-4 sm:mb-8 ${isAr ? "flex-row-reverse" : ""}`}
      >
        <div className={isAr ? "text-end" : ""}>
          <p
            className="text-[10px] font-black uppercase tracking-[0.28em] sm:text-xs sm:tracking-[0.32em]"
            style={{ color: primary }}
          >
            {isAr ? "القائمة الكاملة" : "Full Menu"}
          </p>

          <h3 className="mt-1 font-body text-lg font-black text-arcane-ink sm:text-xl md:text-2xl">
            {isAr ? "جميع الأصناف" : "All Items"}
          </h3>
        </div>

        <span
          className="shrink-0 rounded-full border-2 px-3 py-1 text-[10px] font-black tabular-nums sm:px-3.5 sm:py-1.5 sm:text-xs"
          style={{ borderColor: primary, color: primary }}
        >
          {items.length}
        </span>
      </div>

      <div className="grid grid-cols-1 rid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-5">
        {items.map((item, index) => (
          <ProductMenuCard
            key={item.id}
            item={item}
            isActive={index === activeIndex}
            isAr={isAr}
            currencyLabel={currencyLabel}
            isTableOrder={isTableOrder}
            cartQuantity={cartById[item.id]?.quantity ?? 0}
            onSelect={() => onSelect(index)}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </section>
  );
}
