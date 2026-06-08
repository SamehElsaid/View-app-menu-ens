"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale } from "next-intl";
import type { MenuItem } from "@/types/menu";
import LoadImage from "@/components/ImageLoad";
import { Icon } from "../components/Icon";
import { arabCurrencies, type Currency } from "@/constants/currencies";

type SkyDetailModalProps = {
  item: MenuItem;
  onClose: () => void;
  currency: string;
  isTableOrder: boolean;
  quantity: number;
  addToCartLabel: string;
  increaseLabel: string;
  decreaseLabel: string;
  onAddToCart: (quantity: number) => void;
};

export default function SkyDetailModal({
  item,
  onClose,
  currency,
  isTableOrder,
  quantity,
  addToCartLabel,
  increaseLabel,
  decreaseLabel,
  onAddToCart,
}: SkyDetailModalProps) {
  const locale = useLocale();
  const direction = locale === "ar" ? "rtl" : "ltr";
  const [isClosing, setIsClosing] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const itemName =
    locale === "ar" ? item.nameAr || item.name : item.nameEn || item.name;
  const itemDescription =
    locale === "ar"
      ? item.descriptionAr || item.description
      : item.descriptionEn || item.description;
  const itemCategoryName =
    locale === "ar"
      ? item.categoryNameAr || item.categoryName
      : item.categoryNameEn || item.categoryName;

  const hasDiscount =
    Boolean(item.originalPrice && item.discountPercent) &&
    (item.originalPrice ?? 0) > item.price;

  const getCurrency = () => {
    if (locale !== "ar") return currency;
    const found = arabCurrencies.find((c: Currency) => c.code === currency);
    return found?.symbol || currency;
  };

  const handleClose = () => {
    setIsClosing(true);
    window.setTimeout(() => onClose(), 300);
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsClosing(true);
        window.setTimeout(() => onClose(), 300);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  useEffect(() => {
    setSelectedQuantity(1);
  }, [item.id]);

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sky-detail-title"
      className={`fixed inset-0 z-[100000] flex items-center justify-center p-3 transition-opacity duration-300 sm:items-center sm:p-4 sm:py-24 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      onClick={handleClose}
    >
      <div
        className={`absolute inset-0 bg-slate-900/75 backdrop-blur-md transition-opacity duration-300 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
      />

      <div
        dir={direction}
        className={`relative flex max-h-[min(82dvh,520px)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-(--bg-main)/15 bg-white shadow-[0_24px_60px_-20px_rgba(14,165,233,0.4)] transition-all duration-300 sm:max-h-[min(78dvh,480px)] sm:rounded-3xl ${
          isClosing
            ? "translate-y-6 scale-[0.98] opacity-0 sm:translate-y-0"
            : "translate-y-0 scale-100 opacity-100 animate-modal-in"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-(--bg-main)/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-sky-200/50 blur-3xl" />

        <div className="relative h-40 shrink-0 overflow-hidden sm:h-44">
          <LoadImage
            src={item.image}
            alt={itemName}
            fill
            disableLazy
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-white via-white/10 to-transparent" />
          <div
            className="absolute bottom-0 left-0 right-0 h-14 bg-white"
            style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0, 0 82%)" }}
          />

          <button
            type="button"
            onClick={handleClose}
            aria-label={locale === "ar" ? "إغلاق" : "Close"}
            className={`absolute top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-(--bg-main) shadow-lg transition hover:bg-white ${
              direction === "rtl" ? "left-4" : "right-4"
            }`}
          >
            <Icon name="close-line" className="text-xl" />
          </button>

          {itemCategoryName ? (
            <span
              className={`absolute top-4 z-20 rounded-full border border-white/25 bg-(--bg-main)/90 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white shadow-md backdrop-blur-md ${
                direction === "rtl" ? "right-16" : "left-4"
              }`}
            >
              {itemCategoryName}
            </span>
          ) : null}

          {hasDiscount ? (
            <span className="absolute top-4 end-4 z-20 rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white shadow-md">
              -{item.discountPercent}%
            </span>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-1 sm:px-5 sm:pb-5">
          <div className="mb-3">
            <h2
              id="sky-detail-title"
              className="text-lg font-black tracking-tight text-(--bg-main) sm:text-xl"
            >
              {itemName}
            </h2>
            <div className="mt-2 h-1 w-10 rounded-full bg-(--bg-main)" />
          </div>

          {itemDescription ? (
            <div className="mb-3 rounded-xl bg-(--bg-main)/5 px-3 py-3">
              <p className="text-sm leading-relaxed text-(--bg-main)/75 line-clamp-4 sm:line-clamp-5">
                {itemDescription}
              </p>
            </div>
          ) : null}

          <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-lg border border-(--bg-main)/10 bg-(--bg-main)/5 px-3 py-2">
            <p className="text-base font-bold text-(--bg-main)">
              {item.price}{" "}
              <span className="text-xs font-semibold">{getCurrency()}</span>
            </p>
            {hasDiscount ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-(--bg-main)/45 line-through">
                  {item.originalPrice} {getCurrency()}
                </span>
                <span className="rounded-full bg-(--bg-main) px-2 py-0.5 text-[10px] font-bold text-white">
                  -{item.discountPercent}%
                </span>
              </div>
            ) : null}
          </div>

          {isTableOrder ? (
            <div className="space-y-2 rounded-xl border border-(--bg-main)/15 bg-(--bg-main)/3 p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1 rounded-full border border-(--bg-main)/20 bg-white px-1 py-0.5">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedQuantity((q) => Math.max(1, q - 1))
                    }
                    aria-label={decreaseLabel}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold text-(--bg-main) transition hover:bg-(--bg-main)/10"
                  >
                    −
                  </button>
                  <span className="min-w-8 text-center text-base font-black tabular-nums text-(--bg-main)">
                    {selectedQuantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedQuantity((q) => q + 1)}
                    aria-label={increaseLabel}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold text-(--bg-main) transition hover:bg-(--bg-main)/10"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onAddToCart(selectedQuantity);
                    setSelectedQuantity(1);
                  }}
                  className="min-w-32 flex-1 rounded-lg bg-(--bg-main) px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:opacity-90 sm:flex-none"
                >
                  {addToCartLabel}
                </button>
              </div>
              {quantity > 0 ? (
                <p className="text-center text-sm font-medium text-(--bg-main)/65">
                  {locale === "ar"
                    ? `في السلة: ${quantity}`
                    : `In cart: ${quantity}`}
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
