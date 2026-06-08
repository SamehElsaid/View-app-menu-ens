"use client";

import { useEffect, useMemo, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useLocale } from "next-intl";
import type { Category, MenuItem } from "@/types/menu";
import { useCurrencyLabel } from "@/lib/useCurrencyLabel";
import LoadImage from "@/components/ImageLoad";
import { useAppSelector } from "@/store/hooks";
import { useMusic } from "./MusicContext";
import {
  getProductMood,
  getProductTheme,
  pickItemDescription,
  pickItemName,
  type MoodKey,
} from "./moodEnergy";
import { useMusicBrandStyle } from "./useMusicBrandStyle";

type TracksProps = {
  items: MenuItem[];
  currency: string;
};

function getItemDiscount(item: MenuItem) {
  const hasDiscount =
    item.originalPrice != null && item.originalPrice > item.price;
  const discountPercent =
    item.discountPercent ??
    (hasDiscount && item.originalPrice
      ? Math.round(
          ((item.originalPrice - item.price) / item.originalPrice) * 100,
        )
      : null);

  return { hasDiscount, discountPercent };
}

function pickCategoryLabel(
  item: MenuItem,
  categories: Category[],
  locale: "ar" | "en",
): string {
  const isAr = locale === "ar";
  const fromItem = isAr
    ? item.categoryNameAr?.trim() ||
      item.categoryName?.trim() ||
      item.category?.trim()
    : item.categoryNameEn?.trim() ||
      item.categoryName?.trim() ||
      item.category?.trim();

  if (fromItem) return fromItem;

  const category = categories.find((c) => c.id === item.categoryId);
  if (!category) return isAr ? "غير مصنّف" : "Uncategorized";

  return isAr
    ? (category.nameAr ?? category.name)
    : (category.nameEn ?? category.name);
}

