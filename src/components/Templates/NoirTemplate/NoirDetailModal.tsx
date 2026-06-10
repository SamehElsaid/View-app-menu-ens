"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import type { MenuItem } from "@/types/menu";
import LoadImage from "@/components/ImageLoad";
import { useNoirTheme, hexToRgba, shadowGlow } from "./NoirThemeContext";
import {
  readSkyCartFromCookie,
  subscribeSkyCartUpdated,
  upsertSkyCartQuantityFromMenuItem,
} from "@/lib/skyTemplateCart";
import { useTableCartAllowed } from "@/hooks/useTableCartAllowed";

type NoirDetailModalProps = {
  item: MenuItem;
  onClose: () => void;
  currencyLabel: string;
};

export default function NoirDetailModal({
  item,
  onClose,
  currencyLabel,
}: NoirDetailModalProps) {
  const locale = useLocale();
  const direction = locale === "ar" ? "rtl" : "ltr";
  const searchParams = useSearchParams();
  const tableCartAllowed = useTableCartAllowed();
  const isTableOrder =
    Boolean(searchParams.get("table")?.trim()) && tableCartAllowed;
  const [isClosing, setIsClosing] = useState(false);
  const [selectedQty, setSelectedQty] = useState(1);
  const [inCartQty, setInCartQty] = useState(0);
  const { primary } = useNoirTheme();

  const name = locale === "ar" ? item.nameAr : item.nameEn;
  const desc = locale === "ar" ? item.descriptionAr : item.descriptionEn;
  const catLabel = locale === "ar" ? item.categoryNameAr : item.categoryNameEn;

  const hasDiscount =
    Boolean(item.originalPrice && item.discountPercent) &&
    (item.originalPrice ?? 0) > item.price;

  const panelShadow = `0 0 40px ${hexToRgba(primary, 0.22)}, 0 24px 48px rgba(0,0,0,0.55)`;
  const closeGlow = shadowGlow(primary, 20, 0.25);

  const handleClose = () => {
    setIsClosing(true);
    window.setTimeout(() => onClose(), 280);
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsClosing(true);
        window.setTimeout(() => onClose(), 280);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  useEffect(() => {
    setSelectedQty(1);
    const sync = () => {
      const c = readSkyCartFromCookie();
      setInCartQty(c[item.id]?.quantity ?? 0);
    };
    sync();
    return subscribeSkyCartUpdated(sync);
  }, [item.id]);

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="noir-detail-title"
      className={`fixed inset-0 z-100000 flex items-center justify-center p-3 transition-opacity duration-300 sm:items-center sm:p-4 sm:py-20 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      onClick={handleClose}
    >
      <div
        className={`absolute inset-0 bg-black/82 backdrop-blur-md transition-opacity duration-300 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
      />

      <div
        dir={direction}
        className={`relative flex max-h-[min(82dvh,520px)] w-full max-w-md flex-col overflow-hidden rounded-lg border border-violet/20 bg-charcoal/95 transition-all duration-300 sm:max-h-[min(78dvh,480px)] ${
          isClosing
            ? "translate-y-5 scale-[0.98] opacity-0 sm:translate-y-0"
            : "translate-y-0 scale-100 opacity-100 animate-scale-in motion-reduce:animate-none"
        }`}
        style={{ boxShadow: panelShadow }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-40 shrink-0 overflow-hidden sm:h-44">
          <LoadImage
            src={item.image ?? ""}
            alt={name}
            fill
            className="object-cover sm:saturate-[0.72] sm:brightness-[0.9]"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(17,17,24,0) 0%, rgba(17,17,24,0.2) 40%, rgba(17,17,24,0.92) 100%)",
            }}
          />

          <button
            type="button"
            className="absolute end-3 top-3 z-30 flex h-8 w-8 items-center justify-center rounded-full border border-violet/30 bg-black/80 text-sm text-text-secondary transition active:scale-95"
            style={{ boxShadow: "none" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = closeGlow;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none";
            }}
            onClick={handleClose}
            aria-label={locale === "ar" ? "إغلاق" : "Close"}
          >
            ✕
          </button>

          {catLabel ? (
            <span className="absolute start-3 top-3 z-20 rounded-base border border-violet/25 bg-violet/80 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/90">
              {catLabel}
            </span>
          ) : null}

          {hasDiscount ? (
            <span className="absolute end-12 top-3 z-20 rounded-base bg-violet/90 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white">
              -{item.discountPercent}%
            </span>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-2 sm:px-5 sm:pb-5">
          <h3
            id="noir-detail-title"
            className="font-body mb-2 text-lg font-light text-text-primary sm:text-xl"
          >
            {name}
          </h3>

          {desc ? (
            <p className="font-body mb-3 text-sm leading-relaxed text-text-secondary line-clamp-4 sm:line-clamp-5">
              {desc}
            </p>
          ) : null}

          <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-lg border border-violet/15 bg-violet/5 px-3 py-2">
            <p className="font-body flex items-baseline gap-1.5 text-base font-light">
              <span className="text-xs tracking-wide text-cyan">
                {currencyLabel}
              </span>
              <span className="text-lavender">{item.price}</span>
            </p>
            {hasDiscount ? (
              <div className="flex items-center gap-2">
                <span className="font-body text-xs text-text-secondary line-through">
                  {item.originalPrice} {currencyLabel}
                </span>
                <span className="rounded-full bg-linear-to-br from-violet to-cyan px-2 py-0.5 text-[10px] font-medium text-white">
                  {locale === "ar"
                    ? `-${item.discountPercent}%`
                    : `-${item.discountPercent}%`}
                </span>
              </div>
            ) : null}
          </div>

          {isTableOrder ? (
            <div className="space-y-2 rounded-lg border border-violet/15 bg-black/20 p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1 rounded-lg border border-violet/25 bg-black/30 px-0.5 py-0.5">
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-md text-base text-text-secondary"
                    onClick={() => setSelectedQty((q) => Math.max(1, q - 1))}
                    aria-label={locale === "ar" ? "تقليل" : "Decrease"}
                  >
                    −
                  </button>
                  <span className="min-w-7 text-center text-sm text-text-primary">
                    {selectedQty}
                  </span>
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-md text-base text-text-secondary"
                    onClick={() => setSelectedQty((q) => q + 1)}
                    aria-label={locale === "ar" ? "زيادة" : "Increase"}
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    upsertSkyCartQuantityFromMenuItem(item, selectedQty);
                    setSelectedQty(1);
                  }}
                  className="min-w-32 flex-1 rounded-full border border-violet/40 bg-linear-to-br from-violet to-cyan px-4 py-2 text-xs font-medium uppercase tracking-wide text-white transition hover:opacity-90 sm:flex-none sm:text-sm"
                >
                  {locale === "ar" ? "أضف إلى السلة" : "Add to cart"}
                </button>
              </div>
              {inCartQty > 0 ? (
                <p className="text-center text-xs text-text-secondary">
                  {locale === "ar"
                    ? `في السلة: ${inCartQty}`
                    : `In cart: ${inCartQty}`}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}
