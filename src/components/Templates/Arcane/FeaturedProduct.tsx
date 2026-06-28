"use client";

import { type RefObject } from "react";
import { IoCartOutline } from "react-icons/io5";
import type { MenuItem } from "@/types/menu";
import { resolveMenuItemImageSrc } from "@/lib/menuItemImage";
import type { SkyCartItem } from "@/lib/skyTemplateCart";
import { hexToRgba, useArcaneTheme } from "./ArcaneThemeContext";
import LoadImage from "@/components/ImageLoad";
import NavArrow from "./NavArrow";
import SlideProgress from "./SlideProgress";
import { getItemDiscount } from "./menuItemDiscount";

type FeaturedProductProps = {
  featuredRef: RefObject<HTMLDivElement | null>;
  activeCategory: number;
  current: MenuItem | null;
  locale: "ar" | "en";
  categoryLabel: string;
  currencyLabel: string;
  isTableOrder: boolean;
  featuredQty: number;
  setFeaturedQty: (updater: (q: number) => number) => void;
  cartById: Record<number, SkyCartItem>;
  slideIndex: number;
  total: number;
  onViewDetails: () => void;
  onAddToCart: (item: MenuItem, quantity: number) => void;
  onGoPrev: () => void;
  onGoNext: () => void;
};

