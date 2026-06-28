"use client";

import { memo, useMemo, useState, type MouseEvent, type ReactNode } from "react";
import ViewportGate from "@/components/Global/ViewportGate";
import { useLocale } from "next-intl";
import { AiFillStar } from "react-icons/ai";
import { IoBagHandleOutline } from "react-icons/io5";
import LoadImage from "@/components/ImageLoad";
import type { MenuItem } from "@/types/menu";
import {
  getMenuItemMinPrice,
  getMenuItemSizes,
  getMenuItemVariants,
  hasMenuItemOptions,
} from "@/lib/menuItemOptions";
import { hexToRgba, useOneCardTheme } from "@/components/Templates/OneCardTemplate/OneCardThemeContext";
import { getItemDiscount } from "@/lib/menuItemDiscount";
import { useTrackMenuItemClick } from "@/hooks/useTrackMenuItemClick";
import MenuItemDetailModal, {
  type MenuItemCartOptions,
} from "@/components/Global/MenuItemDetailModal";

// Re-export for backward compatibility with MenuSection
export type { MenuItemCartOptions as OneCardCartOptions };

export type OneCardProductCardProps = {
  item: MenuItem;
  currencyLabel: string;
  isTableOrder: boolean;
  cartQuantity: number;
  onAddToCart: (
    item: MenuItem,
    quantity: number,
    options?: MenuItemCartOptions,
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

function pickCategoryLabel(item: MenuItem, locale: string) {
  return locale === "ar"
    ? item.categoryNameAr?.trim() || item.categoryName
    : item.categoryNameEn?.trim() || item.categoryName;
}

function BadgePill({
  children,
  primary,
  secondary,
  className = "",
}: {
  children: ReactNode;
  primary: string;
  secondary: string;
  className?: string;
}) {
  return (
    <span
      className="inline-flex items-center overflow-hidden rounded-full shadow-md ltr:flex-row-reverse"
      style={{
        background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
      }}
    >
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full sm:h-8 sm:w-8"
        style={{ backgroundColor: "rgba(0,0,0,0.22)" }}
        aria-hidden
      >
        <AiFillStar className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" />
      </span>
      <span
        className={`px-3 py-1.5 text-[11px] font-bold text-white sm:px-3.5 sm:py-2 sm:text-xs md:px-4 md:text-sm ${className}`}
      >
        {children}
      </span>
    </span>
  );
}

const ONECARD_PRODUCT_IMAGE_WIDTH = 640;

function OneCardProductCardInner({
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
  const { trackItem } = useTrackMenuItemClick();
  const [open, setOpen] = useState(false);

  const sizes = useMemo(() => getMenuItemSizes(item), [item]);
  const variants = useMemo(() => getMenuItemVariants(item), [item]);
  const itemHasOptions = hasMenuItemOptions(item);

  const name = pickName(item, locale);
  const description = pickDescription(item, locale);
  const categoryLabel = pickCategoryLabel(item, locale);
  const productImageSrc = item.image?.trim() ?? "";
  const displayMinPrice = getMenuItemMinPrice(item);
  const { discountedPrice, strikethroughPrice } = getItemDiscount(item);

  const cardPriceLabel = itemHasOptions
    ? isAr
      ? `يبدأ من ${displayMinPrice}`
      : `From ${displayMinPrice}`
    : String(discountedPrice);

  const openDetails = () => {
    if (item.id) trackItem(item.id);
    setOpen(true);
  };

  const handleCardAction = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (isTableOrder && item.available && !itemHasOptions) {
      onAddToCart(item, 1);
    } else {
      openDetails();
    }
  };

  const orderButtonLabel =
    isTableOrder && item.available
      ? itemHasOptions
        ? isAr
          ? "اختر"
          : "Choose"
        : isAr
          ? "اطلب"
          : "Order"
      : isAr
        ? "التفاصيل"
        : "Details";

  return (
    <>
      <ViewportGate
        className={`w-full h-full ${className}`.trim()}
        placeholder={
          <div
            className="min-h-[400px] overflow-hidden rounded-[1.75rem] bg-zinc-100/80"
            aria-hidden
          />
        }
      >
        <article
          className="relative w-full h-full cursor-pointer"
          onClick={openDetails}
        >
          <div
            className="pointer-events-none absolute top-0 start-0 z-0 h-15 w-15"
            aria-hidden
            style={{
              backgroundImage: `radial-gradient(circle, ${hexToRgba(primary, 0.35)} 2px, transparent 2px)`,
              backgroundSize: "14px 14px",
            }}
          />
          <div className="relative z-10 h-full flex items-center overflow-hidden rounded-[1.75rem]">
            <div
              className="pointer-events-none absolute start-2 top-2 z-10 h-20 w-24 opacity-35 sm:start-3 sm:top-3 sm:h-24 sm:w-28"
              aria-hidden
            />

            <div className="one-card-border-radius absolute inset-0 w-[85%] ms-auto overflow-hidden">
              <LoadImage
                src={productImageSrc}
                alt={name}
                fill
                width={ONECARD_PRODUCT_IMAGE_WIDTH}
                className="object-cover bg-(--bg-main)/10"
              />
            </div>

            {!item.available ? (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 text-sm font-bold text-white backdrop-blur-[3px]">
                {isAr ? "غير متوفر" : "Unavailable"}
              </div>
            ) : null}

            {item.available ? (
              <div className="absolute end-3 top-3 z-20 sm:end-4 sm:top-4 md:end-5 md:top-5">
                <BadgePill primary={primary} secondary={secondary}>
                  {isAr ? "متاح الان" : "Available Now"}
                </BadgePill>
              </div>
            ) : null}

            <div className="relative z-20 ms-5 my-6 flex w-[50%] xl:w-[50%] 2xl:w-[44%] min-w-[130px] max-w-68">
              <div className="flex w-full flex-col justify-between overflow-hidden rounded-[1.25rem] bg-white px-4 py-4 text-center shadow-sm sm:rounded-3xl sm:px-5 sm:py-5 md:px-6 md:py-6">

                <div className="flex min-h-0 flex-col items-center overflow-hidden">
                  {categoryLabel ? (
                    <div className="mb-2.5 flex justify-center sm:mb-3">
                      <BadgePill primary={primary} secondary={secondary}>
                        {categoryLabel}
                      </BadgePill>
                    </div>
                  ) : null}

                  <h3
                    className="line-clamp-4 text-base font-black leading-snug w-full sm:text-lg md:text-xl lg:text-2xl"
                    style={{ color: primary }}
                  >
                    {name}
                  </h3>

                  <div
                    className="mx-auto mt-2.5 h-0.5 w-11 shrink-0 rounded-full sm:mt-3 sm:w-14"
                    style={{ backgroundColor: primary }}
                    aria-hidden
                  />

                  {description ? (
                    <p className="mt-2.5 line-clamp-2 min-w-0 overflow-hidden text-xs leading-relaxed text-zinc-500 sm:mt-3 sm:text-sm md:text-base">
                      {description}
                    </p>
                  ) : null}
                </div>

                <div className="mt-3 flex flex-col items-center gap-2 sm:mt-4 sm:gap-2.5">
                  {strikethroughPrice ? (
                    <span className="text-[10px] tabular-nums text-gray-400 line-through sm:text-xs">
                      {strikethroughPrice} {currencyLabel}
                    </span>
                  ) : null}
                  <span
                    className="text-xs font-black tabular-nums sm:text-sm md:text-base"
                    style={{ color: primary }}
                  >
                    {cardPriceLabel} {currencyLabel}
                  </span>

                  <button
                    type="button"
                    onClick={handleCardAction}
                    disabled={!item.available && isTableOrder}
                    className="inline-flex w-full min-h-9 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-bold text-white shadow-md transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-10 sm:px-4 sm:text-sm"
                    style={{ backgroundColor: primary }}
                  >
                    {isAr ? (
                      <>
                        {orderButtonLabel}
                        <IoBagHandleOutline
                          className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4"
                          aria-hidden
                        />
                      </>
                    ) : (
                      <>
                        <IoBagHandleOutline
                          className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4"
                          aria-hidden
                        />
                        {orderButtonLabel}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>
      </ViewportGate>

      {open ? (
        <MenuItemDetailModal
          item={item}
          currencyLabel={currencyLabel}
          isTableOrder={isTableOrder}
          cartQuantity={cartQuantity}
          primary={primary}
          secondary={secondary}
          onClose={() => setOpen(false)}
          onAddToCart={onAddToCart}
        />

      ) : null}
    </>
  );
}

export const OneCardProductCard = memo(OneCardProductCardInner);
