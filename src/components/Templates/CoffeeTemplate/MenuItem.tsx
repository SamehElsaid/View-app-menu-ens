"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import LoadImage from "@/components/ImageLoad";
import { resolveMenuItemImageSrc } from "@/lib/menuItemImage";
import { arabCurrencies, type Currency } from "@/constants/currencies";
import { useLocale } from "next-intl";

function currencyLabel(code: string, locale: string): string {
  if (locale === "ar") {
    const found = arabCurrencies.find((c: Currency) => c.code === code);
    if (found?.symbol) return found.symbol;
  }
  return code;
}

interface MenuItemProps {
  id?: number;
  name: string;
  nameAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  price: number | string;
  tag?: string;
  tagAr?: string;
  image?: string;
  delay?: number;
  originalPrice?: number | null;
  discountPercent?: number | null;
  currency?: string;
}

const MenuItem = ({
  name,
  nameAr,
  description,
  descriptionAr,
  price,
  tag,
  tagAr,
  image,
  delay = 0,
  originalPrice,
  discountPercent,
  currency = "AED",
}: MenuItemProps) => {
  const locale = useLocale();
  const titleId = useId();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const displayNameAr = nameAr || name;
  const displayDescription = description || "";
  const displayDescriptionAr = descriptionAr || displayDescription;
  const normalizedPrice =
    typeof price === "number" ? price.toString() : (price || "");

  const curr = currencyLabel(currency, locale);
  const hasDiscount = Boolean(originalPrice && discountPercent);

  const priceLine =
    originalPrice &&
    originalPrice >
      parseFloat(normalizedPrice.replace(/[^0-9.]/g, "") || "0");

  const modal = (
    <div
      className="fixed inset-0 z-400 flex items-center justify-center bg-black/80 p-4 backdrop-blur-[2px]"
      role="presentation"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#3B332E]/90 bg-[#1c1815] p-0 shadow-[0_25px_80px_-12px_rgba(0,0,0,0.65)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute end-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[#3B332E] bg-[#221D1A]/95 text-[#F4EEE7] backdrop-blur-sm transition hover:border-[#F2B705]/50 hover:bg-[#F2B705] hover:text-[#17120F]"
          aria-label={locale === "ar" ? "إغلاق" : "Close"}
        >
          <FiX className="text-xl" />
        </button>

        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-2xl bg-[#2a2520] ring-1 ring-inset ring-white/5">
          <LoadImage
            src={resolveMenuItemImageSrc(image)}
            alt={locale === "ar" ? displayNameAr : name}
            className="h-full w-full object-cover object-center"
            disableLazy={true}
          />
          <div
            className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#1c1815] via-transparent to-transparent opacity-90"
            aria-hidden
          />
        </div>

        <div className="px-5 pb-6 pt-5 sm:px-7 sm:pb-7 sm:pt-6">
          <div className="mb-4 flex flex-wrap items-start gap-2.5 sm:gap-3">
            <h3
              id={titleId}
              className="font-heading text-balance text-xl font-semibold leading-snug tracking-tight text-[#F4EEE7] sm:text-2xl"
            >
              {locale === "ar" ? displayNameAr : name}
            </h3>
            {(tag || tagAr) && (
              <span className="inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#F2B705] bg-[#F2B705]/15 ring-1 ring-[#F2B705]/25">
                {locale === "ar" ? tagAr : tag}
              </span>
            )}
          </div>

          {(displayDescription || displayDescriptionAr) && (
            <p className="mb-6 text-[0.9375rem] leading-[1.7] text-[#B6AA99] sm:text-base">
              {locale === "ar" ? displayDescriptionAr : displayDescription}
            </p>
          )}

          <div className="flex flex-col items-stretch gap-2 border-t border-[#3B332E]/80 pt-5">
            {priceLine ? (
              <span className="text-end text-sm tabular-nums tracking-tight text-[#857a6c] line-through">
                {originalPrice}
                <span className="ms-1.5">{curr}</span>
              </span>
            ) : null}
            <span className="flex flex-wrap items-baseline justify-end gap-x-1.5 gap-y-0.5 font-heading text-2xl font-semibold tabular-nums tracking-tight text-[#F2B705] sm:text-[1.75rem]">
              <span>{normalizedPrice}</span>
              <span className="text-base font-medium text-[#d4a846] sm:text-lg">
                {curr}
              </span>
              {hasDiscount ? (
                <span className="text-sm font-medium text-[#8a8278]">
                  ({discountPercent}% off)
                </span>
              ) : null}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative w-full animate-fade-in overflow-hidden rounded-xl border border-[#3B332E]/90 bg-gradient-to-br from-[#252019] to-[#1a1613] p-3 text-start shadow-sm shadow-black/20 transition-all duration-300 hover:border-[#F2B705]/35 hover:shadow-[0_12px_40px_-8px_rgba(242,183,5,0.12)] focus:border-[#F2B705]/45 focus:outline-none focus:ring-2 focus:ring-[#F2B705]/25 sm:p-4"
        style={{
          animationDelay: `${delay}ms`,
        }}
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative size-[4.5rem] shrink-0 overflow-hidden rounded-xl bg-[#2a2520] ring-1 ring-inset ring-white/[0.06] sm:h-[5.25rem] sm:w-[5.25rem] md:h-[5.75rem] md:w-[5.75rem]">
            <LoadImage
              src={resolveMenuItemImageSrc(image)}
              alt={locale === "ar" ? displayNameAr : name}
              className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
              disableLazy={false}
            />
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
            <div className="min-w-0 flex-1 text-start">
              <div className="flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:gap-2">
                <h3 className="font-heading text-[1.05rem] font-semibold leading-snug tracking-tight text-[#F4EEE7] transition-colors group-hover:text-[#F2E6C9] sm:text-lg md:text-xl">
                  {locale === "ar" ? displayNameAr : name}
                </h3>
                {(tag || tagAr) && (
                  <span className="inline-flex w-fit shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#F2B705] bg-[#F2B705]/12 ring-1 ring-[#F2B705]/20 sm:text-[11px]">
                    {locale === "ar" ? tagAr : tag}
                  </span>
                )}
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1 border-s border-[#3B332E]/50 ps-3">
              {priceLine && (
                <span className="text-xs tabular-nums text-[#857a6c] line-through sm:text-sm">
                  {originalPrice}
                  <span className="ms-1">{curr}</span>
                </span>
              )}
              <span className="flex flex-wrap items-baseline justify-end gap-x-1 font-heading text-lg font-semibold tabular-nums tracking-tight text-[#F2B705] sm:text-xl md:text-2xl">
                <span>{normalizedPrice}</span>
                <span className="text-xs font-medium text-[#c9a227] sm:text-sm">
                  {curr}
                </span>
                {hasDiscount ? (
                  <span className="whitespace-nowrap text-[10px] font-medium text-[#7d756a] sm:text-xs">
                    ({discountPercent}% off)
                  </span>
                ) : null}
              </span>
            </div>
          </div>
        </div>
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(modal, document.body)}
    </>
  );
};

export default MenuItem;