export default function FeaturedProduct({
  featuredRef,
  activeCategory,
  current,
  locale,
  categoryLabel,
  currencyLabel,
  isTableOrder,
  featuredQty,
  setFeaturedQty,
  cartById,
  slideIndex,
  total,
  onViewDetails,
  onAddToCart,
  onGoPrev,
  onGoNext,
}: FeaturedProductProps) {
  const { primary, secondary } = useArcaneTheme();
  const isAr = locale === "ar";
  const btnGlow = hexToRgba(primary, 0.34);
  const primarySoft = hexToRgba(primary, 0.12);

  const primaryBtnClass =
    "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-[0_10px_28px_-8px_var(--arcane-btn-glow)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_14px_32px_-6px_var(--arcane-btn-glow)] hover:brightness-105 active:translate-y-0 active:scale-[0.98] sm:w-auto sm:px-8 sm:py-4 sm:text-sm";
  const primaryBtnStyle = {
    background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
    ["--arcane-btn-glow" as string]: btnGlow,
  };
  const outlineBtnClass =
    "w-full rounded-full border-2 bg-white/90 px-6 py-3.5 text-xs font-black uppercase tracking-wider backdrop-blur-sm transition-all duration-200 hover:-translate-y-px hover:bg-white hover:shadow-[0_8px_20px_-10px_var(--arcane-btn-glow)] active:scale-[0.98] sm:w-auto sm:px-8 sm:py-4 sm:text-sm";
  const outlineBtnStyle = {
    borderColor: primary,
    color: primary,
    ["--arcane-btn-glow" as string]: btnGlow,
  };

  const name = current ? (isAr ? current.nameAr : current.nameEn) : "";
  const description = current
    ? isAr
      ? current.descriptionAr
      : current.descriptionEn
    : "";
  const { hasDiscount, discountPercent, discountedPrice, strikethroughPrice } =
    current
      ? getItemDiscount(current)
      : {
          hasDiscount: false,
          discountPercent: null as number | null,
          discountedPrice: 0,
          strikethroughPrice: null as number | null,
        };
  const inCartQty = current ? (cartById[current.id]?.quantity ?? 0) : 0;

  return (
    <div ref={featuredRef} className="relative scroll-mt-24 sm:scroll-mt-28">
      <div
        key={`${activeCategory}-${current?.id}`}
        className="grid min-w-0 items-start gap-6 sm:gap-8 lg:grid-cols-2 lg:items-center lg:gap-16"
      >
        <div className={isAr ? "lg:order-2" : "lg:order-1"}>
          <div className="relative mx-auto aspect-4/3 w-full max-w-md overflow-hidden rounded-2xl bg-[#fafafa] shadow-[0_16px_48px_-20px_rgba(17,17,17,0.18)] ring-1 ring-black/[0.04] sm:aspect-[4/5] sm:max-w-none sm:rounded-3xl lg:max-h-[min(65vh,560px)]">
            {current ? (
              <LoadImage
                src={resolveMenuItemImageSrc(current.image)}
                alt={name}
                fill
                width={960}
                height={1200}
                className="object-cover object-center"
                disableLazy
              />
            ) : null}
          </div>
        </div>

        <div
          className={`flex min-w-0 flex-col ${isAr ? " lg:order-1" : "lg:order-2"}`}
        >
          <p
            className="text-xs font-black uppercase tracking-[0.2em] sm:text-sm sm:tracking-[0.25em]"
            style={{ color: primary }}
          >
            {categoryLabel}
          </p>
          <h3 className="mt-2 font-body text-xl font-black leading-tight text-arcane-ink sm:mt-3 sm:text-2xl md:text-3xl lg:text-4xl">
            {name}
          </h3>
          {description ? (
            <p
              className={`mt-3 text-pretty text-sm leading-relaxed text-arcane-muted sm:mt-4 sm:text-base md:text-lg ${isAr ? "ms-0 sm:ms-auto" : ""} max-w-lg`}
            >
              {description}
            </p>
          ) : null}
          <div
            className={`mt-4 sm:mt-6 ${isAr ? "flex flex-col items-end" : ""}`}
          >
            <div
              className={`mb-2 flex flex-wrap items-center gap-2 ${isAr ? "justify-end" : ""}`}
            >
              {hasDiscount && discountPercent ? (
                <span
                  className="inline-flex w-fit rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white sm:px-3.5 sm:py-1.5 sm:text-xs"
                  style={{ backgroundColor: primary }}
                >
                  {isAr ? `${discountPercent}% خصم` : `${discountPercent}% off`}
                </span>
              ) : null}
              {isTableOrder && inCartQty > 0 ? (
                <span
                  className="inline-flex w-fit items-center gap-1.5 rounded-full border-2 px-3 py-1 text-[10px] font-black uppercase tracking-wider sm:px-3.5 sm:py-1.5 sm:text-xs"
                  style={{ borderColor: primary, color: primary }}
                >
                  <IoCartOutline className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {isAr ? `في السلة: ${inCartQty}` : `In cart: ${inCartQty}`}
                </span>
              ) : null}
            </div>
            <div
              className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 ${isAr ? "justify-end" : ""}`}
            >
              {strikethroughPrice ? (
                <span className="text-lg font-semibold tabular-nums text-[#999999] line-through sm:text-xl md:text-2xl">
                  {currencyLabel} {strikethroughPrice}
                </span>
              ) : null}
              <p
                className="font-body text-2xl font-black tabular-nums sm:text-3xl md:text-4xl"
                style={{ color: primary }}
              >
                {currencyLabel} {discountedPrice}
              </p>
            </div>
          </div>

          <div
            className={`mt-6 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-3 ${isAr ? "sm:justify-end" : ""}`}
          >
            <button
              type="button"
              onClick={onViewDetails}
              className={primaryBtnClass}
              style={primaryBtnStyle}
            >
              {isAr ? "عرض التفاصيل" : "View Details"}
            </button>
            {isTableOrder && current ? (
              <div
                className={`flex w-full flex-col gap-2 sm:w-auto ${isAr ? "sm:items-end" : ""}`}
              >
                <div className="flex w-full items-center gap-2.5 sm:w-auto">
                  <div
                    className="flex shrink-0 items-center gap-0.5 rounded-full border-2 bg-[#fafafa] p-0.5 sm:gap-1 sm:p-1"
                    style={{ borderColor: primarySoft }}
                  >
                    <button
                      type="button"
                      className="flex h-9 w-9 items-center justify-center rounded-full text-lg font-black transition-all duration-200 hover:bg-white hover:shadow-sm active:scale-90 sm:h-10 sm:w-10"
                      style={{ color: primary }}
                      onClick={() => setFeaturedQty((q) => Math.max(1, q - 1))}
                      aria-label={isAr ? "تقليل" : "Decrease"}
                    >
                      −
                    </button>
                    <span className="min-w-9 px-1 text-center text-sm font-black tabular-nums text-arcane-ink sm:min-w-10">
                      {featuredQty}
                    </span>
                    <button
                      type="button"
                      className="flex h-9 w-9 items-center justify-center rounded-full text-lg font-black transition-all duration-200 hover:bg-white hover:shadow-sm active:scale-90 sm:h-10 sm:w-10"
                      style={{ color: primary }}
                      onClick={() => setFeaturedQty((q) => q + 1)}
                      aria-label={isAr ? "زيادة" : "Increase"}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onAddToCart(current, featuredQty);
                      setFeaturedQty(() => 1);
                    }}
                    className={`${primaryBtnClass} flex-1 sm:flex-none`}
                    style={primaryBtnStyle}
                  >
                    <IoCartOutline className="h-5 w-5 shrink-0" aria-hidden />
                    {isAr ? "أضف للسلة" : "Add to cart"}
                  </button>
                </div>
              </div>
            ) : null}
            <button
              type="button"
              onClick={onGoNext}
              className={outlineBtnClass}
              style={outlineBtnStyle}
            >
              {isAr ? "التالي ←" : "Next →"}
            </button>
          </div>

          <div
            className={`mt-6 flex items-center justify-between gap-4 ${isAr ? "flex-row-reverse" : ""}`}
          >
            <NavArrow
              direction="prev"
              onClick={onGoPrev}
              label={isAr ? "السابق" : "Previous"}
            />
            <NavArrow
              direction="next"
              onClick={onGoNext}
              label={isAr ? "التالي" : "Next"}
            />
          </div>

          <SlideProgress slideIndex={slideIndex} total={total} isAr={isAr} />
        </div>
      </div>
    </div>
  );
}
