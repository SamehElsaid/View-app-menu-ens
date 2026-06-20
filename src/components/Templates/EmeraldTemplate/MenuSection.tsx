"use client";

import { useEffect, useMemo, useState } from "react";

import { useIsOrderingEnabled } from "@/hooks/useIsOrderingEnabled";
import { useLocale } from "next-intl";
import { toast } from "react-toastify";
import type { Category, MenuItem, MenuItemSizeOption, MenuItemVariantOption } from "@/types/menu";
import { useCurrencyLabel } from "@/lib/useCurrencyLabel";
import { useEmeraldTheme, hexToRgba } from "./EmeraldThemeContext";
import LoadImage from "@/components/ImageLoad";
import {
  getCartQuantityForMenuItem,
  subscribeSkyCartUpdated,
  readSkyCartFromCookie,
  upsertSkyCartFromMenuItemWithOptions,
  type SkyCart,
} from "@/lib/skyTemplateCart";
import {
  computeMenuItemUnitPrice,
  getMenuItemMinPrice,
  getMenuItemSizes,
  getMenuItemVariants,
  hasMenuItemOptions,
  pickSizeLabel,
  pickVariantLabel,
} from "@/lib/menuItemOptions";
import { useAppSelector } from "@/store/hooks";
import { useTrackMenuItemClick } from "@/hooks/useTrackMenuItemClick";

