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
import type { MenuItem, MenuItemSizeOption, MenuItemVariantOption } from "@/types/menu";
import {
  computeMenuItemUnitPrice,
  getMenuItemSizes,
  getMenuItemVariants,
  pickSizeLabel,
  pickVariantLabel,
} from "@/lib/menuItemOptions";
import { getItemDiscount, applyItemDiscountToPrice, getSelectedTotalStrikethrough } from "@/lib/menuItemDiscount";
import { hexToRgba } from "@/lib/colorUtils";

export type MenuItemCartOptions = {
  size?: MenuItemSizeOption | null;
  variant?: MenuItemVariantOption | null;
};

export type MenuItemDetailModalProps = {
  item: MenuItem;
  currencyLabel: string;
  isTableOrder: boolean;
  cartQuantity: number;
  primary: string;
  secondary: string;
  onClose: () => void;
  onAddToCart: (
    item: MenuItem,
    quantity: number,
    options?: MenuItemCartOptions,
  ) => void;
};

// ─── Internal sub-components ─────────────────────────────────────────────────

type OptionPickerProps = {
  title: string;
  primary: string;
  children: ReactNode;
};

function OptionPicker({ title, primary, children }: OptionPickerProps) {
  return (
    <div className="mt-4 text-start">
      <h4 className="mb-2 text-sm font-bold" style={{ color: primary }}>
        {title}
      </h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

type StickyPriceBarProps = {
  unitPrice: number;
  currencyLabel: string;
  primary: string;
  strikethroughPrice?: number | null;
  discountPercent?: number | null;
};

/** Sticky price when cart actions are unavailable (browse-only menus). */
function StickyPriceBar({
  unitPrice,
  currencyLabel,
  primary,
  strikethroughPrice,
  discountPercent,
}: StickyPriceBarProps) {
  return (
    <div className="flex items-center justify-center gap-x-2 gap-y-1">
      {strikethroughPrice ? (
        <span className="text-sm tabular-nums text-zinc-400 line-through">
          {strikethroughPrice} {currencyLabel}
        </span>
      ) : null}
      <p
        className="text-xl font-black tabular-nums sm:text-2xl"
        style={{ color: primary }}
      >
        {unitPrice} {currencyLabel}
      </p>
      {discountPercent ? (
        <span
          className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
          style={{ backgroundColor: primary }}
        >
          -{discountPercent}%
        </span>
      ) : null}
    </div>
  );
}

type CartQuantityControlsProps = {
  quantity: number;
  cartQuantity: number;
  unitPrice: number;
  currencyLabel: string;
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
  unitPrice,
  currencyLabel,
  isAr,
  primary,
  secondary,
  disabled = false,
  onDecrease,
  onIncrease,
  onAdd,
}: CartQuantityControlsProps) {
  const lineTotal = Math.round(unitPrice * quantity * 100) / 100;

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
          className="flex min-h-10 w-full items-center justify-center gap-1.5 rounded-2xl border-2 bg-white px-3 py-2.5 shadow-sm sm:min-h-11"
          style={{ borderColor: hexToRgba(primary, 0.25) }}
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
          className="flex min-h-10 w-full items-center justify-center gap-1.5 rounded-2xl px-2.5 py-2.5 text-xs font-bold text-white shadow-md transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-11 sm:gap-2 sm:px-3 sm:text-sm"
          style={{
            background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
          }}
        >
          <IoCartOutline className="h-4 w-4 shrink-0" aria-hidden />
          <span className="truncate">
            {isAr ? "أضف" : "Add"}
            <span className="mx-1 opacity-70" aria-hidden>
              ·
            </span>
            <span className="tabular-nums">
              {lineTotal} {currencyLabel}
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}

// ─── Main modal component ─────────────────────────────────────────────────────

function MenuItemDetailModalInner({
  item,
  currencyLabel,
  isTableOrder,
  cartQuantity,
  primary,
  secondary,
  onClose,
  onAddToCart,
}: MenuItemDetailModalProps) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const titleId = useId();

  const sizes = useMemo(() => getMenuItemSizes(item), [item]);
  const variants = useMemo(() => getMenuItemVariants(item), [item]);

  const [selectedSize, setSelectedSize] = useState<MenuItemSizeOption | null>(
    () => sizes[0] ?? null,
  );
  const [selectedVariant, setSelectedVariant] =
    useState<MenuItemVariantOption | null>(null);
  const [qty, setQty] = useState(1);

  const canAdd = item.available && (!sizes.length || selectedSize !== null);

  const selectedUnitPrice = computeMenuItemUnitPrice(
    item,
    selectedSize,
    selectedVariant,
  );
  const { hasDiscount, discountPercent, strikethroughPrice } = getItemDiscount(item);
  const selectedTotalStrikethrough = getSelectedTotalStrikethrough(
    item,
    selectedUnitPrice,
    selectedSize?.price,
    selectedVariant?.price,
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const optionRowClass = (checked: boolean) =>
    `flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-3 py-2.5 transition sm:px-4 sm:py-3 ${
      checked
        ? "border-transparent shadow-sm"
        : "border-zinc-200 bg-white hover:border-zinc-300"
    }`;

  const handleAdd = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!canAdd) return;
    onAddToCart(item, qty, { size: selectedSize, variant: selectedVariant });
    onClose();
  };

  const productImageSrc = item.image?.trim() ?? "";
  const name =
    locale === "ar"
      ? item.nameAr?.trim() || item.name
      : item.nameEn?.trim() || item.name;
  const description =
    locale === "ar"
      ? item.descriptionAr?.trim() || item.description
      : item.descriptionEn?.trim() || item.description;

  const modal = (
    <div
      className="fixed inset-0 z-1111111 flex items-end justify-center p-0 sm:items-center sm:p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-4xl bg-white shadow-2xl sm:max-h-[88dvh] sm:min-w-[600px] sm:max-w-[600px] sm:rounded-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute end-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-zinc-700 shadow-md"
          aria-label={isAr ? "إغلاق" : "Close"}
        >
          <FiX />
        </button>

        {/* Image */}
        <div className="relative aspect-4/2 w-full shrink-0 bg-zinc-100">
          <LoadImage
            src={productImageSrc}
            alt={name}
            fill
            className={productImageSrc ? "object-cover" : "object-cover pt-0!"}
            disableLazy
          />
          {!item.available ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-bold text-white backdrop-blur-[3px]">
              {isAr ? "غير متوفر" : "Unavailable"}
            </div>
          ) : null}
        </div>

        {/* Scrollable content */}
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
                        name={`modal-size-${item.id}`}
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
                      {(() => {
                        const discSizePrice = applyItemDiscountToPrice(item, size.price);
                        return discSizePrice !== size.price ? (
                          <>
                            <span className="line-through opacity-50 text-xs mr-1">{size.price}</span>
                            {discSizePrice}
                          </>
                        ) : size.price;
                      })()} {currencyLabel}
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
                    name={`modal-variant-${item.id}`}
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
                        name={`modal-variant-${item.id}`}
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
        </div>

        {/* Sticky footer — price always visible; cart actions only for table orders */}
        <div className="shrink-0 border-t border-zinc-100 bg-white px-5 py-4 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] sm:px-6">
          {isTableOrder && item.available ? (
            <CartQuantityControls
              quantity={qty}
              cartQuantity={cartQuantity}
              unitPrice={selectedUnitPrice}
              currencyLabel={currencyLabel}
              isAr={isAr}
              primary={primary}
              secondary={secondary}
              disabled={!canAdd}
              onDecrease={() => setQty((q) => Math.max(1, q - 1))}
              onIncrease={() => setQty((q) => q + 1)}
              onAdd={handleAdd}
            />
          ) : (
            <StickyPriceBar
              unitPrice={selectedUnitPrice}
              currencyLabel={currencyLabel}
              primary={primary}
              strikethroughPrice={selectedTotalStrikethrough}
              discountPercent={hasDiscount ? discountPercent : null}
            />
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}

export default MenuItemDetailModalInner;
