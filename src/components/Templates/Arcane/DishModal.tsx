"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { IoCartOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import type { MenuItem } from "@/types/menu";
import { resolveMenuItemImageSrc } from "@/lib/menuItemImage";
import { useArcaneTheme, hexToRgba } from "./ArcaneThemeContext";
import LoadImage from "@/components/ImageLoad";
import {
  SKY_CART_UPDATED_EVENT,
  readSkyCartFromCookie,
  upsertSkyCartQuantityFromMenuItem,
} from "@/lib/skyTemplateCart";
import { useTableCartAllowed } from "@/hooks/useTableCartAllowed";

type DishModalProps = {
  dish: MenuItem | null;
  onClose: () => void;
  currencyLabel: string;
};

export default function DishModal({
  dish,
  onClose,
  currencyLabel,
}: DishModalProps) {
  const locale = useLocale() as "ar" | "en";
  const { primary, secondary } = useArcaneTheme();
  const searchParams = useSearchParams();
  const tableCartAllowed = useTableCartAllowed();
  const isTableOrder =
    Boolean(searchParams.get("table")?.trim()) && tableCartAllowed;
  const [selectedQty, setSelectedQty] = useState(1);
  const [inCartQty, setInCartQty] = useState(0);

  useEffect(() => {
    document.body.style.overflow = dish ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [dish]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    if (!dish) return;
    setSelectedQty(1);
    const sync = () => {
      const c = readSkyCartFromCookie();
      setInCartQty(c[dish.id]?.quantity ?? 0);
    };
    sync();
    window.addEventListener(SKY_CART_UPDATED_EVENT, sync);
    return () => window.removeEventListener(SKY_CART_UPDATED_EVENT, sync);
  }, [dish]);

  if (!dish) return null;

  const isAr = locale === "ar";
  const dishName = isAr ? dish.nameAr : dish.nameEn;
  const dishDescription = isAr ? dish.descriptionAr : dish.descriptionEn;
  const hasDiscount =
    dish.originalPrice != null && dish.originalPrice > dish.price;

  const backdrop = hexToRgba(primary, 0.45);
  const modalShadow = `0 24px 80px ${hexToRgba(primary, 0.2)}, 0 8px 24px rgba(0,0,0,0.12)`;
  const imageBg = hexToRgba(primary, 0.06);
  const divider = hexToRgba(secondary, 0.55);

  const handleAddToCart = () => {
    upsertSkyCartQuantityFromMenuItem(dish, selectedQty);
    setSelectedQty(1);
    toast.success(
      isAr
        ? `تمت إضافة ${selectedQty} إلى السلة`
        : `Added ${selectedQty} to cart`,
    );
  };

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="arcane-detail-title"
      className="fixed inset-0 z-100000 flex items-end justify-center p-0 motion-reduce:animate-none sm:items-center sm:p-4 sm:pb-[max(1rem,env(safe-area-inset-bottom))]"
      onClick={onClose}
    >
      <div
        className="absolute inset-0 animate-fade-in backdrop-blur-base motion-reduce:animate-none"
        style={{ backgroundColor: backdrop }}
        aria-hidden
      />

      <div
        className="relative flex max-h-[min(90dvh,680px)] w-full max-w-[600px] animate-scale-in flex-col overflow-hidden rounded-t-[1.35rem] bg-white motion-reduce:animate-none sm:max-h-[min(86dvh,640px)] sm:rounded-3xl"
        style={{ boxShadow: modalShadow }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-stone-300 sm:hidden"
          aria-hidden
        />

        <div
          className="relative h-36 shrink-0 overflow-hidden sm:h-44 md:h-52"
          style={{ backgroundColor: imageBg }}
        >
          <LoadImage
            src={resolveMenuItemImageSrc(dish.image)}
            alt={dishName}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/45 via-black/5 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            className="absolute end-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-stone-700 shadow-md backdrop-blur-md transition-all hover:scale-105 hover:bg-white sm:h-10 sm:w-10"
            aria-label={isAr ? "إغلاق" : "Close"}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden
            >
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
          {dish.discountPercent ? (
            <span
              className="absolute start-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md sm:px-3.5 sm:py-1.5 sm:text-[11px]"
              style={{ backgroundColor: primary }}
            >
              {isAr
                ? `${dish.discountPercent}% خصم`
                : `${dish.discountPercent}% off`}
            </span>
          ) : null}
          <div className="absolute start-3 end-3 bottom-3 hidden max-w-full items-center gap-2 rounded-2xl bg-white/95 px-4 py-2.5 shadow-lg backdrop-blur-md sm:end-4 sm:bottom-4 sm:start-auto sm:flex sm:gap-3 sm:px-5 sm:py-3">
            {hasDiscount ? (
              <span className="text-sm font-semibold text-stone-400 line-through tabular-nums sm:text-lg">
                {dish.originalPrice} {currencyLabel}
              </span>
            ) : null}
            <span
              className="text-2xl font-extrabold tracking-tight tabular-nums sm:text-3xl"
              style={{ color: primary }}
            >
              {dish.price}
            </span>
            <span
              className="text-sm font-semibold opacity-70 sm:text-base"
              style={{ color: primary }}
            >
              {currencyLabel}
            </span>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5 md:px-7 md:py-6">
            <h4
              id="arcane-detail-title"
              className="mb-2 font-body text-lg font-bold text-balance text-stone-900 sm:mb-3 sm:text-xl md:text-2xl"
            >
              {dishName}
            </h4>

            <div className="mb-4 flex flex-wrap items-end justify-between gap-2 rounded-xl border border-stone-100 bg-stone-50/80 px-3 py-2.5 sm:hidden">
              {hasDiscount ? (
                <span className="text-xs font-semibold text-stone-400 line-through tabular-nums">
                  {dish.originalPrice} {currencyLabel}
                </span>
              ) : null}
              <div className="flex items-baseline gap-1.5">
                <span
                  className="text-xl font-extrabold tabular-nums"
                  style={{ color: primary }}
                >
                  {dish.price}
                </span>
                <span
                  className="text-xs font-semibold opacity-70"
                  style={{ color: primary }}
                >
                  {currencyLabel}
                </span>
              </div>
            </div>

            {dishDescription ? (
              <p className="mb-4 w-full text-pretty text-sm leading-relaxed wrap-break-word text-stone-500 sm:mb-5 sm:text-base sm:leading-[1.7]">
                {dishDescription}
              </p>
            ) : null}

            <div
              className="mb-4 h-0.5 w-10 rounded-full"
              style={{ backgroundColor: divider }}
            />

            {dish.allergens && dish.allergens.length > 0 ? (
              <div className="mb-4 flex flex-wrap gap-2 sm:mb-6">
                {dish.allergens.map((a: string) => (
                  <span
                    key={a}
                    className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 sm:px-3 sm:py-1.5 sm:text-sm"
                  >
                    {a}
                  </span>
                ))}
              </div>
            ) : null}

            {isTableOrder ? (
              <div className="space-y-2">
                <div className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-stone-50/80 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4">
                  <div className="flex items-center justify-center gap-2 sm:order-2">
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-stone-300 text-lg font-bold text-stone-700"
                      onClick={() => setSelectedQty((q) => Math.max(1, q - 1))}
                      aria-label={isAr ? "تقليل" : "Decrease"}
                    >
                      −
                    </button>
                    <span className="min-w-9 text-center text-base font-semibold text-stone-800">
                      {selectedQty}
                    </span>
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-stone-300 text-lg font-bold text-stone-700"
                      onClick={() => setSelectedQty((q) => q + 1)}
                      aria-label={isAr ? "زيادة" : "Increase"}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:order-1 sm:w-auto sm:py-2.5 sm:text-base"
                    style={{
                      background: `linear-gradient(to bottom right, ${primary}, ${secondary})`,
                    }}
                  >
                    <IoCartOutline className="h-5 w-5 shrink-0" aria-hidden />
                    {isAr ? "أضف إلى السلة" : "Add to cart"}
                  </button>
                </div>
                {inCartQty > 0 ? (
                  <p className="text-center text-sm text-stone-500 sm:text-base">
                    {isAr ? `في السلة: ${inCartQty}` : `In cart: ${inCartQty}`}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="shrink-0 border-t border-stone-100 bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-4 md:px-7 md:py-5">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-2xl border border-stone-200 py-3 text-sm font-semibold text-stone-600 transition-all hover:border-stone-300 hover:bg-stone-50 sm:py-3.5 sm:text-base"
            >
              {isAr ? "العودة إلى القائمة" : "Back to Menu"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}
