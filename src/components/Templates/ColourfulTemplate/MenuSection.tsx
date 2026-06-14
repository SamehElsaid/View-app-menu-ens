"use client";

import { useEffect, useState } from "react";

import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import type { Category, MenuItem } from "@/types/menu";
import { useCurrencyLabel } from "@/lib/useCurrencyLabel";
import { useColourfulTheme } from "./ColourfulThemeContext";
import LoadImage from "@/components/ImageLoad";
import {
  subscribeSkyCartUpdated,
  readSkyCartFromCookie,
  upsertSkyCartQuantityFromMenuItem,
  type SkyCartItem,
} from "@/lib/skyTemplateCart";
import { useTableCartAllowed } from "@/hooks/useTableCartAllowed";
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
  const { primary, secondary } = useColourfulTheme();

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
            shrink-0 flex items-center gap-2 px-5 py-2.5
            rounded-full text-base font-bold font-sans tracking-wide
            transition-all duration-300
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400/60 focus-visible:ring-offset-2
            ${
              isActive
                ? "text-white shadow-lg ring-2 ring-white/40"
                : "bg-white text-stone-800 shadow-md border border-stone-200/90 hover:bg-white hover:shadow-lg"
            }
          `}
            style={
              isActive
                ? {
                    background: `linear-gradient(to bottom right, ${primary}, ${secondary})`,
                  }
                : undefined
            }
          >
            {locale === "ar"
              ? (cat.nameAr ?? cat.name)
              : (cat.nameEn ?? cat.name)}
          </button>
        );
      })}
    </div>
  );
}

function ColourfulMenuCard({
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
  const { primary, secondary } = useColourfulTheme();
  const [cardPickQty, setCardPickQty] = useState(1);
  const badgeText = dish.discountPercent
    ? `${dish.discountPercent}% off`
    : null;
  const cardColor = index % 2 === 0 ? primary : secondary;
  const cardShadow = "0 4px 24px rgba(0,0,0,0.12)";
  const cardHoverShadow = "0 16px 48px rgba(0,0,0,0.18)";

  return (
    <article
      className="rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 ease-out hover:-translate-y-1.5 active:scale-[0.985] animate-slide-up motion-reduce:animate-none"
      style={{
        backgroundColor: cardColor,
        boxShadow: cardShadow,
        animationDelay: `${index * 45}ms`,
      }}
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
      <div className="relative h-52 overflow-hidden bg-black/10">
        <LoadImage
          src={dish.image ?? ""}
          alt={locale === "ar" ? dish.nameAr : dish.nameEn}
          fill
          className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.06]"
        />
        {badgeText && (
          <span
            className="absolute top-3 start-3 text-[11px] font-sans font-700 px-2.5 py-1 rounded-full tracking-wider uppercase text-white shadow-md"
            style={{ backgroundColor: index % 2 === 0 ? secondary : primary }}
          >
            {badgeText}
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h5 className="font-body font-700 text-white text-lg leading-snug text-balance min-w-0">
            {locale === "ar" ? dish.nameAr : dish.nameEn}
          </h5>
          <div className="shrink-0 rounded-2xl border border-white/20 bg-white/15 px-3.5 py-2 backdrop-blur-sm shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
            <div className="flex flex-col items-end gap-0.5">
              {dish.originalPrice ? (
                <span className="font-sans text-[11px] font-600 text-white/55 line-through tabular-nums leading-none">
                  {dish.originalPrice} {currencyLabel}
                </span>
              ) : null}
              <div className="flex items-baseline gap-1.5">
                <span className="font-sans text-xl font-800 text-white tabular-nums leading-none">
                  {dish.price}
                </span>
                <span className="font-sans text-xs font-600 text-white/75 uppercase tracking-wide">
                  {currencyLabel}
                </span>
              </div>
            </div>
          </div>
        </div>
        <p className="font-sans text-white/80 text-base leading-relaxed line-clamp-2">
          {locale === "ar" ? dish.descriptionAr : dish.descriptionEn}
        </p>

        {dish.allergens && dish.allergens.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {dish.allergens.map((a: string) => (
              <span
                key={a}
                className="text-[10px] font-sans font-500 text-white/90 bg-white/15 px-2 py-0.5 rounded-full uppercase tracking-wide"
              >
                {a}
              </span>
            ))}
          </div>
        )}

        {isTableOrder ? (
          <div
            className="mt-4 space-y-2 border-t border-white/15 pt-4"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="presentation"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 rounded-xl border border-white/20 bg-white/10 px-1 py-0.5">
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
                  onClick={() => setCardPickQty((q) => Math.max(1, q - 1))}
                  aria-label={locale === "ar" ? "تقليل" : "Decrease"}
                >
                  −
                </button>
                <span className="min-w-7 text-center text-base font-semibold text-white">
                  {cardPickQty}
                </span>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
                  onClick={() => setCardPickQty((q) => q + 1)}
                  aria-label={locale === "ar" ? "زيادة" : "Increase"}
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  onAddToCart(dish, cardPickQty);
                  setCardPickQty(1);
                }}
                className="rounded-full bg-white px-3 py-1.5 text-base font-semibold text-stone-900"
              >
                {locale === "ar" ? "أضف للسلة" : "Add to cart"}
              </button>
            </div>
            {cartQuantity > 0 ? (
              <p className="text-center text-base text-white/75">
                {locale === "ar"
                  ? `في السلة: ${cartQuantity}`
                  : `In cart: ${cartQuantity}`}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/15">
          <span className="font-sans text-base font-600 tracking-wide uppercase text-white/90">
            {locale === "ar" ? "عرض التفاصيل" : "View Details"}
          </span>
          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-white/20 group-hover:scale-110 transition-transform duration-200">
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

function ColourfulDishModal({
  dish,
  onClose,
  currencyLabel,
}: {
  dish: MenuItem | null;
  onClose: () => void;
  currencyLabel: string;
}) {
  const locale = useLocale() as "ar" | "en";
  const searchParams = useSearchParams();
  const tableCartAllowed = useTableCartAllowed();
  const isTableOrder =
    Boolean(searchParams.get("table")?.trim()) && tableCartAllowed;
  const [selectedQty, setSelectedQty] = useState(1);
  const [inCartQty, setInCartQty] = useState(0);
  const { primary, secondary } = useColourfulTheme();

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
    setSelectedQty(1);
    const sync = () => {
      const c = readSkyCartFromCookie();
      setInCartQty(c[dish.id]?.quantity ?? 0);
    };
    sync();
    return subscribeSkyCartUpdated(sync);
  }, [dish]);

  if (!dish) return null;

  const dishName = locale === "ar" ? dish.nameAr : dish.nameEn;
  const dishDescription =
    locale === "ar" ? dish.descriptionAr : dish.descriptionEn;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md animate-fade-in motion-reduce:animate-none"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={dishName}
        className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-1.25rem)] max-w-[640px] max-h-[90dvh] flex flex-col rounded-[1.75rem] sm:rounded-[2rem] overflow-hidden ring-1 ring-white/15 animate-scale-in motion-reduce:animate-none shadow-[0_32px_80px_rgba(0,0,0,0.35)]"
        style={{ backgroundColor: primary }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative shrink-0 w-full aspect-[4/3] min-h-[220px] sm:min-h-[280px] overflow-hidden">
          <LoadImage
            src={dish.image ?? ""}
            alt={dishName}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent" />
          <div
            className="absolute inset-x-0 bottom-0 h-28"
            style={{
              background: `linear-gradient(to top, ${primary}, transparent)`,
            }}
          />

          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 end-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md transition-all hover:bg-black/50 hover:scale-105"
            aria-label={locale === "ar" ? "إغلاق" : "Close"}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
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
              className="absolute top-3 start-3 rounded-full px-3 py-1.5 text-[11px] font-sans font-700 uppercase tracking-wider text-white shadow-lg"
              style={{ backgroundColor: secondary }}
            >
              {dish.discountPercent}% {locale === "ar" ? "خصم" : "off"}
            </span>
          ) : null}

          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
            <h4 className="font-body text-white text-2xl sm:text-[1.75rem] font-700 leading-tight text-balance [text-shadow:0_2px_16px_rgba(0,0,0,0.45)]">
              {dishName}
            </h4>
            <div className="mt-3 inline-flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/15 px-4 py-2 backdrop-blur-md">
              {dish.originalPrice ? (
                <span className="font-sans text-sm font-600 text-white/60 line-through tabular-nums">
                  {dish.originalPrice} {currencyLabel}
                </span>
              ) : null}
              <span className="font-sans text-2xl font-800 text-white tabular-nums leading-none">
                {dish.price}
              </span>
              <span className="font-sans text-sm font-600 text-white/80">
                {currencyLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 sm:py-6 space-y-5">
          {dishDescription ? (
            <p className="font-sans text-white/85 text-base leading-[1.75] text-balance wrap-break-word">
              {dishDescription}
            </p>
          ) : null}

          {dish.allergens && dish.allergens.length > 0 ? (
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <p className="font-sans text-[11px] font-700 uppercase tracking-[0.16em] text-white/60 mb-3">
                {locale === "ar" ? "مسببات الحساسية" : "Allergens"}
              </p>
              <div className="flex flex-wrap gap-2">
                {dish.allergens.map((a: string) => (
                  <span
                    key={a}
                    className="font-sans text-sm font-500 text-white bg-white/15 px-3 py-1.5 rounded-full"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {isTableOrder ? (
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1 rounded-xl border border-white/20 bg-black/10 px-1 py-0.5">
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10"
                    onClick={() => setSelectedQty((q) => Math.max(1, q - 1))}
                    aria-label={locale === "ar" ? "تقليل" : "Decrease"}
                  >
                    −
                  </button>
                  <span className="min-w-8 text-center text-base font-semibold text-white">
                    {selectedQty}
                  </span>
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10"
                    onClick={() => setSelectedQty((q) => q + 1)}
                    aria-label={locale === "ar" ? "زيادة" : "Increase"}
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    upsertSkyCartQuantityFromMenuItem(dish, selectedQty);
                    setSelectedQty(1);
                  }}
                  className="flex-1 min-w-[10rem] rounded-xl bg-white px-4 py-2.5 text-base font-semibold text-stone-900 transition-all hover:opacity-90 active:scale-[0.98]"
                >
                  {locale === "ar" ? "أضف إلى السلة" : "Add to cart"}
                </button>
              </div>
              {inCartQty > 0 ? (
                <p className="text-center text-sm text-white/75">
                  {locale === "ar"
                    ? `في السلة: ${inCartQty}`
                    : `In cart: ${inCartQty}`}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-white/15 bg-black/10 px-5 sm:px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl border border-white/25 py-3.5 font-sans font-600 text-white transition-all hover:bg-white/10 active:scale-[0.99] text-base"
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
  const [cartById, setCartById] = useState<Record<number, SkyCartItem>>({});
  const locale = useLocale();
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);
  const menuCustomizations = useAppSelector(
    (state) => state.menu.menuCustomizations,
  );
  const siteName = menuInfo?.name?.trim();
  const heroTitle =
    locale === "ar"
      ? menuCustomizations?.heroTitleAr?.trim() || siteName
      : menuCustomizations?.heroTitleEn?.trim() || siteName;
  const displayName = heroTitle || (locale === "ar" ? "ملوّن" : "Colourful");
  const searchParams = useSearchParams();
  const tableCartAllowed = useTableCartAllowed();
  const isTableOrder =
    Boolean(searchParams.get("table")?.trim()) && tableCartAllowed;
  const currencyLabel = useCurrencyLabel()(currency);

  useEffect(() => {
    const sync = () => setCartById(readSkyCartFromCookie());
    sync();
    return subscribeSkyCartUpdated(sync);
  }, []);

  const handleAddToCartCard = (dish: MenuItem, quantity: number) => {
    upsertSkyCartQuantityFromMenuItem(dish, quantity);
    setCartById(readSkyCartFromCookie());
  };

  const filteredItems =
    activeCategory === 0
      ? items
      : items.filter((dish) => dish.categoryId === activeCategory);

  return (
    <>
      <div className="mb-10">
        <p className="font-sans text-lg font-600 tracking-[0.18em] uppercase mb-3 text-stone-500">
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
        className="inline-flex flex-wrap items-center gap-1 rounded-2xl border border-stone-200/90 bg-white/75 px-4 py-2.5 mb-8 font-sans text-base font-500 text-stone-700 backdrop-blur-sm shadow-sm animate-fade-in motion-reduce:animate-none"
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
            <span className="font-600 text-stone-900">
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
          <ColourfulMenuCard
            key={dish.id}
            dish={dish}
            index={i}
            onClick={(dish) => openItem(dish, setSelectedDish)}
            currencyLabel={currencyLabel}
            isTableOrder={isTableOrder}
            cartQuantity={cartById[dish.id]?.quantity ?? 0}
            onAddToCart={handleAddToCartCard}
          />
        ))}
      </div>

      <ColourfulDishModal
        dish={selectedDish}
        onClose={() => setSelectedDish(null)}
        currencyLabel={currencyLabel}
      />
    </>
  );
}
