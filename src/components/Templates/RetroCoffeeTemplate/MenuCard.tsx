"use client";

import { useEffect, useId, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { useLocale } from "next-intl";
import { FiX } from "react-icons/fi";
import LoadImage from "@/components/ImageLoad";
import type { MenuItem } from "@/types/menu";
import { useTrackMenuItemClick } from "@/hooks/useTrackMenuItemClick";
import {
  readSkyCartFromCookie,
  subscribeSkyCartUpdated,
} from "@/lib/skyTemplateCart";
import { useCoffeeTheme, hexToRgba } from "./CoffeeThemeContext";

export type MenuCardProps = {
  item: MenuItem;
  currencyLabel: string;
  isTableOrder: boolean;
  cartQuantity: number;
  onAddToCart: (item: MenuItem, quantity: number) => void;
  index?: number;
};

function pickName(item: MenuItem, locale: string) {
  return locale === "ar"
    ? item.nameAr?.trim() || item.name
    : item.nameEn?.trim() || item.name;
}

function pickDescription(item: MenuItem, locale: string) {
  return locale === "ar"
    ? item.descriptionAr?.trim() || item.description
    : item.descriptionEn?.trim() || item.description;
}

export default function MenuCard({
  item,
  currencyLabel,
  isTableOrder,
  cartQuantity,
  onAddToCart,
  index = 0,
}: MenuCardProps) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const { colors, primary, secondary, gradients } = useCoffeeTheme();
  const titleId = useId();
  const { trackItem } = useTrackMenuItemClick();
  const [open, setOpen] = useState(false);
  const [pickQty, setPickQty] = useState(1);
  const [modalQty, setModalQty] = useState(1);
  const [modalInCart, setModalInCart] = useState(0);

  const name = pickName(item, locale);
  const description = pickDescription(item, locale);
  const hasDiscount =
    item.originalPrice != null && item.originalPrice > item.price;

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

  useEffect(() => {
    if (!open || item.id == null) return;
    const sync = () => {
      const c = readSkyCartFromCookie();
      setModalInCart(c[item.id]?.quantity ?? 0);
    };
    sync();
    return subscribeSkyCartUpdated(sync);
  }, [open, item.id]);

  const openModal = () => {
    if (item.id) trackItem(item.id);
    setModalQty(1);
    setOpen(true);
  };

  const handleAdd = (e: MouseEvent<HTMLButtonElement>, qty: number) => {
    e.stopPropagation();
    onAddToCart(item, qty);
    setPickQty(1);
  };

  const modal = (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      role="presentation"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative max-h-[85dvh] w-full max-w-sm overflow-hidden rounded-[2rem] border-0 shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col"
        style={{
          backgroundColor: "#f4ebd9", 
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute end-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full text-white shadow-md transition transform active:scale-90 hover:brightness-110"
          style={{ backgroundColor: primary }}
          aria-label={isAr ? "إغلاق" : "Close"}
        >
          <FiX className="text-base" />
        </button>

        <div className="relative aspect-[4/3] w-full bg-white overflow-hidden border-b border-[#e6d9be]">
          <LoadImage
            src={item.image ?? ""}
            alt={name}
            fill
            className="object-cover"
            disableLazy
          />

          <div
            className="absolute bottom-3 end-3 flex h-11 w-11 flex-col items-center justify-center rounded-full border border-white/20 text-center text-xs font-bold text-white shadow-md"
            style={{ backgroundColor: primary }}
          >
            <span className="tabular-nums text-xs leading-none">{item.price}</span>
            <span className="mt-0.5 text-[8px] font-medium uppercase opacity-90">{currencyLabel}</span>
          </div>

          {!item.available ? (
            <span
              className="absolute inset-0 flex items-center justify-center text-xs font-bold uppercase tracking-wider text-white backdrop-blur-[3px]"
              style={{ backgroundColor: hexToRgba(secondary, 0.6) }}
            >
              {isAr ? "غير متوفر" : "Unavailable"}
            </span>
          ) : null}
        </div>

        <div className="flex-1 overflow-y-auto p-5 text-center flex flex-col items-center justify-between min-h-[180px]">
          <div className="w-full space-y-2">
            <h3
              id={titleId}
              className="font-serif text-xl font-bold leading-snug sm:text-2xl"
              style={{ color: primary }}
            >
              {name}
            </h3>

            {item.discountPercent ? (
              <span
                className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                style={{ backgroundColor: primary }}
              >
                {isAr ? `${item.discountPercent}٪ خصم` : `${item.discountPercent}% off`}
              </span>
            ) : null}

            {description ? (
              <p className="mx-auto max-w-xs text-xs font-medium leading-relaxed text-zinc-500 line-clamp-4">
                {description}
              </p>
            ) : null}

            {hasDiscount ? (
              <span className="block text-xs tabular-nums line-through opacity-40 font-bold text-zinc-400">
                {item.originalPrice} {currencyLabel}
              </span>
            ) : null}
          </div>

          {isTableOrder && item.available ? (
            <div className="mt-4 w-full max-w-[240px] space-y-2">
              <div className="flex items-center justify-between gap-1 rounded-full border border-zinc-200 bg-white p-1 shadow-sm">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold bg-zinc-100 shadow-sm transition-transform active:scale-90"
                    style={{ color: colors.text }}
                    onClick={() => setModalQty((q) => Math.max(1, q - 1))}
                    aria-label={isAr ? "تقليل" : "Decrease"}
                  >
                    −
                  </button>
                  <span className="min-w-6 text-center text-xs font-bold text-zinc-700">
                    {modalQty}
                  </span>
                  <button
                    type="button"
                    className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold bg-zinc-100 shadow-sm transition-transform active:scale-90"
                    style={{ color: colors.text }}
                    onClick={() => setModalQty((q) => q + 1)}
                    aria-label={isAr ? "زيادة" : "Increase"}
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onAddToCart(item, modalQty);
                    setOpen(false);
                  }}
                  className="rounded-full px-4 py-1 text-xs font-bold text-white transition hover:brightness-110 active:scale-95"
                  style={{ backgroundColor: primary }}
                >
                  {isAr ? "أضف" : "Add"}
                </button>
              </div>

              {modalInCart > 0 ? (
                <p className="text-[11px] font-bold text-zinc-400">
                  {isAr ? `في السلة حالياً: ${modalInCart}` : `In cart: ${modalInCart}`}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <article
        className="coffee-menu-card group flex h-full w-full flex-col items-center text-center transition-all duration-300 sm:hover:-translate-y-1"
        style={{
          animationDelay: `${(index % 6) * 60}ms`,
        }}
      >
        <button
          type="button"
          onClick={openModal}
          className="relative flex w-full flex-col items-center overflow-hidden rounded-xl border shadow-[0_6px_18px_-6px_rgba(0,0,0,0.05)] transition-all duration-500 hover:shadow-[0_12px_28px_-4px_rgba(0,0,0,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:rounded-[1.5rem]"
          style={{
            ["--coffee-ring" as string]: primary,
            backgroundColor: "#f4ebd9",
            borderColor: "#e6d9be",
          }}
        >
          <div
            className="relative aspect-[5/3] w-full overflow-hidden border-b bg-white sm:aspect-[4/3]"
            style={{ borderColor: colors.border }}
          >
            <LoadImage
              src={item.image ?? ""}
              alt={name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {item.discountPercent ? (
              <span
                className="absolute start-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm sm:start-3 sm:top-3 sm:px-2.5 sm:text-[11px]"
                style={{ backgroundColor: secondary }}
              >
                {isAr
                  ? `${item.discountPercent}٪ خصم`
                  : `${item.discountPercent}% off`}
              </span>
            ) : null}

            {cartQuantity > 0 ? (
              <span
                className="absolute end-2 top-2 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white shadow-sm sm:end-3 sm:top-3"
                style={{ backgroundColor: secondary }}
              >
                {cartQuantity}
              </span>
            ) : null}

            {!item.available && (
              <div
                className="absolute inset-0 flex items-center justify-center text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-[2px] sm:text-[11px]"
                style={{ backgroundColor: hexToRgba(secondary, 0.55) }}
              >
                <span className="rounded-full bg-black/25 px-2 py-0.5 sm:px-2.5">
                  {isAr ? "غير متوفر" : "Sold Out"}
                </span>
              </div>
            )}
          </div>

          <div className="flex w-full flex-col items-center px-3 py-2.5 sm:px-4 sm:py-3.5">
            <h4
              className="line-clamp-2 font-serif text-sm font-bold leading-snug sm:text-base"
              style={{ color: primary }}
            >
              {name}
            </h4>

            {description ? (
              <p
                className="mt-1 line-clamp-2 text-[11px] font-medium leading-snug sm:mt-1.5 sm:text-xs"
                style={{ color: colors.textMuted }}
              >
                {description}
              </p>
            ) : null}

            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:mt-2.5">
              <span
                className="font-serif text-base font-extrabold tabular-nums sm:text-lg"
                style={{ color: primary }}
              >
                {item.price}{" "}
                <span className="text-[11px] font-semibold sm:text-xs">
                  {currencyLabel}
                </span>
              </span>

              {hasDiscount ? (
                <span
                  className="text-xs font-bold tabular-nums line-through sm:text-sm"
                  style={{ color: colors.textMuted }}
                >
                  {item.originalPrice} {currencyLabel}
                </span>
              ) : null}
            </div>
          </div>
        </button>

        {isTableOrder && item.available ? (
          <div
            className="z-10 -mt-3 w-full max-w-[130px] sm:-mt-3.5 sm:max-w-[140px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-1 rounded-full border border-zinc-200/80 bg-white p-1 shadow-md">
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold bg-zinc-100 shadow-sm transition-transform active:scale-90"
                  style={{ color: colors.text }}
                  onClick={() => setPickQty((q) => Math.max(1, q - 1))}
                  aria-label={isAr ? "تقليل" : "Decrease"}
                >
                  −
                </button>
                <span className="min-w-4 text-center text-[11px] font-bold text-zinc-700">
                  {pickQty}
                </span>
                <button
                  type="button"
                  className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold bg-zinc-100 shadow-sm transition-transform active:scale-90"
                  style={{ color: colors.text }}
                  onClick={() => setPickQty((q) => q + 1)}
                  aria-label={isAr ? "زيادة" : "Increase"}
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={(e) => handleAdd(e, pickQty)}
                className="rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white transition hover:brightness-110 active:scale-95"
                style={{ backgroundColor: primary }}
              >
                {isAr ? "أضف" : "Add"}
              </button>
            </div>
          </div>
        ) : null}
      </article>

      {open &&
        typeof document !== "undefined" &&
        createPortal(modal, document.body)}
    </>
  );
}