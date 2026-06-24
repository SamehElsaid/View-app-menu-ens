"use client";

import { memo, useMemo, useState, type MouseEvent } from "react";
import { useLocale } from "next-intl";
import { FaHeart } from "react-icons/fa";
import { IoCartOutline } from "react-icons/io5";
import LoadImage from "@/components/ImageLoad";
import type { MenuItem } from "@/types/menu";
import { getMenuItemMinPrice, hasMenuItemOptions } from "@/lib/menuItemOptions";
import { useOneCardTheme } from "../OneCardTemplate/OneCardThemeContext";
import { useTrackMenuItemClick } from "@/hooks/useTrackMenuItemClick";
import MenuItemDetailModal, {
  type MenuItemCartOptions,
} from "@/components/Global/MenuItemDetailModal";

export type { MenuItemCartOptions as VanillaCartOptions };

export type VanillaProductCardProps = {
  item: MenuItem;
  currencyLabel: string;
  isTableOrder: boolean;
  cartQuantity: number;
  onAddToCart: (
    item: MenuItem,
    quantity: number,
    options?: MenuItemCartOptions,
  ) => void;
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

function Flourish({ flip = false }: { flip?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-[3px] text-(--vanilla-gold,#b8893a) ${flip ? "scale-x-[-1]" : ""}`}
      aria-hidden
    >
      <span className="h-1.5 w-1.5 rotate-45 border border-current" />
      <span className="h-px w-5 bg-current" />
    </span>
  );
}

function VanillaProductCardInner({
  item,
  currencyLabel,
  isTableOrder,
  cartQuantity,
  onAddToCart,
}: VanillaProductCardProps) {
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

  const priceValue = itemHasOptions ? displayMinPrice : item.price;

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

  return (
    <>
      <article
        onClick={openDetails}
        className="relative h-full cursor-pointer overflow-visible rounded-[28px] bg-transparent"
      >
        <div className="relative flex h-full items-stretch">
          <div className="relative z-10 -me-5 flex min-w-0 flex-1 flex-col items-center justify-center rounded-[22px] border border-(--vanilla-gold,#b8893a) bg-white px-3 py-4 text-center shadow-[0_12px_36px_-14px_rgba(70,25,110,0.35)] sm:-me-6 sm:px-4 sm:py-5">
            <span
              className="mb-3 h-px w-12 bg-(--vanilla-gold,#b8893a)"
              aria-hidden
            />

            <FaHeart
              className="mb-2 h-4 w-4 text-(--vanilla-gold,#b8893a)"
              aria-hidden
            />

            <h3
              className="text-lg font-black leading-snug sm:text-xl"
              style={{ color: primary }}
            >
              {name}
            </h3>

            <div className="my-2 flex items-center justify-center">
              <Flourish />
              <Flourish flip />
            </div>

            {description ? (
              <p className="line-clamp-3 text-[12px] leading-relaxed text-zinc-500">
                {description}
              </p>
            ) : null}

            <div className="my-3 flex items-center justify-center gap-2">
              <Flourish />
              <span
                className="flex items-baseline gap-1"
                style={{ color: primary }}
              >
                <span className="text-[28px] font-black tabular-nums leading-none">
                  {priceValue}
                </span>
                <span className="text-xs font-bold">{currencyLabel}</span>
              </span>
              <Flourish flip />
            </div>

            <button
              type="button"
              onClick={handleOrder}
              disabled={!item.available && isTableOrder}
              className="relative inline-flex w-full items-center justify-center rounded-full py-3 text-sm font-bold text-white shadow-[0_10px_24px_-10px_rgba(70,25,110,0.7)] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background: `linear-gradient(135deg, ${primary}, ${secondary})`,
              }}
            >
              <span>{orderLabel}</span>
              <span className="absolute end-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white">
                <IoCartOutline
                  className="h-4 w-4"
                  style={{ color: primary }}
                  aria-hidden
                />
              </span>
            </button>
          </div>

          <div className="relative w-[44%] shrink-0 overflow-hidden rounded-tl-[22px] rounded-bl-[22px] ">
            <LoadImage
              src={imageSrc}
              alt={name}
              fill
              width={640}
              className="object-cover"
            />

            {!item.available ? (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 text-xs font-bold text-white backdrop-blur-[2px]">
                {isAr ? "غير متوفر" : "Unavailable"}
              </div>
            ) : null}
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

export const VanillaProductCard = memo(VanillaProductCardInner);
