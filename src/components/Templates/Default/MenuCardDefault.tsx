"use client";

import { useState, useEffect, useMemo, memo } from "react";
import { IoPricetagOutline } from "react-icons/io5";
import { FiChevronRight, FiChevronLeft } from "react-icons/fi";
import { toast } from "react-toastify";
import {
  MenuItem,
  MenuItemSizeOption,
  MenuItemVariantOption,
} from "@/types/menu";

import { arabCurrencies, Currency } from "@/constants/currencies";
import { useLocale } from "next-intl";
import { Icon } from "../components/Icon";
import LoadImage from "@/components/ImageLoad";
import { useTrackMenuItemClick } from "@/hooks/useTrackMenuItemClick";
import {
  computeMenuItemUnitPrice,
  getMenuItemMinPrice,
  getMenuItemSizes,
  getMenuItemVariants,
  hasMenuItemOptions,
  pickSizeLabel,
  pickVariantLabel,
} from "@/lib/menuItemOptions";

interface MenuCardProps {
  item: MenuItem;
  index: number;
  currency?: string;
  onClick: () => void;
  openItemId: number;
  onOpenModal: (itemId: number) => void;
  onCloseModal: () => void;
  /** Table URL (`?table=`) — show add-to-cart in modal (shared cookie with RequestStaffButton). */
  isTableOrder?: boolean;
  cartQuantity?: number;
  onAddToCart?: (payload: {
    quantity: number;
    size?: MenuItemSizeOption | null;
    variant?: MenuItemVariantOption | null;
  }) => void;
}