function CategoryTabs({
  categories,
  active,
  onChange,
}: {
  categories: Category[];
  active: number;
  onChange: (id: string) => void;
}) {
  const locale = useLocale() as "ar" | "en";
  const { primary, secondary } = useEmeraldTheme();
  const hoverBg = hexToRgba(primary, 0.06);
  const inactiveShadow = `0 2px 20px ${hexToRgba(primary, 0.06)}, 0 1px 4px rgba(0,0,0,0.04)`;
  const activeShadow = `0 4px 20px ${hexToRgba(primary, 0.4)}`;

  const tabs: Category[] = [
    { id: 0, name: "All", nameAr: "الكل", nameEn: "All", menuItems: [] },
    ...categories,
  ];

  return (
    <div
      className="flex overflow-x-auto md:flex-wrap md:justify-center gap-2.5 pb-2 px-4 w-full"
      role="tablist"
      aria-label="Menu categories"
    >
      {tabs.map((cat) => {
        const isActive = cat.id === Number(active);
        return (
          <button
            key={cat.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(cat.id.toString())}
            className={`
            relative shrink-0 flex items-center gap-2 px-5 py-2.5
            rounded-full text-base font-semibold font-sans tracking-wide
            transition-[background-color,color,box-shadow] duration-300
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400/50 focus-visible:ring-offset-2
            ${isActive ? "text-white" : "text-stone-500 bg-white"}
          `}
            style={isActive ? undefined : { boxShadow: inactiveShadow }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = hoverBg;
                e.currentTarget.style.color = primary;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = "white";
                e.currentTarget.style.color = "";
              }
            }}
          >
            {isActive ? (
              <span
                className="absolute inset-0 rounded-full transition-opacity duration-300"
                style={{
                  background: `linear-gradient(to bottom right, ${primary}, ${secondary})`,
                  boxShadow: activeShadow,
                }}
              />
            ) : null}
            <span
              className={`relative z-10 text-base leading-none ${
                isActive ? "text-white" : "text-stone-900"
              }`}
            >
              {locale === "ar"
                ? (cat.nameAr ?? cat.name)
                : (cat.nameEn ?? cat.name)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function EmeraldMenuCard({
  dish,
  index,
  onClick,
  currencyLabel,
  isTableOrder,
  cartQuantity,
  onAddToCart,
}: {
  dish: MenuItem;
  index: number;
  onClick: (dish: MenuItem) => void;
  currencyLabel: string;
  isTableOrder: boolean;
  cartQuantity: number;
  onAddToCart: (dish: MenuItem, quantity: number) => void;
}) {
  const locale = useLocale();
  const { primary, secondary } = useEmeraldTheme();
  const [cardPickQty, setCardPickQty] = useState(1);
  const itemHasOptions = hasMenuItemOptions(dish);
  const displayMinPrice = getMenuItemMinPrice(dish);
  const priceDisplay = itemHasOptions
    ? locale === "ar"
      ? `من ${displayMinPrice}`
      : `From ${displayMinPrice}`
    : String(dish.price);
  const badgeText = dish.discountPercent
    ? `${dish.discountPercent}% off`
    : null;
  const cardShadow = `0 2px 20px ${hexToRgba(primary, 0.06)}, 0 1px 4px rgba(0,0,0,0.04)`;
  const cardHoverShadow = `0 16px 48px ${hexToRgba(primary, 0.14)}, 0 4px 12px rgba(0,0,0,0.06)`;
  const iconShadow = `0 4px 20px ${hexToRgba(primary, 0.4)}`;
  const imageBg = hexToRgba(primary, 0.06);

  return (
    <article
      className="bg-white rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 ease-out hover:-translate-y-1.5 active:scale-[0.985] animate-slide-up motion-reduce:animate-none"
      style={
        {
          boxShadow: cardShadow,
          "--em-p": primary,
          animationDelay: `${index * 45}ms`,
        } as React.CSSProperties
      }
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = cardHoverShadow;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = cardShadow;
      }}
      onClick={() => onClick(dish)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick(dish)}
      aria-label={locale === "ar" ? dish.nameAr : dish.nameEn}
    >
      <div
        className="relative h-52 overflow-hidden"
        style={{ backgroundColor: imageBg }}
      >
        <LoadImage
          src={dish.image ?? ""}
          alt={locale === "ar" ? dish.nameAr : dish.nameEn}
          fill
          className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.06]"
        />
        {badgeText && (
          <span
            className={`absolute top-3 start-3 text-[11px] font-sans font-700 px-2.5 py-1 rounded-full tracking-wider uppercase bg-white/90 text-stone-700`}
          >
            {badgeText}
          </span>
        )}
        <div className="absolute bottom-3 end-3 bg-white/95 backdrop-blur-base rounded-full px-3 py-1 shadow-base">
          <span
            className="font-sans font-700 text-base"
            style={{ color: primary }}
          >
            {currencyLabel} {priceDisplay}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h5 className="font-body font-700 text-stone-900 text-lg mb-2 transition-colors duration-200 group-hover:text-[var(--em-p)]">
          {locale === "ar" ? dish.nameAr : dish.nameEn}
        </h5>
        <p className="font-sans text-stone-500 text-base leading-relaxed line-clamp-2">
          {locale === "ar" ? dish.descriptionAr : dish.descriptionEn}
        </p>

        {dish.allergens && dish.allergens.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {dish.allergens.map((a: string) => (
              <span
                key={a}
                className="text-[10px] font-sans font-500 text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full uppercase tracking-wide"
              >
                {a}
              </span>
            ))}
          </div>
        )}

        {isTableOrder ? (
          <div
            className="mt-4 space-y-2 border-t border-stone-100 pt-4"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="presentation"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              {!itemHasOptions ? (
                <div className="flex items-center gap-1 rounded-xl border border-stone-200 bg-stone-50/80 px-1 py-0.5">
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-600"
                    onClick={() => setCardPickQty((q) => Math.max(1, q - 1))}
                    aria-label={locale === "ar" ? "تقليل" : "Decrease"}
                  >
                    −
                  </button>
                  <span className="min-w-7 text-center text-base font-semibold text-stone-800">
                    {cardPickQty}
                  </span>
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-600"
                    onClick={() => setCardPickQty((q) => q + 1)}
                    aria-label={locale === "ar" ? "زيادة" : "Increase"}
                  >
                    +
                  </button>
                </div>
              ) : null}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (itemHasOptions) {
                    onClick(dish);
                  } else {
                    onAddToCart(dish, cardPickQty);
                    setCardPickQty(1);
                  }
                }}
                className="rounded-full px-3 py-1.5 text-base font-semibold text-white"
                style={{
                  background: `linear-gradient(to bottom right, ${primary}, ${secondary})`,
                }}
              >
                {locale === "ar" ? "أضف للسلة" : "Add to cart"}
              </button>
            </div>
            {cartQuantity > 0 ? (
              <p className="text-center text-base text-stone-500">
                {locale === "ar"
                  ? `في السلة: ${cartQuantity}`
                  : `In cart: ${cartQuantity}`}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-50">
          <span
            className="font-sans text-base font-600 tracking-wide uppercase"
            style={{ color: secondary }}
          >
            {locale === "ar" ? "عرض التفاصيل" : "View Details"}
          </span>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
            style={{
              background: `linear-gradient(to bottom right, ${primary}, ${secondary})`,
              boxShadow: iconShadow,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 6h8M7 3l3 3-3 3"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </article>
  );
}

function EmeraldDishModal({
  dish,
  onClose,
  currencyLabel,
}: {
  dish: MenuItem | null;
  onClose: () => void;
  currencyLabel: string;
}) {
  const locale = useLocale() as "ar" | "en";
  const { isOrderingEnabled: isTableOrder } = useIsOrderingEnabled();
  const [selectedQty, setSelectedQty] = useState(1);
  const [inCartQty, setInCartQty] = useState(0);
  const { primary, secondary } = useEmeraldTheme();

  const sizes = useMemo(() => (dish ? getMenuItemSizes(dish) : []), [dish]);
  const variants = useMemo(
    () => (dish ? getMenuItemVariants(dish) : []),
    [dish],
  );
  const itemHasOptions = dish ? hasMenuItemOptions(dish) : false;
  const displayMinPrice = dish ? getMenuItemMinPrice(dish) : 0;

  const [selectedSize, setSelectedSize] = useState<MenuItemSizeOption | null>(
    null,
  );
  const [selectedVariant, setSelectedVariant] =
    useState<MenuItemVariantOption | null>(null);

  const selectedUnitPrice = dish
    ? computeMenuItemUnitPrice(dish, selectedSize, selectedVariant)
    : 0;

  useEffect(() => {
    if (dish) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [dish]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    if (!dish) return;
    setSelectedSize(sizes[0] ?? null);
    setSelectedVariant(null);
    setSelectedQty(1);
    const sync = () => {
      const c = readSkyCartFromCookie();
      setInCartQty(getCartQuantityForMenuItem(c, dish.id));
    };
    sync();
    return subscribeSkyCartUpdated(sync);
  }, [dish, sizes]);

  const backdrop = hexToRgba(primary, 0.45);
  const modalShadow = `0 24px 80px ${hexToRgba(primary, 0.2)}, 0 8px 24px rgba(0,0,0,0.12)`;
  const imageBg = hexToRgba(primary, 0.06);
  const divider = hexToRgba(secondary, 0.55);

  const priceDisplay = itemHasOptions
    ? locale === "ar"
      ? `من ${displayMinPrice}`
      : `From ${displayMinPrice}`
    : String(dish?.price ?? 0);

  if (!dish) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 backdrop-blur-base animate-fade-in motion-reduce:animate-none"
        style={{ backgroundColor: backdrop }}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={locale === "ar" ? dish.nameAr : dish.nameEn}
        className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-1rem)] max-w-[600px] max-h-[90vh] md:max-h-none bg-white rounded-3xl overflow-hidden flex flex-col animate-scale-in motion-reduce:animate-none"
        style={{ boxShadow: modalShadow }}
      >
        <div
          className="relative aspect-[4/3] shrink-0"
          style={{ backgroundColor: imageBg }}
        >
          <LoadImage
            src={dish.image ?? ""}
            alt={locale === "ar" ? dish.nameAr : dish.nameEn}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-3 end-3 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-stone-700 hover:bg-white hover:scale-105 transition-all shadow-md"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {dish.discountPercent ? (
            <span
              className="absolute top-3 start-3 text-[11px] font-sans font-700 px-3.5 py-1.5 rounded-full text-white tracking-wider uppercase shadow-md"
              style={{ backgroundColor: primary }}
            >
              {dish.discountPercent}% off
            </span>
          ) : null}

          <div className="absolute bottom-4 end-4 bg-white/95 backdrop-blur-md rounded-2xl px-5 py-3 shadow-lg flex items-center gap-3">
            {dish.originalPrice ? (
              <span className="font-sans font-600 text-lg text-stone-400 line-through tabular-nums">
                {dish.originalPrice} {currencyLabel}
              </span>
            ) : null}
            <span
              className="font-sans font-800 text-3xl tracking-tight tabular-nums"
              style={{ color: primary }}
            >
              {itemHasOptions ? priceDisplay : selectedUnitPrice}
            </span>
            {!itemHasOptions && (
              <span
                className="font-sans font-600 text-base opacity-70"
                style={{ color: primary }}
              >
                {currencyLabel}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto md:overflow-y-visible px-6 py-5 md:px-7 md:py-6">
          <h4 className="font-body  text-stone-900 text-xl md:text-2xl font-700 mb-3 text-balance">
            {locale === "ar" ? dish.nameAr : dish.nameEn}
          </h4>

          <p className="font-sans w-full text-stone-500 text-base leading-[1.7] mb-5 text-balance wrap-break-word">
            {locale === "ar" ? dish.descriptionAr : dish.descriptionEn}
          </p>

          <div
            className="w-10 h-0.5 rounded-full mb-4"
            style={{ backgroundColor: divider }}
          />

          {dish.allergens && dish.allergens.length > 0 ? (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {dish.allergens.map((a: string) => (
                  <span
                    key={a}
                    className="font-sans text-base font-500 text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {sizes.length > 0 ? (
            <div className="mb-5">
              <h5
                className="mb-2 text-sm font-semibold"
                style={{ color: primary }}
              >
                {locale === "ar" ? "الحجم" : "Size"}
              </h5>
              <div className="space-y-2">
                {sizes.map((size) => {
                  const label = pickSizeLabel(size, locale);
                  const checked = selectedSize?.nameEn === size.nameEn;
                  return (
                    <label
                      key={`${size.nameEn}-${size.price}`}
                      className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2.5 transition"
                      style={{
                        borderColor: checked
                          ? primary
                          : "#e7e5e4",
                        backgroundColor: checked
                          ? hexToRgba(primary, 0.06)
                          : "transparent",
                      }}
                    >
                      <span className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name={`emerald-size-${dish.id}`}
                          checked={checked}
                          onChange={() => setSelectedSize(size)}
                          className="h-4 w-4"
                          style={{ accentColor: primary }}
                        />
                        <span className="text-sm font-semibold text-stone-700">
                          {label}
                        </span>
                      </span>
                      <span
                        className="text-sm font-bold"
                        style={{ color: primary }}
                      >
                        {size.price} {currencyLabel}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ) : null}

          {variants.length > 0 ? (
            <div className="mb-5">
              <h5
                className="mb-2 text-sm font-semibold"
                style={{ color: primary }}
              >
                {locale === "ar" ? "الإضافات" : "Add-ons"}
              </h5>
              <div className="space-y-2">
                <label
                  className="flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition"
                  style={{
                    borderColor:
                      selectedVariant === null ? primary : "#e7e5e4",
                    backgroundColor:
                      selectedVariant === null
                        ? hexToRgba(primary, 0.06)
                        : "transparent",
                  }}
                >
                  <input
                    type="radio"
                    name={`emerald-variant-${dish.id}`}
                    checked={selectedVariant === null}
                    onChange={() => setSelectedVariant(null)}
                    className="h-4 w-4"
                    style={{ accentColor: primary }}
                  />
                  <span className="text-sm font-semibold text-stone-700">
                    {locale === "ar" ? "بدون إضافة" : "No add-on"}
                  </span>
                </label>
                {variants.map((variant) => {
                  const label = pickVariantLabel(variant, locale);
                  const checked = selectedVariant?.labelEn === variant.labelEn;
                  return (
                    <label
                      key={`${variant.labelEn}-${variant.price}`}
                      className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2.5 transition"
                      style={{
                        borderColor: checked ? primary : "#e7e5e4",
                        backgroundColor: checked
                          ? hexToRgba(primary, 0.06)
                          : "transparent",
                      }}
                    >
                      <span className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name={`emerald-variant-${dish.id}`}
                          checked={checked}
                          onChange={() => setSelectedVariant(variant)}
                          className="h-4 w-4"
                          style={{ accentColor: primary }}
                        />
                        <span className="text-sm font-semibold text-stone-700">
                          {label}
                        </span>
                      </span>
                      <span
                        className="text-sm font-bold"
                        style={{ color: primary }}
                      >
                        {variant.price > 0
                          ? `+${variant.price} ${currencyLabel}`
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

          {isTableOrder && dish ? (
            <div className="mb-6 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-stone-50/80 p-4">
                <button
                  type="button"
                  onClick={() => {
                    upsertSkyCartFromMenuItemWithOptions(dish, selectedQty, {
                      locale,
                      size: selectedSize,
                      variant: selectedVariant,
                    });
                    toast.success(
                      locale === "ar"
                        ? `تمت إضافة ${selectedQty} إلى السلة`
                        : `Added ${selectedQty} to cart`,
                    );
                    setSelectedQty(1);
                    onClose();
                  }}
                  className="rounded-xl px-4 py-2.5 text-base font-semibold text-white transition-opacity hover:opacity-90"
                  style={{
                    background: `linear-gradient(to bottom right, ${primary}, ${secondary})`,
                  }}
                >
                  {locale === "ar" ? "أضف إلى السلة" : "Add to cart"}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-300 text-stone-700"
                    onClick={() => setSelectedQty((q) => Math.max(1, q - 1))}
                    aria-label={locale === "ar" ? "تقليل" : "Decrease"}
                  >
                    −
                  </button>
                  <span className="min-w-8 text-center text-base font-semibold text-stone-800">
                    {selectedQty}
                  </span>
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-300 text-stone-700"
                    onClick={() => setSelectedQty((q) => q + 1)}
                    aria-label={locale === "ar" ? "زيادة" : "Increase"}
                  >
                    +
                  </button>
                </div>
              </div>
              {inCartQty > 0 ? (
                <p className="text-center text-base text-stone-500">
                  {locale === "ar"
                    ? `في السلة: ${inCartQty}`
                    : `In cart: ${inCartQty}`}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="px-6 py-4 md:px-7 md:py-5 border-t border-stone-100">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl border border-stone-200 font-sans font-600 text-stone-600 hover:bg-stone-50 hover:border-stone-300 transition-all text-base"
          >
            {locale === "ar" ? "العودة إلى القائمة" : "Back to Menu"}
          </button>
        </div>
      </div>
    </>
  );
}

export default function MenuSection({
  items,
  categories,
  currency,
}: {
  items: MenuItem[];
  categories: Category[];
  currency: string;
}) {
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const { openItem } = useTrackMenuItemClick();
  const [activeCategory, setActiveCategory] = useState(0);
  const [cart, setCart] = useState<SkyCart>({});
  const locale = useLocale();
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);
  const siteName = menuInfo?.name?.trim();
  const displayName = siteName || (locale === "ar" ? "زُمُرُّد" : "Emerald");
  const { isOrderingEnabled: isTableOrder } = useIsOrderingEnabled();
  const { primary, secondary } = useEmeraldTheme();
  const currencyLabel = useCurrencyLabel()(currency);

  useEffect(() => {
    const sync = () => setCart(readSkyCartFromCookie());
    sync();
    return subscribeSkyCartUpdated(sync);
  }, []);

  const handleAddToCartCard = (dish: MenuItem, quantity: number) => {
    upsertSkyCartFromMenuItemWithOptions(dish, quantity, { locale });
    setCart(readSkyCartFromCookie());
    toast.success(
      locale === "ar"
        ? `تمت إضافة ${quantity} إلى السلة`
        : `Added ${quantity} to cart`,
    );
  };

  const filteredItems =
    activeCategory === 0
      ? items
      : items.filter((dish) => dish.categoryId === activeCategory);

  return (
    <>
      <div className="mb-10">
        <p
          className="font-sans text-lg font-600 tracking-[0.18em] uppercase mb-3"
          style={{ color: secondary }}
        >
         {displayName}
        </p>
        <h4
          id="menu-heading"
          className="font-body  text-stone-900 text-xl tracking-tight"
        >
          {locale === "ar" ? "القائمة" : "Menu"}
        </h4>
      </div>

      <div className="mb-8 md:mb-12">
        <CategoryTabs
          categories={categories}
          active={activeCategory}
          onChange={(id) => setActiveCategory(Number(id))}
        />
      </div>

      <p
        key={`${activeCategory}-count`}
        className="font-sans text-base text-stone-400 mb-8 font-500 animate-fade-in motion-reduce:animate-none"
      >
        {filteredItems.length}{" "}
        {filteredItems.length === 1
          ? locale === "ar"
            ? "طبق"
            : "dish"
          : locale === "ar"
            ? "اطباق"
            : "dishes"}
        {activeCategory !== 0 ? (
          <>
            {" "}
            {locale === "ar" ? "في" : "in"}{" "}
            <span style={{ color: primary }}>
              {locale === "ar"
                ? categories.find((c) => c.id === activeCategory)?.nameAr
                : categories.find((c) => c.id === activeCategory)?.nameEn}
            </span>
          </>
        ) : null}
      </p>

      <div
        key={activeCategory}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8 animate-fade-in motion-reduce:animate-none"
      >
        {filteredItems.map((dish, i) => (
          <EmeraldMenuCard
            key={dish.id}
            dish={dish}
            index={i}
            onClick={(dish) => openItem(dish, setSelectedDish)}
            currencyLabel={currencyLabel}
            isTableOrder={isTableOrder}
            cartQuantity={getCartQuantityForMenuItem(cart, dish.id)}
            onAddToCart={handleAddToCartCard}
          />
        ))}
      </div>

      <EmeraldDishModal
        dish={selectedDish}
        onClose={() => setSelectedDish(null)}
        currencyLabel={currencyLabel}
      />
    </>
  );
}
