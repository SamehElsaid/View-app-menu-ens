"use client";

import { memo, useMemo, useState, type MouseEvent } from "react";
import { useLocale } from "next-intl";
import { AiFillStar } from "react-icons/ai";
import { IoBagHandleOutline } from "react-icons/io5";
import { HiArrowRight } from "react-icons/hi";
import LoadImage from "@/components/ImageLoad";
import type { MenuItem } from "@/types/menu";
import { getMenuItemMinPrice, hasMenuItemOptions } from "@/lib/menuItemOptions";
import { getItemDiscount } from "@/lib/menuItemDiscount";
import { useOneCardTheme } from "../OneCardTemplate/OneCardThemeContext";
import { useTrackMenuItemClick } from "@/hooks/useTrackMenuItemClick";
import MenuItemDetailModal, {
  type MenuItemCartOptions,
} from "@/components/Global/MenuItemDetailModal";

export type { MenuItemCartOptions as WaffleCartOptions };

export type WaffleProductCardProps = {
  item: MenuItem;
  currencyLabel: string;
  isTableOrder: boolean;
  cartQuantity: number;
  onAddToCart: (
    item: MenuItem,
    quantity: number,
    options?: MenuItemCartOptions,
  ) => void;
  showBestSeller?: boolean;
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

function TitleDivider({ primary }: { primary: string }) {
  return (
    <div className="my-2 flex items-center gap-1.5" aria-hidden>
      <span className="h-px flex-1 bg-zinc-200" />
      <span
        className="h-1.5 w-1.5 rotate-45 border border-current opacity-70"
        style={{ color: primary }}
      />
      <span className="h-px flex-1 bg-zinc-200" />
    </div>
  );
}

function WaffleProductCardInner({
  item,
  currencyLabel,
  isTableOrder,
  cartQuantity,
  onAddToCart,
  showBestSeller = false,
}: WaffleProductCardProps) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const { primary, secondary } = useOneCardTheme();
  const { trackItem } = useTrackMenuItemClick();
  const [open, setOpen] = useState(false);

  const itemHasOptions = hasMenuItemOptions(item);
  const name = pickName(item, locale);
  const description = pickDescription(item, locale);
  const imageSrc = item.image?.trim() ?? "";
  const displayMinPrice = getMenuItemMinPrice(item);
  const { discountedPrice, strikethroughPrice } = getItemDiscount(item);
  const priceValue = itemHasOptions ? displayMinPrice : discountedPrice;

  const openDetails = () => {
    if (item.id) trackItem(item.id);
    setOpen(true);
  };

  const handleOrder = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (isTableOrder && item.available && !itemHasOptions) {
      onAddToCart(item, 1);
    } else {
      openDetails();
    }
  };

  const orderLabel = useMemo(() => {
    if (isTableOrder && item.available) {
      return isAr ? "اطلب الآن" : "Order now";
    }
    return isAr ? "عرض التفاصيل" : "View details";
  }, [isTableOrder, item.available, isAr]);

  const bestSellerLabel = isAr ? "الأكثر طلباً" : "Best Seller";

  return (
    <>
      <article
        dir="ltr"
        onClick={openDetails}
        className="relative cursor-pointer overflow-hidden rounded-[22px] bg-white shadow-[0_14px_40px_-12px_rgba(0,0,0,0.45)]"
      >
        <div className="flex min-h-[196px]">
          <div className="relative w-[44%] shrink-0 overflow-hidden bg-[#eeebf4]">
            <div className="relative h-full min-h-[196px] w-full overflow-hidden">
              <LoadImage
                src={imageSrc}
                alt={name}
                fill
                width={480}
                className="object-cover"
                style={{
                  borderRadius: "10% 23% 37% 10% / 10% 100% 32% 10% ",
                }}
              />

              {!item.available ? (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 text-xs font-bold text-white backdrop-blur-[2px]">
                  {isAr ? "غير متوفر" : "Unavailable"}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-center bg-[#eeebf4] px-3 py-3.5 sm:px-4 sm:py-4">
            <h3
              className="text-[14px] font-black leading-snug sm:text-[15px]"
              style={{ color: primary }}
              dir={isAr ? "rtl" : "ltr"}
            >
              {name}
            </h3>

            <TitleDivider primary={primary} />

            {description ? (
              <p
                className="line-clamp-3 text-[10px] leading-relaxed  sm:text-[11px]"
                dir={isAr ? "rtl" : "ltr"}
              >
                {description}
              </p>
            ) : null}

            <div className="mt-3 flex items-center gap-2">
              <span
                className="inline-flex gap-2 items-center rounded-full bg-white p-2 text-base font-black tabular-nums shadow-[0_4px_14px_-4px_rgba(0,0,0,0.15)] sm:text-sm"
                style={{ color: primary }}
                dir={isAr ? "rtl" : "ltr"}
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full  shadow-[0_4px_14px_-4px_rgba(0,0,0,0.12)]"
                  style={{ color: primary }}
                  aria-hidden
                >
                  <IoBagHandleOutline className="h-4 w-4" />
                </span>
                <span className="flex flex-col">
                  {strikethroughPrice ? (
                    <span className="text-[10px] tabular-nums text-gray-400 line-through leading-none mb-0.5">
                      {strikethroughPrice} {currencyLabel}
                    </span>
                  ) : null}
                  {priceValue} {currencyLabel}
                </span>
              </span>
            </div>

            <button
              type="button"
              onClick={handleOrder}
              disabled={!item.available && isTableOrder}
              className="relative mt-3 flex w-full items-center justify-center rounded-full py-2.5 text-xs font-bold text-white shadow-[0_8px_22px_-8px_rgba(0,0,0,0.45)] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:py-3 sm:text-sm"
              style={{
                background: `linear-gradient(135deg, ${primary}, ${secondary})`,
              }}
              dir={isAr ? "rtl" : "ltr"}
            >
              {orderLabel}
              <span className="absolute end-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/20">
                <HiArrowRight
                  className={`h-4 w-4 ${isAr ? "rotate-180" : ""}`}
                  aria-hidden
                />
              </span>
            </button>
          </div>
        </div>
      </article>

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

export const WaffleProductCard = memo(WaffleProductCardInner);
