"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { FiX } from "react-icons/fi";
import type { MenuItem } from "@/types/menu";
import LoadImage from "@/components/ImageLoad";
import { arabCurrencies, type Currency } from "@/constants/currencies";
import {
  readSkyCartFromCookie,
  subscribeSkyCartUpdated,
  upsertSkyCartQuantityFromMenuItem,
} from "@/lib/skyTemplateCart";

type NeonDetailModalProps = {
  item: MenuItem;
  onClose: () => void;
  currency: string;
  primaryColor: string;
  secondaryColor: string;
  isProPlan: boolean;
  isTableOrder: boolean;
  categoryName: string;
};

export default function NeonDetailModal({
  item,
  onClose,
  currency,
  primaryColor,
  secondaryColor,
  isProPlan,
  isTableOrder,
  categoryName,
}: NeonDetailModalProps) {
  const locale = useLocale();
  const direction = locale === "ar" ? "rtl" : "ltr";
  const [isClosing, setIsClosing] = useState(false);
  const [selectedQty, setSelectedQty] = useState(1);
  const [inCartQty, setInCartQty] = useState(0);

  const itemName =
    locale === "ar" ? item.nameAr || item.name : item.nameEn || item.name;
  const itemDescription =
    locale === "ar"
      ? item.descriptionAr || item.description
      : item.descriptionEn || item.description;

  const getCurrency = () => {
    if (locale !== "ar") return currency;
    const found = arabCurrencies.find((c: Currency) => c.code === currency);
    return found?.symbol || currency;
  };

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
      const cart = readSkyCartFromCookie();
      setInCartQty(cart[item.id]?.quantity ?? 0);
    };
    sync();
    return subscribeSkyCartUpdated(sync);
  }, [item.id]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="neon-detail-title"
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity duration-300 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      onClick={handleClose}
    >
      <div
        className={`absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
      />

      <div
        dir={direction}
        className={`relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl transition-all duration-300 dark:border-slate-700 dark:bg-slate-900 ${
          isClosing
            ? "scale-95 opacity-0"
            : "scale-100 opacity-100 animate-scale-in"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label={locale === "ar" ? "إغلاق" : "Close"}
          className={`absolute top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full text-white shadow-lg transition hover:opacity-90 ${
            direction === "rtl" ? "left-4" : "right-4"
          }`}
          style={{
            background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
          }}
        >
          <FiX className="text-xl" />
        </button>

        <div className="relative h-72 overflow-hidden leading-none sm:h-80">
          <LoadImage
            src={item.image}
            alt={itemName}
            fill
            disableLazy
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

          {categoryName ? (
            <span
              className={`absolute top-4 rounded-full px-4 py-1.5 text-xs font-bold text-white shadow-md ${
                direction === "rtl" ? "right-4" : "left-4"
              }`}
              style={{
                background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
              }}
            >
              {categoryName}
            </span>
          ) : null}

          {item.discountPercent && item.discountPercent > 0 ? (
            <span className="absolute top-4 end-14 rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white">
              -{item.discountPercent}%
            </span>
          ) : null}

          <div
            className={`absolute bottom-4 rounded-2xl px-5 py-2.5 text-white shadow-xl ${
              direction === "rtl" ? "right-4" : "left-4"
            }`}
            style={{
              background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
            }}
          >
            <span className="text-xl font-bold">
              {item.price} {getCurrency()}
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <h2
            id="neon-detail-title"
            className="mb-3 text-2xl font-bold text-slate-900 dark:text-white"
          >
            {itemName}
          </h2>

          <div
            className="mb-5 h-1 w-12 rounded-full"
            style={{
              background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
            }}
          />

          {isProPlan && itemDescription ? (
            <p className="mb-6 text-base leading-relaxed text-slate-600 dark:text-slate-300">
              {itemDescription}
            </p>
          ) : null}

          {item.originalPrice && item.originalPrice > item.price ? (
            <div className="mb-6 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/80">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {locale === "ar" ? "السعر الأصلي" : "Original price"}
              </span>
              <span className="text-base text-slate-400 line-through">
                {item.originalPrice} {getCurrency()}
              </span>
            </div>
          ) : null}

          {isTableOrder ? (
            <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 dark:border-slate-700">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-1 py-0.5 dark:border-slate-600 dark:bg-slate-800">
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold"
                    style={{ color: primaryColor }}
                    onClick={() => setSelectedQty((q) => Math.max(1, q - 1))}
                    aria-label={locale === "ar" ? "تقليل" : "Decrease"}
                  >
                    −
                  </button>
                  <span
                    className="min-w-8 text-center text-base font-bold tabular-nums"
                    style={{ color: primaryColor }}
                  >
                    {selectedQty}
                  </span>
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold"
                    style={{ color: primaryColor }}
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
                  className="rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:opacity-90"
                  style={{
                    background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                  }}
                >
                  {locale === "ar" ? "أضف للسلة" : "Add to cart"}
                </button>
              </div>
              {inCartQty > 0 ? (
                <p className="text-center text-sm text-slate-500 dark:text-slate-400">
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
}
