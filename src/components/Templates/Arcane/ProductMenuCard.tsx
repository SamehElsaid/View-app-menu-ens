"use client";

import { useState, type MouseEvent } from "react";
import { IoCartOutline } from "react-icons/io5";
import type { MenuItem } from "@/types/menu";
import { hexToRgba, useArcaneTheme } from "./ArcaneThemeContext";
import LoadImage from "@/components/ImageLoad";
import { getItemDiscount } from "./menuItemDiscount";

type ProductMenuCardProps = {
  item: MenuItem;
  isActive: boolean;
  isAr: boolean;
  currencyLabel: string;
  isTableOrder: boolean;
  cartQuantity: number;
  onSelect: () => void;
  onAddToCart: (item: MenuItem, quantity: number) => void;
};

export default function ProductMenuCard({
  item,
  isActive,
  isAr,
  currencyLabel,
  isTableOrder,
  cartQuantity,
  onSelect,
  onAddToCart,
}: ProductMenuCardProps) {
  const { primary, secondary } = useArcaneTheme();
  const [pickQty, setPickQty] = useState(1);
  const name = isAr ? item.nameAr : item.nameEn;
  const { hasDiscount, discountPercent, discountedPrice, strikethroughPrice } =
    getItemDiscount(item);
  const inCart = cartQuantity > 0;
  const btnGlow = hexToRgba(primary, 0.3);
  const primarySoft = hexToRgba(primary, 0.12);
  const isHighlighted = isActive || inCart;

  const handleAdd = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onAddToCart(item, pickQty);
    setPickQty(1);
  };

  return (
    <article
      className={`flex flex-col justify-between group overflow-hidden rounded-2xl bg-white text-start ring-1 ring-black/4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-18px_rgba(17,17,17,0.2)] ${
        isHighlighted
          ? "border-2 shadow-[0_12px_32px_-16px_var(--arcane-card-glow)]"
          : "border border-[#eeeeee] hover:border-[#dddddd] shadow-[0_8px_24px_-16px_rgba(17,17,17,0.12)]"
      }`}
      style={
        isHighlighted
          ? {
              borderColor: primary,
              ["--arcane-card-glow" as string]: btnGlow,
            }
          : undefined
      }
    >
      <button
        type="button"
        onClick={onSelect}
        aria-current={isActive ? "true" : undefined}
        className="block w-full text-start"
      >
        <div className="relative aspect-square overflow-hidden bg-[#fafafa]">
          <LoadImage
            src={item.image ?? ""}
            alt={name}
            fill
            disableLazy
            height={600}
            width={600}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {hasDiscount && discountPercent ? (
            <span
              className="absolute start-2 top-2 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white shadow-sm sm:px-3"
              style={{ backgroundColor: primary }}
            >
              {isAr ? `${discountPercent}%` : `-${discountPercent}%`}
            </span>
          ) : null}
          {inCart ? (
            <span
              className="absolute end-2 top-2 flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-[11px] font-black text-white shadow-sm ring-2 ring-white"
              style={{ backgroundColor: primary }}
            >
              {cartQuantity}
            </span>
          ) : null}
          {isActive ? (
            <span
              className="absolute inset-x-0 bottom-0 h-1"
              style={{ backgroundColor: primary }}
              aria-hidden
            />
          ) : null}
        </div>
        <div className="p-3 sm:p-4">
          <h4 className="line-clamp-2 font-body text-sm font-black leading-snug text-arcane-ink sm:text-base">
            {name}
          </h4>
          <div
            className={`mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 ${isAr ? "justify-end" : ""}`}
          >
            {strikethroughPrice ? (
              <span className="text-xs font-semibold tabular-nums text-[#999999] line-through">
                {currencyLabel} {strikethroughPrice}
              </span>
            ) : null}
            <span
              className="text-sm font-black tabular-nums sm:text-base"
              style={{ color: primary }}
            >
              {currencyLabel} {discountedPrice}
            </span>
          </div>
        </div>
      </button>

      {isTableOrder ? (
        <div
          className="flex items-center gap-2 border-t border-[#f0f0f0] bg-[#fafafa]/80 px-3 py-2.5 sm:gap-2.5 sm:px-4 sm:py-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="flex shrink-0 items-center gap-0.5 rounded-full border-2 bg-white p-0.5"
            style={{ borderColor: primarySoft }}
          >
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-black transition-all duration-200 hover:bg-[#fafafa] active:scale-90 sm:h-8 sm:w-8"
              style={{ color: primary }}
              onClick={() => setPickQty((q) => Math.max(1, q - 1))}
              aria-label={isAr ? "تقليل" : "Decrease"}
            >
              −
            </button>
            <span className="min-w-6 px-0.5 text-center text-xs font-black tabular-nums text-arcane-ink sm:min-w-7 sm:text-sm">
              {pickQty}
            </span>
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-black transition-all duration-200 hover:bg-[#fafafa] active:scale-90 sm:h-8 sm:w-8"
              style={{ color: primary }}
              onClick={() => setPickQty((q) => q + 1)}
              aria-label={isAr ? "زيادة" : "Increase"}
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-black uppercase tracking-wide text-white shadow-[0_8px_20px_-8px_var(--arcane-btn-glow)] transition-all duration-200 hover:-translate-y-px hover:brightness-105 active:scale-[0.98] sm:px-4 sm:py-2.5 sm:text-xs"
            style={{
              background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
              ["--arcane-btn-glow" as string]: btnGlow,
            }}
          >
            <IoCartOutline className="h-4 w-4 shrink-0" aria-hidden />
            {isAr ? "أضف" : "Add"}
          </button>
        </div>
      ) : null}
    </article>
  );
}
