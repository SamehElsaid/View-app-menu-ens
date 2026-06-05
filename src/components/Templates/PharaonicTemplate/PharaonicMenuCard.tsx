"use client";

import { useState, type MouseEvent } from "react";
import { useLocale } from "next-intl";
import { IoCartOutline } from "react-icons/io5";
import type { MenuItem } from "@/types/menu";
import LoadImage from "@/components/ImageLoad";
import {
  usePharaonicTheme,
  hexToRgba,
  shadowGlow,
} from "./PharaonicThemeContext";
import { useInViewReveal } from "./useInViewReveal";
import {
  usePharaonicTouchDevice,
  pharaonicHaptic,
} from "./usePharaonicTouchDevice";

type PharaonicMenuCardProps = {
  item: MenuItem;
  idx: number;
  onOpen: (item: MenuItem) => void;
  currencyLabel: string;
  isTableOrder: boolean;
  cartQuantity: number;
  onAddToCart: (item: MenuItem, quantity: number) => void;
};

export default function PharaonicMenuCard({
  item,
  idx,
  onOpen,
  currencyLabel,
  isTableOrder,
  cartQuantity,
  onAddToCart,
}: PharaonicMenuCardProps) {
  const locale = useLocale();
  const { primary, secondary } = usePharaonicTheme();
  const isTouch = usePharaonicTouchDevice();
  const [cardPickQty, setCardPickQty] = useState(1);
  const { ref, visible } = useInViewReveal<HTMLDivElement>();

  const name = locale === "ar" ? item.nameAr : item.nameEn;
  const desc = locale === "ar" ? item.descriptionAr : item.descriptionEn;
  const catLabel = locale === "ar" ? item.categoryNameAr : item.categoryNameEn;
  const inCart = cartQuantity > 0;

  const openDetails = () => {
    if (isTouch) pharaonicHaptic(8);
    onOpen(item);
  };

  const handleAdd = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onAddToCart(item, cardPickQty);
    setCardPickQty(1);
    if (isTouch) pharaonicHaptic([10, 28, 10]);
  };

  const defaultShadow = `0 8px 28px rgba(0,0,0,0.32), inset 0 0 0 1px ${hexToRgba(primary, 0.15)}`;
  const hoverShadow = `0 18px 42px rgba(0,0,0,0.45), 0 0 28px ${hexToRgba(primary, 0.18)}`;

  return (
    <article
      ref={ref}
      className={`ph-menu-card ph-card-reveal group relative flex h-full flex-col overflow-hidden rounded-lg border transition-[box-shadow,transform] duration-300 hover:-translate-y-1 motion-reduce:opacity-100 motion-reduce:hover:translate-y-0 max-md:active:scale-[0.99] ${
        visible ? "is-visible" : ""
      } ${inCart ? "ph-menu-card--in-cart" : ""}`}
      style={{
        borderColor: inCart
          ? hexToRgba(primary, 0.55)
          : hexToRgba(primary, 0.28),
        background:
          "linear-gradient(180deg, rgba(26,20,14,0.98) 0%, rgba(12,10,8,1) 100%)",
        boxShadow: inCart
          ? `${shadowGlow(primary, 24, 0.3)}, ${defaultShadow}`
          : defaultShadow,
        transitionDelay: visible ? `${(idx % 6) * 80}ms` : undefined,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = inCart
          ? `${shadowGlow(primary, 28, 0.38)}, ${hoverShadow}`
          : hoverShadow;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = inCart
          ? `${shadowGlow(primary, 24, 0.3)}, ${defaultShadow}`
          : defaultShadow;
      }}
    >
      <div className="ph-card-shimmer pointer-events-none absolute inset-0 z-2" aria-hidden />

      <button
        type="button"
        className="relative flex flex-1 flex-col text-start"
        onClick={openDetails}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden md:aspect-[5/4]">
          <LoadImage
            src={item.image ?? ""}
            alt={name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(12,10,8,0.88) 0%, rgba(12,10,8,0.15) 45%, transparent 100%)",
            }}
          />

          {item.discountPercent ? (
            <span
              className="absolute top-3 end-3 rounded-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0c0a08]"
              style={{ background: primary }}
            >
              {locale === "ar"
                ? `${item.discountPercent}٪ خصم`
                : `${item.discountPercent}% off`}
            </span>
          ) : null}

          {inCart ? (
            <span
              className="absolute top-3 start-3 flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-[11px] font-bold text-[#0c0a08] shadow-md"
              style={{
                background: `linear-gradient(135deg, ${primary}, ${secondary})`,
              }}
            >
              {cartQuantity}
            </span>
          ) : null}

          <div className="absolute bottom-3 start-3 end-3 flex items-end justify-between gap-2">
            <span
              className="line-clamp-1 text-[10px] uppercase tracking-[0.22em]"
              style={{ color: secondary }}
            >
              {catLabel}
            </span>
            <span className="shrink-0 text-end">
              <span
                className="block text-lg font-bold leading-none md:text-xl"
                style={{ color: primary }}
              >
                {item.price}
              </span>
              <span className="text-[10px] tracking-wide text-[#c4b59a]/90">
                {currencyLabel}
              </span>
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4 pt-3 md:p-5 md:pt-4">
          <h4 className="mb-2 line-clamp-2 text-base font-semibold leading-snug text-[#f5e6c8] md:text-lg">
            {name}
          </h4>
          {desc ? (
            <p className="line-clamp-2 text-sm leading-relaxed text-[#b8a990] md:line-clamp-3">
              {desc}
            </p>
          ) : (
            <p className="text-sm italic text-[#8a7d68]/60">
              {locale === "ar" ? "اضغط لعرض التفاصيل" : "Tap for details"}
            </p>
          )}
        </div>
      </button>

      {isTableOrder ? (
        <div
          className="relative z-3 shrink-0 border-t px-4 py-3 md:px-5 md:py-3.5"
          style={{
            borderColor: hexToRgba(primary, 0.22),
            background: hexToRgba(primary, 0.04),
          }}
          onClick={(e) => e.stopPropagation()}
          role="group"
          aria-label={locale === "ar" ? "إضافة للسلة" : "Add to cart"}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex shrink-0 items-center rounded-md border"
              style={{ borderColor: hexToRgba(primary, 0.35) }}
            >
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center text-[#e8dcc8] transition hover:bg-white/5 md:h-9 md:w-9"
                onClick={(e) => {
                  e.stopPropagation();
                  setCardPickQty((q) => Math.max(1, q - 1));
                }}
                aria-label={locale === "ar" ? "تقليل" : "Decrease"}
              >
                −
              </button>
              <span className="min-w-7 text-center text-sm font-semibold text-[#f5e6c8]">
                {cardPickQty}
              </span>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center text-[#e8dcc8] transition hover:bg-white/5 md:h-9 md:w-9"
                onClick={(e) => {
                  e.stopPropagation();
                  setCardPickQty((q) => q + 1);
                }}
                aria-label={locale === "ar" ? "زيادة" : "Increase"}
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-md px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#0c0a08] transition active:scale-[0.98] md:min-h-9 md:text-xs"
              style={{
                background: `linear-gradient(135deg, ${primary}, ${secondary})`,
              }}
            >
              <IoCartOutline className="h-4 w-4 shrink-0" aria-hidden />
              <span className="truncate">
                {locale === "ar" ? "أضف" : "Add"}
              </span>
            </button>
          </div>

          {inCart ? (
            <p
              className="mt-2 text-center text-[11px] font-medium md:text-start"
              style={{ color: hexToRgba(primary, 0.9) }}
            >
              {locale === "ar"
                ? `في السلة: ${cartQuantity}`
                : `In cart: ${cartQuantity}`}
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
