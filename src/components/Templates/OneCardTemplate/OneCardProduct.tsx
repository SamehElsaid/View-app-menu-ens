"use client";

import {
  useEffect,
  useId,
  useMemo,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useLocale } from "next-intl";
import { FiMinus, FiPlus, FiX } from "react-icons/fi";
import { IoCartOutline } from "react-icons/io5";
import LoadImage from "@/components/ImageLoad";
import type {
  MenuItem,
  MenuItemSizeOption,
  MenuItemVariantOption,
} from "@/types/menu";
import {
  computeMenuItemUnitPrice,
  getMenuItemMinPrice,
  getMenuItemSizes,
  getMenuItemVariants,
  hasMenuItemOptions,
  pickSizeLabel,
  pickVariantLabel,
} from "@/lib/menuItemOptions";
import { useTrackMenuItemClick } from "@/hooks/useTrackMenuItemClick";
import { hexToRgba, useOneCardTheme } from "./OneCardThemeContext";

export type OneCardCartOptions = {
  size?: MenuItemSizeOption | null;
  variant?: MenuItemVariantOption | null;
};

export type OneCardProductCardProps = {
  item: MenuItem;
  currencyLabel: string;
  isTableOrder: boolean;
  cartQuantity: number;
  onAddToCart: (
    item: MenuItem,
    quantity: number,
    options?: OneCardCartOptions,
  ) => void;
  className?: string;
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

const ONE_CARD_PILL_BASE =
  "flex min-h-10 w-full items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold shadow-[0_10px_24px_-10px_rgba(0,0,0,0.5)] transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-11 sm:px-4 sm:text-sm";

const ONE_CARD_PILL_SHAPE = "rounded-bl-2xl rounded-br-2xl";

function oneCardPillClass(...extra: string[]) {
  return [ONE_CARD_PILL_BASE, ONE_CARD_PILL_SHAPE, ...extra].join(" ");
}

function oneCardActionStyle(primary: string, secondary: string) {
  return {
    background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
  };
}

type CartQuantityControlsProps = {
  quantity: number;
  cartQuantity: number;
  isAr: boolean;
  primary: string;
  secondary: string;
  disabled?: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
  onAdd: (e: MouseEvent<HTMLButtonElement>) => void;
};

function CartQuantityControls({
  quantity,
  cartQuantity,
  isAr,
  primary,
  secondary,
  disabled = false,
  onDecrease,
  onIncrease,
  onAdd,
}: CartQuantityControlsProps) {
  return (
    <div className="flex flex-col gap-2">
      {cartQuantity > 0 ? (
        <p
          className="flex items-center justify-center gap-1.5 text-[10px] font-semibold sm:text-xs"
          style={{ color: primary }}
        >
          <IoCartOutline className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {isAr ? `في السلة: ${cartQuantity}` : `In cart: ${cartQuantity}`}
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <div
          className={oneCardPillClass("text-white")}
          style={{
            border: `2px solid ${hexToRgba(primary, 0.25)}`,
            backgroundColor: "white",
          }}
        >
          <button
            type="button"
            onClick={onDecrease}
            disabled={disabled || quantity <= 1}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white transition active:scale-90 disabled:opacity-40 sm:h-8 sm:w-8"
            style={{ backgroundColor: primary }}
            aria-label={isAr ? "تقليل" : "Decrease"}
          >
            <FiMinus className="h-3.5 w-3.5" />
          </button>
          <span
            className="min-w-6 text-center text-sm font-black tabular-nums"
            style={{ color: primary }}
          >
            {quantity}
          </span>
          <button
            type="button"
            onClick={onIncrease}
            disabled={disabled}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white transition active:scale-90 disabled:opacity-40 sm:h-8 sm:w-8"
            style={{ backgroundColor: primary }}
            aria-label={isAr ? "زيادة" : "Increase"}
          >
            <FiPlus className="h-3.5 w-3.5" />
          </button>
        </div>

        <button
          type="button"
          onClick={onAdd}
          disabled={disabled}
          className={oneCardPillClass("text-white")}
          style={oneCardActionStyle(primary, secondary)}
        >
          <IoCartOutline className="h-4 w-4 shrink-0" aria-hidden />
          {isAr ? "أضف" : "Add"}
        </button>
      </div>
    </div>
  );
}

type OptionPickerProps = {
  title: string;
  primary: string;
  children: ReactNode;
};

function OptionPicker({ title, primary, children }: OptionPickerProps) {
  return (
    <div className="mb-4 text-start">
      <h4 className="mb-2 text-sm font-bold" style={{ color: primary }}>
        {title}
      </h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export function OneCardProductCard({
  item,
  currencyLabel,
  isTableOrder,
  cartQuantity,
  onAddToCart,
  className = "",
}: OneCardProductCardProps) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const { primary, secondary } = useOneCardTheme();
  const titleId = useId();
  const { trackItem } = useTrackMenuItemClick();
  const [open, setOpen] = useState(false);
  const [modalQty, setModalQty] = useState(1);

  const sizes = useMemo(() => getMenuItemSizes(item), [item]);
  const variants = useMemo(() => getMenuItemVariants(item), [item]);
  const itemHasOptions = hasMenuItemOptions(item);

  const [selectedSize, setSelectedSize] = useState<MenuItemSizeOption | null>(
    () => sizes[0] ?? null,
  );
  const [selectedVariant, setSelectedVariant] =
    useState<MenuItemVariantOption | null>(null);

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
    setSelectedSize(sizes[0] ?? null);
    setSelectedVariant(null);
    setModalQty(1);
  }, [item.id, sizes]);

  const name = pickName(item, locale);
  const description = pickDescription(item, locale);
  const productImageSrc = item.image?.trim() ?? "";
  const productImageClassName = productImageSrc
    ? "object-cover"
    : "object-cover  !pt-0";
  const displayMinPrice = getMenuItemMinPrice(item);
  const selectedUnitPrice = computeMenuItemUnitPrice(
    item,
    selectedSize,
    selectedVariant,
  );
  const cardPriceLabel = itemHasOptions
    ? isAr
      ? `من ${displayMinPrice}`
      : `From ${displayMinPrice}`
    : String(item.price);

  const optionsHint = [
    sizes.length > 0
      ? isAr
        ? `${sizes.length} أحجام`
        : `${sizes.length} sizes`
      : null,
    variants.length > 0
      ? isAr
        ? `${variants.length} إضافات`
        : `${variants.length} add-ons`
      : null,
  ]
    .filter(Boolean)
    .join(isAr ? " · " : " · ");

  const canAdd = item.available && (!sizes.length || selectedSize !== null);

  const openDetails = () => {
    if (item.id) trackItem(item.id);
    setSelectedSize(sizes[0] ?? null);
    setSelectedVariant(null);
    setModalQty(1);
    setOpen(true);
  };

  const handleAddToCart = (
    e: MouseEvent<HTMLButtonElement>,
    quantity: number,
    closeModal = false,
  ) => {
    e.stopPropagation();
    if (!canAdd) return;
    if (item.id) trackItem(item.id);
    onAddToCart(item, quantity, {
      size: selectedSize,
      variant: selectedVariant,
    });
    setModalQty(1);
    if (closeModal) setOpen(false);
  };

  const actionButtonClass = oneCardPillClass("text-white");
  const priceButtonClass = oneCardPillClass("text-white tabular-nums");

  const optionRowClass = (checked: boolean) =>
    `flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-3 py-2.5 transition sm:px-4 sm:py-3 ${
      checked
        ? "border-transparent shadow-sm"
        : "border-zinc-200 bg-white hover:border-zinc-300"
    }`;

  const modal = (
    <div
      className="fixed inset-0 z-400 flex items-end justify-center p-0 sm:items-center sm:p-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(8px)",
      }}
      role="presentation"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-4xl bg-white shadow-2xl sm:max-h-[88dvh] sm:rounded-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute end-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-zinc-700 shadow-md"
          aria-label={isAr ? "إغلاق" : "Close"}
        >
          <FiX />
        </button>

        <div className="relative aspect-4/3 w-full shrink-0 bg-zinc-100">
          <LoadImage
            src={productImageSrc}
            alt={name}
            fill
            className={productImageClassName}
            disableLazy
          />
          {!item.available ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-bold text-white backdrop-blur-[3px]">
              {isAr ? "غير متوفر" : "Unavailable"}
            </div>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 text-center sm:p-6">
          <h3
            id={titleId}
            className="text-lg font-bold"
            style={{ color: primary }}
          >
            {name}
          </h3>

          {description ? (
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
              {description}
            </p>
          ) : null}

          <p
            className="mt-3 text-2xl font-black tabular-nums"
            style={{ color: primary }}
          >
            {selectedUnitPrice} {currencyLabel}
          </p>

          {sizes.length > 0 ? (
            <OptionPicker title={isAr ? "الحجم" : "Size"} primary={primary}>
              {sizes.map((size) => {
                const label = pickSizeLabel(size, locale);
                const checked = selectedSize?.nameEn === size.nameEn;
                return (
                  <label
                    key={`${size.nameEn}-${size.price}`}
                    className={optionRowClass(checked)}
                    style={
                      checked
                        ? {
                            backgroundColor: hexToRgba(primary, 0.1),
                            borderColor: primary,
                          }
                        : undefined
                    }
                  >
                    <span className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name={`onecard-size-${item.id}`}
                        checked={checked}
                        onChange={() => setSelectedSize(size)}
                        className="h-4 w-4"
                        style={{ accentColor: primary }}
                      />
                      <span className="text-sm font-semibold text-zinc-800">
                        {label}
                      </span>
                    </span>
                    <span
                      className="text-sm font-black tabular-nums"
                      style={{ color: primary }}
                    >
                      {size.price} {currencyLabel}
                    </span>
                  </label>
                );
              })}
            </OptionPicker>
          ) : null}

          {variants.length > 0 ? (
            <OptionPicker
              title={isAr ? "الإضافات" : "Add-ons"}
              primary={primary}
            >
              <label
                className={optionRowClass(selectedVariant === null)}
                style={
                  selectedVariant === null
                    ? {
                        backgroundColor: hexToRgba(primary, 0.1),
                        borderColor: primary,
                      }
                    : undefined
                }
              >
                <span className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name={`onecard-variant-${item.id}`}
                    checked={selectedVariant === null}
                    onChange={() => setSelectedVariant(null)}
                    className="h-4 w-4"
                    style={{ accentColor: primary }}
                  />
                  <span className="text-sm font-semibold text-zinc-800">
                    {isAr ? "بدون إضافة" : "No add-on"}
                  </span>
                </span>
              </label>
              {variants.map((variant) => {
                const label = pickVariantLabel(variant, locale);
                const checked = selectedVariant?.labelEn === variant.labelEn;
                return (
                  <label
                    key={`${variant.labelEn}-${variant.price}`}
                    className={optionRowClass(checked)}
                    style={
                      checked
                        ? {
                            backgroundColor: hexToRgba(primary, 0.1),
                            borderColor: primary,
                          }
                        : undefined
                    }
                  >
                    <span className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name={`onecard-variant-${item.id}`}
                        checked={checked}
                        onChange={() => setSelectedVariant(variant)}
                        className="h-4 w-4"
                        style={{ accentColor: primary }}
                      />
                      <span className="text-sm font-semibold text-zinc-800">
                        {label}
                      </span>
                    </span>
                    <span
                      className="text-sm font-black tabular-nums"
                      style={{ color: primary }}
                    >
                      {variant.price > 0
                        ? `+${variant.price} ${currencyLabel}`
                        : isAr
                          ? "مجاني"
                          : "Free"}
                    </span>
                  </label>
                );
              })}
            </OptionPicker>
          ) : null}

          {isTableOrder && item.available ? (
            <div className="mt-2">
              <CartQuantityControls
                quantity={modalQty}
                cartQuantity={cartQuantity}
                isAr={isAr}
                primary={primary}
                secondary={secondary}
                disabled={!canAdd}
                onDecrease={() => setModalQty((q) => Math.max(1, q - 1))}
                onIncrease={() => setModalQty((q) => q + 1)}
                onAdd={(e) => handleAddToCart(e, modalQty, true)}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <article className={`relative w-full px-1 pt-1 sm:px-2 ${className}`}>
        <div
          className="rounded-tr-4xl rounded-tl-4xl px-3 py-2.5 text-center text-xs font-bold text-white shadow-[0_10px_24px_-12px_rgba(0,0,0,0.5)] sm:px-5 sm:py-3 sm:text-sm"
          style={{ backgroundColor: primary }}
        >
          {name}
        </div>

        <button
          type="button"
          onClick={openDetails}
          className="relative block w-full overflow-hidden  bg-zinc-100 text-start shadow-[0_18px_44px_-20px_rgba(0,0,0,0.35)] focus:outline-none"
        >
          <div className="relative aspect-4/5 w-full">
            <LoadImage
              src={productImageSrc}
              alt={name}
              fill
              className={productImageClassName}
              disableLazy
            />

            {!item.available ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-bold text-white backdrop-blur-[2px]">
                {isAr ? "غير متوفر" : "Unavailable"}
              </div>
            ) : null}

            {isTableOrder && cartQuantity > 0 ? (
              <span
                className="absolute end-2 top-2 flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-[11px] font-black text-white shadow-md ring-2 ring-white"
                style={{ backgroundColor: primary }}
              >
                {cartQuantity}
              </span>
            ) : null}

            {itemHasOptions ? (
              <span
                className="absolute start-2 top-2 rounded-full px-2 py-1 text-[9px] font-bold text-white shadow-md sm:text-[10px]"
                style={{ backgroundColor: hexToRgba(primary, 0.92) }}
              >
                {optionsHint}
              </span>
            ) : null}
          </div>

          {description ? (
            <div
              className="absolute inset-x-3 bottom-0 rounded-tr-4xl rounded-tl-4xl px-3 py-2.5 text-center text-[10px] leading-relaxed text-white shadow-lg sm:inset-x-4 sm:px-4 sm:py-3 sm:text-xs"
              style={{ backgroundColor: primary }}
            >
              {description}
            </div>
          ) : null}
        </button>

        <div className="mt-1 flex flex-col gap-2 sm:gap-3">
          <div
            className={
              isTableOrder && item.available
                ? "grid grid-cols-2 gap-2 sm:gap-3"
                : "grid grid-cols-1"
            }
          >
            <div
              className={priceButtonClass}
              style={{ backgroundColor: primary }}
              aria-label={isAr ? "السعر" : "Price"}
            >
              {cardPriceLabel} {currencyLabel}
            </div>

            {isTableOrder && item.available ? (
              <button
                type="button"
                onClick={openDetails}
                className={actionButtonClass}
                style={oneCardActionStyle(primary, secondary)}
              >
                <IoCartOutline className="h-4 w-4 shrink-0" aria-hidden />
                {itemHasOptions
                  ? isAr
                    ? "اختر"
                    : "Choose"
                  : isAr
                    ? "اطلب"
                    : "Order"}
              </button>
            ) : null}
          </div>
        </div>
      </article>

      {open &&
        typeof document !== "undefined" &&
        createPortal(modal, document.body)}
    </>
  );
}