function VinylDisc({
  image,
  alt,
  isActive = false,
  size = "lg",
  glowColor = "color-mix(in srgb, var(--color-brand-tomato) 40%, transparent)",
  mood = "peach",
  className = "",
}: {
  image: string;
  alt: string;
  isActive?: boolean;
  size?: "sm" | "lg";
  glowColor?: string;
  mood?: MoodKey;
  className?: string;
}) {
  return (
    <div
      className={`music-vinyl-tile music-vinyl-tile--${size}${isActive ? " music-vinyl-tile--active" : ""}${className ? ` ${className}` : ""}`}
      data-mood={mood}
      style={{ "--vinyl-glow": glowColor } as CSSProperties}
    >
      <div className="music-vinyl-tile__aura" aria-hidden />
      <div className="music-vinyl-tile__spin">
        <div className="music-vinyl-tile__disc">
          <div className="music-vinyl-tile__groove" aria-hidden />
          <div className="music-vinyl-tile__label">
            <span className="music-vinyl-tile__photo">
              <LoadImage
                src={image}
                alt={alt}
                fill
                sizes={
                  size === "lg"
                    ? "(max-width: 768px) 82vw, 300px"
                    : "88px"
                }
                className="object-cover object-center"
                disableLazy={size !== "sm"}
                useMenuLogoFallback={false}
              />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalProductImage({
  image,
  alt,
  mood,
}: {
  image: string;
  alt: string;
  mood: MoodKey;
}) {
  return (
    <div
      className="music-product-modal__image relative mx-auto w-full shrink-0 overflow-hidden rounded-xl border border-brand-sky/25 bg-brand-honeydew shadow-[0_10px_36px_-14px_var(--feed-glow,color-mix(in_srgb,var(--color-brand-coral)_35%,transparent))] aspect-[4/3] sm:aspect-[16/10] sm:max-h-[300px]"
      data-product-mood={mood}
    >
      <LoadImage
        src={image}
        alt={alt}
        fill
        width={960}
        height={600}
        sizes="(max-width: 640px) 92vw, 640px"
        className="object-cover object-center"
        disableLazy
        useMenuLogoFallback={false}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-t from-brand-tomato/12 via-transparent to-brand-sky/5"
        aria-hidden
      />
    </div>
  );
}

function ProductDetailModal({
  item,
  allItems,
  categories,
  currencyLabel,
  locale,
  onClose,
}: {
  item: MenuItem;
  allItems: MenuItem[];
  categories: Category[];
  currencyLabel: string;
  locale: "ar" | "en";
  onClose: () => void;
}) {
  const isAr = locale === "ar";
  const activeName = pickItemName(item, locale);
  const activeDescription = pickItemDescription(item, locale);
  const categoryLabel = pickCategoryLabel(item, categories, locale);
  const productMood = getProductMood(item, allItems);
  const feedTheme = getProductTheme(productMood);
  const { hasDiscount, discountPercent } = getItemDiscount(item);
  const brandStyle = useMusicBrandStyle();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="music-root music-product-modal-portal fixed inset-0 z-[100]"
      style={brandStyle}
    >
      <div
        className="music-product-modal__backdrop fixed inset-0 z-0 animate-fade-in backdrop-blur-md motion-reduce:animate-none"
        onClick={onClose}
        aria-hidden
      />
      <div className="pointer-events-none fixed inset-0 z-[10] flex items-center justify-center p-3 sm:p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="music-product-modal-title"
          className="music-product-modal pointer-events-auto w-full max-w-[480px] animate-scale-in motion-reduce:animate-none sm:max-w-[640px]"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="music-feed-card music-feed-card--browse music-product-modal__panel relative overflow-x-hidden overflow-y-auto rounded-2xl border border-brand-sky/20 bg-white p-4 pb-6 sm:p-6 sm:pb-6"
            data-product-mood={productMood}
            style={
              {
                "--feed-accent": feedTheme.accentColor,
                "--feed-glow": feedTheme.glowColor,
              } as CSSProperties
            }
          >
            <button
              type="button"
              onClick={onClose}
              aria-label={isAr ? "إغلاق" : "Close"}
              className="absolute end-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-brand-sky/25 bg-white/95 text-brand-tomato shadow-sm transition-colors hover:border-brand-coral/40 hover:text-brand-coral"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path
                  d="M3 3l8 8M11 3l-8 8"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>

          <div
            className="music-product-modal__hero flex flex-col items-center gap-3 pt-10 text-center sm:gap-4 sm:pt-11 sm:py-2"
            aria-labelledby="music-product-modal-title"
          >
            <ModalProductImage
              key={item.id}
              image={item.image}
              alt={activeName}
              mood={productMood}
            />

            <div className="music-product-modal__meta music-feed__meta mt-0 w-full max-w-none">
              <span
                className={`music-feed__badge inline-block rounded-full bg-brand-sky/25 px-2.5 py-1 text-[0.6875rem] font-semibold tracking-[0.2em] transition-colors duration-500 ease-out${isAr ? "" : " uppercase"}`}
              >
                {categoryLabel}
              </span>
              <h3
                id="music-product-modal-title"
                className="music-feed__title music-product-modal__title transition-colors duration-300"
              >
                {activeName}
              </h3>
              <p className="music-feed__desc music-product-modal__desc transition-colors duration-300">
                {activeDescription}
              </p>
              <div className="mt-1 text-center">
                {hasDiscount && discountPercent ? (
                  <span className="mb-1 inline-flex rounded-full bg-brand-coral px-2.5 py-0.5 text-[10px] font-bold uppercase text-white">
                    {isAr
                      ? `${discountPercent}% \u062e\u0635\u0645`
                      : `${discountPercent}% off`}
                  </span>
                ) : null}
                <div className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-0.5">
                  {hasDiscount && item.originalPrice ? (
                    <span className="text-sm font-semibold tabular-nums text-[color:var(--music-text-muted)] line-through">
                      {currencyLabel} {item.originalPrice}
                    </span>
                  ) : null}
                  <span className="music-feed__price font-bold transition-colors duration-300">
                    {currencyLabel} {item.price}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>,
    document.body,
  );
}

function ProductMenuCard({
  item,
  isActive,
  locale,
  currencyLabel,
  onSelect,
}: {
  item: MenuItem;
  isActive: boolean;
  locale: "ar" | "en";
  currencyLabel: string;
  onSelect: () => void;
}) {
  const isAr = locale === "ar";
  const name = pickItemName(item, locale);
  const { hasDiscount, discountPercent } = getItemDiscount(item);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={isActive ? "true" : undefined}
      className={`group flex h-full flex-col overflow-hidden rounded-xl border bg-white text-start shadow-[0_6px_20px_-14px_rgba(67,56,202,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_-12px_rgba(67,56,202,0.32)] ${
        isActive
          ? "border-brand-coral ring-2 ring-brand-coral/35"
          : "border-brand-sky/20 hover:border-brand-coral/35"
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-brand-sky/8">
        <LoadImage
          src={item.image}
          alt={name}
          fill
          disableLazy
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-brand-tomato/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {hasDiscount && discountPercent ? (
          <span className="absolute start-2 top-2 rounded-full bg-brand-coral px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-sm">
            {isAr ? `${discountPercent}%` : `-${discountPercent}%`}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-2 sm:p-2.5 text-start">
        <h4 className="line-clamp-2 min-h-[1.625rem] text-[11px] font-bold leading-snug text-brand-tomato sm:min-h-[1.75rem] sm:text-xs">
          {name}
        </h4>
        <div className="mt-auto flex flex-wrap items-baseline justify-center gap-x-1.5 gap-y-0.5 pt-1.5 text-center">
          {hasDiscount && item.originalPrice ? (
            <span className="text-[11px] font-semibold tabular-nums text-brand-tomato/55 line-through sm:text-xs">
              {currencyLabel} {item.originalPrice}
            </span>
          ) : null}
          <span className="text-xs font-bold tabular-nums text-brand-coral sm:text-sm">
            {currencyLabel} {item.price}
          </span>
        </div>
      </div>
    </button>
  );
}

function TracksFeed({
  items,
  currency,
}: {
  items: MenuItem[];
  currency: string;
}) {
  const locale = useLocale() as "ar" | "en";
  const isAr = locale === "ar";
  const getCurrencyLabel = useCurrencyLabel();
  const currencyLabel = getCurrencyLabel(currency);
  const storeCategories = useAppSelector((state) => state.menu.categories) ?? [];
  const { modalItem, openProductModal, closeProductModal } = useMusic();

  const filteredItems = useMemo(() => {
    return items.filter((item) => item.available !== false);
  }, [items]);

  if (!filteredItems.length) return null;

  return (
    <div id="menu" className="space-y-8 sm:space-y-10">
      <div className="music-tracks-grid px-2 sm:px-4 lg:px-6">
        <div className="mb-4 sm:mb-5 text-start">
          <p
            className={`text-[0.6875rem] font-semibold tracking-[0.24em] text-brand-tomato/50 ${isAr ? "" : "uppercase"}`}
          >
            {isAr ? "كل المنتجات" : "All items"}
          </p>
          <h4 className="mt-1 text-lg font-bold text-brand-tomato sm:text-xl">
            {isAr ? "المزيد من القائمة" : "Browse menu"}
          </h4>
        </div>
        <div className="mx-auto grid w-full max-w-4xl grid-cols-2 gap-2 sm:max-w-5xl sm:grid-cols-3 sm:gap-2.5 lg:gap-3">
          {filteredItems.map((item) => (
            <ProductMenuCard
              key={item.id}
              item={item}
              isActive={item.id === modalItem?.id}
              locale={locale}
              currencyLabel={currencyLabel}
              onSelect={() => openProductModal(item)}
            />
          ))}
        </div>
      </div>

      {modalItem ? (
        <ProductDetailModal
          item={modalItem}
          allItems={filteredItems}
          categories={storeCategories}
          currencyLabel={currencyLabel}
          locale={locale}
          onClose={closeProductModal}
        />
      ) : null}
    </div>
  );
}

export default function Tracks({ items, currency }: TracksProps) {
  const locale = useLocale();
  const { activeCategoryId } = useMusic();

  const filteredItems = useMemo(() => {
    if (activeCategoryId === null) return items;
    return items.filter((item) => item.categoryId === activeCategoryId);
  }, [activeCategoryId, items]);

  if (!items.length) {
    return (
      <section className="music-tracks">
        <p className="music-tracks-empty text-brand-tomato/60 transition-colors duration-300">
          {locale === "ar" ? "لا توجد منتجات" : "No menu items available"}
        </p>
      </section>
    );
  }

  if (!filteredItems.length) {
    return (
      <section className="music-tracks">
        <p className="music-tracks-empty text-brand-tomato/60 transition-colors duration-300">
          {locale === "ar"
            ? "لا توجد منتجات في هذا القسم"
            : "No items in this category"}
        </p>
      </section>
    );
  }

  return (
    <section className="music-tracks" aria-label="Menu feed">
      <TracksFeed items={filteredItems} currency={currency} />
    </section>
  );
}
