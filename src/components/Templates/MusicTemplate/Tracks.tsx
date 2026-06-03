"use client";

import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import { useLocale } from "next-intl";
import type { Category, MenuItem } from "@/types/menu";
import { useCurrencyLabel } from "@/lib/useCurrencyLabel";
import LoadImage from "@/components/ImageLoad";
import { useAppSelector } from "@/store/hooks";
import { useMusic } from "./MusicContext";
import {
  getProductMood,
  getProductTheme,
  MOOD_GLOW_HEX,
  pickItemDescription,
  pickItemName,
  type MoodKey,
} from "./moodEnergy";

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
  glowColor = "#4338CA66",
  mood = "peach",
}: {
  image: string;
  alt: string;
  isActive?: boolean;
  size?: "sm" | "lg";
  glowColor?: string;
  mood?: MoodKey;
}) {
  return (
    <div
      className={`music-vinyl-tile music-vinyl-tile--${size}${isActive ? " music-vinyl-tile--active" : ""}`}
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
                sizes={size === "lg" ? "(max-width: 768px) 82vw, 300px" : "88px"}
                className="object-cover object-center"
                disableLazy={size === "lg"}
              />
            </span>
          </div>
        </div>
      </div>
    </div>
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
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border bg-white text-start shadow-[0_8px_24px_-16px_rgba(67,56,202,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-14px_rgba(67,56,202,0.36)] ${
        isActive
          ? "border-brand-coral ring-2 ring-brand-coral/35"
          : "border-brand-sky/20 hover:border-brand-coral/35"
      }`}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-brand-sky/8">
        <LoadImage
          src={item.image}
          alt={name}
          fill
          disableLazy
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-brand-tomato/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {hasDiscount && discountPercent ? (
          <span className="absolute start-2.5 top-2.5 rounded-full bg-brand-coral px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
            {isAr ? `${discountPercent}%` : `-${discountPercent}%`}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-3.5 sm:p-4 text-start">
        <h4 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug text-brand-tomato sm:min-h-[2.75rem] sm:text-[0.9375rem]">
          {name}
        </h4>
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-0.5 pt-3 justify-start">
          {hasDiscount && item.originalPrice ? (
            <span className="text-xs font-semibold tabular-nums text-brand-tomato/45 line-through">
              {currencyLabel} {item.originalPrice}
            </span>
          ) : null}
          <span className="text-sm font-bold tabular-nums text-brand-coral sm:text-base">
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
  const { activeItem, activateItem, setActiveItemForce } = useMusic();
  const heroRef = useRef<HTMLDivElement>(null);

  const filteredItems = useMemo(() => {
    return items.filter((item) => item.available !== false);
  }, [items]);

  const currentItem = activeItem ?? filteredItems[0] ?? null;

  useEffect(() => {
    if (!filteredItems.length) return;
    const stillVisible = activeItem
      ? filteredItems.some((item) => item.id === activeItem.id)
      : false;
    if (!stillVisible || !activeItem) {
      setActiveItemForce(filteredItems[0]);
    }
  }, [filteredItems, activeItem, setActiveItemForce]);

  const selectProduct = (item: MenuItem) => {
    activateItem(item);
    heroRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!currentItem) return null;

  const activeName = pickItemName(currentItem, locale);
  const activeDescription = pickItemDescription(currentItem, locale);
  const categoryLabel = pickCategoryLabel(currentItem, storeCategories, locale);
  const productMood = getProductMood(currentItem, filteredItems);
  const glowColor = MOOD_GLOW_HEX[productMood];
  const feedTheme = getProductTheme(productMood);
  const { hasDiscount, discountPercent } = getItemDiscount(currentItem);

  return (
    <div id="menu" className="space-y-8 sm:space-y-10">
      <div
        className="music-feed music-feed-card music-feed-card--browse rounded-2xl border border-brand-sky/20 bg-white p-4 transition-[border-color,box-shadow,transform] duration-500 ease-out hover:-translate-y-0.5 music-card-grid sm:p-5"
        data-product-mood={productMood}
        style={
          {
            "--feed-accent": feedTheme.accentColor,
            "--feed-glow": feedTheme.glowColor,
          } as CSSProperties
        }
      >
        <div
          ref={heroRef}
          id={`menu-product-${currentItem.id}`}
          className="music-feed__hero music-feed__hero--preview scroll-mt-28"
          aria-labelledby="music-feed-title"
        >
          <div className="music-feed__vinyl-toggle">
            <VinylDisc
              key={currentItem.id}
              image={currentItem.image}
              alt={activeName}
              isActive
              size="lg"
              mood={productMood}
              glowColor={`${glowColor}66`}
            />
          </div>

          <div className="music-feed__meta">
            <span
              className={`music-feed__badge inline-block rounded-full bg-brand-sky/25 px-2.5 py-1 text-[0.6875rem] font-semibold tracking-[0.2em] text-brand-tomato transition-colors duration-500 ease-out${isAr ? "" : " uppercase"}`}
            >
              {categoryLabel}
            </span>
            <h3
              id="music-feed-title"
              className="music-feed__title text-brand-tomato transition-colors duration-300"
            >
              {activeName}
            </h3>
            <p className="music-feed__desc text-brand-tomato/70 transition-colors duration-300">
              {activeDescription}
            </p>
            <div className="mt-1 text-center sm:text-start">
              {hasDiscount && discountPercent ? (
                <span className="mb-1 inline-flex rounded-full bg-brand-coral px-2.5 py-0.5 text-[10px] font-bold uppercase text-white">
                  {isAr ? `${discountPercent}% خصم` : `${discountPercent}% off`}
                </span>
              ) : null}
              <div className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-0.5 sm:justify-start">
                {hasDiscount && currentItem.originalPrice ? (
                  <span className="text-sm font-semibold tabular-nums text-brand-tomato/45 line-through">
                    {currencyLabel} {currentItem.originalPrice}
                  </span>
                ) : null}
                <span className="music-feed__price text-brand-coral font-bold transition-colors duration-300 ">
                  {currencyLabel} {currentItem.price}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="music-tracks-grid">
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          {filteredItems.map((item) => (
            <ProductMenuCard
              key={item.id}
              item={item}
              isActive={item.id === currentItem.id}
              locale={locale}
              currencyLabel={currencyLabel}
              onSelect={() => selectProduct(item)}
            />
          ))}
        </div>
      </div>
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