const MenuCardDefaultInner = ({
  item,
  openItemId,
  onOpenModal,
  onCloseModal,
  currency = "AED",
  onClick,
  isTableOrder = false,
  cartQuantity = 0,
  onAddToCart,
}: MenuCardProps) => {
  const { trackItem } = useTrackMenuItemClick();
  const locale = useLocale();
  const direction = locale === "ar" ? "rtl" : "ltr";
  const [isClosing, setIsClosing] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [cardPickQty, setCardPickQty] = useState(1);

  const sizes = useMemo(() => getMenuItemSizes(item), [item]);
  const variants = useMemo(() => getMenuItemVariants(item), [item]);
  const itemHasOptions = hasMenuItemOptions(item);
  const displayMinPrice = getMenuItemMinPrice(item);
  const isOpen = openItemId === item.id;

  const [selectedSize, setSelectedSize] = useState<MenuItemSizeOption | null>(
    sizes[0] ?? null,
  );
  const [selectedVariant, setSelectedVariant] =
    useState<MenuItemVariantOption | null>(null);

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

  const selectedUnitPrice = computeMenuItemUnitPrice(
    item,
    selectedSize,
    selectedVariant,
  );

  const currencySymbol = useMemo(() => {
    if (locale !== "ar") return currency;
    const found = arabCurrencies.find((c: Currency) => c.code === currency);
    return found?.symbol ?? currency;
  }, [locale, currency]);

  const getCurrency = () => currencySymbol;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleCardClick = () => {
    trackItem(item.id);
    setSelectedSize(sizes[0] ?? null);
    setSelectedVariant(null);
    setSelectedQuantity(1);
    onOpenModal(item.id);
    setIsClosing(false);
    onClick();
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onCloseModal();
      setIsClosing(false);
    }, 300);
  };

  const handleAddToCart = (quantity: number) => {
    if (!onAddToCart) return;
    if (sizes.length && !selectedSize) return;

    onAddToCart({
      quantity,
      size: selectedSize,
      variant: selectedVariant,
    });
    toast.success(
      locale === "ar"
        ? `تمت إضافة ${quantity} إلى السلة`
        : `Added ${quantity} to cart`,
    );
    setSelectedQuantity(1);
    setCardPickQty(1);
    handleClose();
  };

  const handleCardAddClick = () => {
    if (itemHasOptions) {
      handleCardClick();
      return;
    }
    onAddToCart?.({ quantity: cardPickQty });
    toast.success(
      locale === "ar"
        ? `تمت إضافة ${cardPickQty} إلى السلة`
        : `Added ${cardPickQty} to cart`,
    );
    setCardPickQty(1);
  };

  const ArrowIcon = locale === "ar" ? FiChevronLeft : FiChevronRight;

  const priceLabel = itemHasOptions
    ? locale === "ar"
      ? `من ${displayMinPrice}`
      : `From ${displayMinPrice}`
    : String(item.price);

  return (
    <>
      <div
        onClick={handleCardClick}
        className="relative bg-white rounded-[2.5rem] shadow-sm border border-(--bg-main)/10 flex flex-col items-center text-center group overflow-hidden cursor-pointer"
      >
        <div className="relative w-full h-52 mb-6 flex items-center justify-center z-10">
          <div className="w-full h-full overflow-hidden relative z-20 bg-white">
            <LoadImage
              src={item.image ?? ""}
              alt={item.name}
              fill
              height={600}
              width={600}
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </div>
        </div>

        <div className="relative z-10 w-full p-6">
          <h3 className="!text-lg font-black mb-2 text-zinc-900 group-hover:text-(--bg-main) transition-colors">
            {itemName}
          </h3>

          <p className="text-[#2b1d58]/80 text-sm leading-[1.65] mb-6 min-h-[2.75rem] line-clamp-2 font-normal">
            {itemDescription}
          </p>

          <div className="w-full flex items-center justify-between mt-auto pt-6 border-t border-(--bg-main)/10 gap-2">
            <div className="flex min-w-0 flex-wrap items-end gap-x-2 gap-y-1 text-start">
              <span className="text-(--bg-main) font-black text-lg flex items-end gap-1 shrink-0">
                <span className="flex items-center gap-1">
                  <span
                    style={{
                      transform:
                        locale === "ar" ? "rotateY(180deg)" : "rotateY(0deg)",
                    }}
                  >
                    <IoPricetagOutline className="text-lg text-gray-500" />
                  </span>
                  {priceLabel}
                </span>
                <span className="text-base font-medium text-(--bg-main)">
                  {getCurrency()}
                </span>
              </span>

              {sizes.length > 0 ? (
                <span className="text-sm font-medium text-[#6b7280]">
                  {locale === "ar"
                    ? `${sizes.length} أحجام`
                    : `${sizes.length} sizes`}
                </span>
              ) : null}
              {variants.length > 0 ? (
                <span className="text-sm font-medium text-[#6b7280]">
                  {locale === "ar"
                    ? `${variants.length} إضافات`
                    : `${variants.length} add-ons`}
                </span>
              ) : null}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
              className="bg-(--bg-main) hover:bg-(--bg-main)/80 transition-colors text-white w-9 h-9 rounded-full flex items-center justify-center font-black text-base shrink-0"
              aria-label={locale === "ar" ? "التفاصيل" : "Details"}
            >
              <ArrowIcon className="text-lg sm:text-xl" />
            </button>
          </div>

          {isTableOrder && onAddToCart ? (
            <div
              className="mt-4 w-full space-y-2 border-t border-(--bg-main)/10 pt-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-between">
                <div className="flex items-center gap-1.5 rounded-2xl border border-(--bg-main)/25 bg-white/80 px-1 py-1">
                  <button
                    type="button"
                    onClick={() => setCardPickQty((q) => Math.max(1, q - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-base font-bold text-(--bg-main) transition hover:bg-(--bg-main)/10"
                    aria-label={locale === "ar" ? "تقليل" : "Decrease"}
                  >
                    −
                  </button>
                  <span className="min-w-7 text-center text-base font-black text-(--bg-main)">
                    {cardPickQty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCardPickQty((q) => q + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-base font-bold text-(--bg-main) transition hover:bg-(--bg-main)/10"
                    aria-label={locale === "ar" ? "زيادة" : "Increase"}
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleCardAddClick}
                  className="rounded-2xl bg-(--bg-main) px-4 py-2 text-base font-black text-white transition hover:opacity-90"
                >
                  {locale === "ar" ? "أضف للسلة" : "Add to cart"}
                </button>
              </div>
              {cartQuantity > 0 ? (
                <p className="text-center text-base font-medium text-(--bg-main)/80">
                  {locale === "ar"
                    ? `في السلة: ${cartQuantity}`
                    : `In cart: ${cartQuantity}`}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {isOpen ? (
        <div
          className={`fixed inset-0 z-11111111111 flex items-center justify-center p-4 transition-opacity duration-300 ${
            isClosing ? "opacity-0" : "opacity-100"
          }`}
          onClick={handleClose}
        >
          <div
            className={`absolute inset-0 bg-black/80 transition-opacity duration-300 ${
              isClosing ? "opacity-0" : "opacity-100"
            }`}
          />

          <div
            dir={direction}
            className={`relative flex w-full max-w-2xl max-h-[92dvh] flex-col overflow-hidden rounded-[2.5rem] border border-(--bg-main)/20 bg-white shadow-md transition-all duration-300 ${
              isClosing ? "animate-modal-out" : "animate-modal-in"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className={`absolute top-6 z-30 w-12 h-12 rounded-full bg-(--bg-main)/90 flex items-center justify-center text-white hover:bg-(--bg-main) transition-colors ${
                direction === "rtl" ? "left-6" : "right-6"
              }`}
            >
              <Icon name="close-line" className="text-xl" />
            </button>

            <div className="relative h-80 shrink-0 overflow-hidden sm:h-96">
              <LoadImage
                src={item.image ?? ""}
                alt={itemName}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-white via-transparent to-transparent" />

              {itemCategoryName ? (
                <div
                  className={`absolute top-6 bg-(--bg-main)/90 text-white text-base font-black px-4 py-2 rounded-full tracking-widest uppercase border border-white/20 ${
                    direction === "rtl" ? "right-6" : "left-6"
                  }`}
                >
                  {itemCategoryName}
                </div>
              ) : null}

              <div
                className={`absolute bottom-6 bg-(--bg-main) text-white px-6 py-3 rounded-2xl border-2 border-white ${
                  direction === "rtl" ? "right-6" : "left-6"
                }`}
              >
                <span className="text-xl font-black tracking-tighter">
                  {selectedUnitPrice} {getCurrency()}
                </span>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-8 pt-2 sm:px-8 sm:pb-8">
              <div className="mb-4">
                <h2 className="!text-xl sm:!text-2xl font-black text-(--bg-main) mb-2 tracking-tight text-balance wrap-break-word">
                  {itemName}
                </h2>
                <div className="w-10 h-1 bg-(--bg-main)/80 rounded-full" />
              </div>

              {itemDescription ? (
                <div className="rounded-2xl bg-(--bg-main)/5 px-4 py-4 sm:px-5 sm:py-4 mb-6">
                  <p className="text-[#2b1d58] text-sm sm:text-[15px] leading-[1.75] font-normal text-balance wrap-break-word">
                    {itemDescription}
                  </p>
                </div>
              ) : null}

              {sizes.length > 0 ? (
                <div className="mb-5">
                  <h3 className="mb-3 text-base font-black text-(--bg-main)">
                    {locale === "ar" ? "الحجم" : "Size"}
                  </h3>
                  <div className="space-y-2">
                    {sizes.map((size) => {
                      const label = pickSizeLabel(size, locale);
                      const checked = selectedSize?.nameEn === size.nameEn;
                      return (
                        <label
                          key={`${size.nameEn}-${size.price}`}
                          className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition ${
                            checked
                              ? "border-(--bg-main) bg-(--bg-main)/8"
                              : "border-(--bg-main)/15 bg-white hover:border-(--bg-main)/35"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <input
                              type="radio"
                              name={`size-${item.id}`}
                              checked={checked}
                              onChange={() => setSelectedSize(size)}
                              className="h-4 w-4 accent-(--bg-main)"
                            />
                            <span className="text-sm font-semibold text-zinc-800">
                              {label}
                            </span>
                          </span>
                          <span className="text-sm font-black text-(--bg-main)">
                            {size.price} {getCurrency()}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {variants.length > 0 ? (
                <div className="mb-5">
                  <h3 className="mb-3 text-base font-black text-(--bg-main)">
                    {locale === "ar" ? "الإضافات" : "Add-ons"}
                  </h3>
                  <div className="space-y-2">
                    <label
                      className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition ${
                        selectedVariant === null
                          ? "border-(--bg-main) bg-(--bg-main)/8"
                          : "border-(--bg-main)/15 bg-white hover:border-(--bg-main)/35"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="radio"
                          name={`variant-${item.id}`}
                          checked={selectedVariant === null}
                          onChange={() => setSelectedVariant(null)}
                          className="h-4 w-4 accent-(--bg-main)"
                        />
                        <span className="text-sm font-semibold text-zinc-800">
                          {locale === "ar" ? "بدون إضافة" : "No add-on"}
                        </span>
                      </span>
                    </label>
                    {variants.map((variant) => {
                      const label = pickVariantLabel(variant, locale);
                      const checked =
                        selectedVariant?.labelEn === variant.labelEn;
                      return (
                        <label
                          key={`${variant.labelEn}-${variant.price}`}
                          className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition ${
                            checked
                              ? "border-(--bg-main) bg-(--bg-main)/8"
                              : "border-(--bg-main)/15 bg-white hover:border-(--bg-main)/35"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <input
                              type="radio"
                              name={`variant-${item.id}`}
                              checked={checked}
                              onChange={() => setSelectedVariant(variant)}
                              className="h-4 w-4 accent-(--bg-main)"
                            />
                            <span className="text-sm font-semibold text-zinc-800">
                              {label}
                            </span>
                          </span>
                          <span className="text-sm font-black text-(--bg-main)">
                            {variant.price > 0
                              ? `+${variant.price} ${getCurrency()}`
                              : locale === "ar"
                                ? "مجاني"
                                : "Free"}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {isTableOrder && onAddToCart ? (
                <div className="mb-4 flex items-center justify-between gap-4 rounded-2xl border border-(--bg-main)/20 p-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(selectedQuantity);
                    }}
                    disabled={sizes.length > 0 && !selectedSize}
                    className="rounded-xl bg-(--bg-main) px-4 py-2 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {locale === "ar" ? "أضف إلى السلة" : "Add to cart"}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedQuantity((prev) => Math.max(1, prev - 1));
                      }}
                      aria-label={locale === "ar" ? "تقليل" : "Decrease"}
                      className="h-8 w-8 rounded-lg border border-(--bg-main)/40 text-(--bg-main)"
                    >
                      -
                    </button>
                    <span className="min-w-6 text-center text-base font-semibold text-(--bg-main)">
                      {selectedQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedQuantity((prev) => prev + 1);
                      }}
                      aria-label={locale === "ar" ? "زيادة" : "Increase"}
                      className="h-8 w-8 rounded-lg border border-(--bg-main)/40 text-(--bg-main)"
                    >
                      +
                    </button>
                  </div>
                </div>
              ) : null}
              {isTableOrder && cartQuantity > 0 ? (
                <p className="text-base text-(--bg-main)/70">
                  {locale === "ar"
                    ? `في السلة: ${cartQuantity}`
                    : `In cart: ${cartQuantity}`}
                </p>
              ) : null}

              <div className="mt-2 h-px bg-(--bg-main)/10" />

              {item.originalPrice && item.discountPercent ? (
                <div className="flex items-center justify-between p-4 bg-(--bg-main)/5 rounded-2xl mt-4">
                  <span className="text-(--bg-main)/70 font-medium">
                    {locale === "ar" ? "السعر الأصلي" : "Original Price"}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-lg text-(--bg-main)/50 line-through font-medium">
                      {item.originalPrice} {getCurrency()}
                    </span>
                    <span className="text-base font-black bg-(--bg-main) text-white px-3 py-1 rounded-full">
                      -{item.discountPercent}%
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export const MenuCardDefault = memo(MenuCardDefaultInner);
