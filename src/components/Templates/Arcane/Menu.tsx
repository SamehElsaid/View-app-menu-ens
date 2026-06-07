"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import type { Category, MenuItem } from "@/types/menu";
import { resolveMenuItemImageSrc } from "@/lib/menuItemImage";
import { useCurrencyLabel } from "@/lib/useCurrencyLabel";
import {
  ARCANE_RED,
  ARCANE_DEFAULT_SECONDARY,
  hexToRgba,
} from "./ArcaneThemeContext";
import LoadImage from "@/components/ImageLoad";
import {
  SKY_CART_UPDATED_EVENT,
  readSkyCartFromCookie,
  upsertSkyCartQuantityFromMenuItem,
} from "@/lib/skyTemplateCart";
import { useTableCartAllowed } from "@/hooks/useTableCartAllowed";
import { useAppSelector } from "@/store/hooks";

function DishModal({
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

  useEffect(() => {
    document.body.style.overflow = dish ? "hidden" : "";
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
    window.addEventListener(SKY_CART_UPDATED_EVENT, sync);
    return () => window.removeEventListener(SKY_CART_UPDATED_EVENT, sync);
  }, [dish]);

  if (!dish) return null;

  const backdrop = hexToRgba(ARCANE_RED, 0.45);
  const modalShadow = `0 24px 80px ${hexToRgba(ARCANE_RED, 0.2)}, 0 8px 24px rgba(0,0,0,0.12)`;
  const imageBg = hexToRgba(ARCANE_RED, 0.06);
  const divider = hexToRgba(ARCANE_DEFAULT_SECONDARY, 0.55);

  return (
    <>
      <div
        className="fixed inset-0 z-50 animate-fade-in backdrop-blur-base motion-reduce:animate-none"
        style={{ backgroundColor: backdrop }}
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={locale === "ar" ? dish.nameAr : dish.nameEn}
        className="fixed top-1/2 left-1/2 z-50 flex max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-[600px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-white animate-scale-in motion-reduce:animate-none sm:rounded-3xl md:max-h-none"
        style={{ boxShadow: modalShadow }}
      >
        <div
          className="relative aspect-[4/3] shrink-0"
          style={{ backgroundColor: imageBg }}
        >
          <LoadImage
            src={resolveMenuItemImageSrc(dish.image)}
            alt={locale === "ar" ? dish.nameAr : dish.nameEn}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
          <button
            type="button"
            onClick={onClose}
            className="absolute end-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-stone-700 shadow-md backdrop-blur-md transition-all hover:scale-105 hover:bg-white"
            aria-label="Close"
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
              className="absolute start-3 top-3 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-md"
              style={{ backgroundColor: ARCANE_RED }}
            >
              {dish.discountPercent}% off
            </span>
          ) : null}
          <div className="absolute end-4 bottom-4 flex items-center gap-3 rounded-2xl bg-white/95 px-5 py-3 shadow-lg backdrop-blur-md">
            {dish.originalPrice ? (
              <span className="text-lg font-semibold text-stone-400 line-through tabular-nums">
                {dish.originalPrice} {currencyLabel}
              </span>
            ) : null}
            <span
              className="text-3xl font-extrabold tracking-tight tabular-nums"
              style={{ color: ARCANE_RED }}
            >
              {dish.price}
            </span>
            <span className="text-base font-semibold opacity-70" style={{ color: ARCANE_RED }}>
              {currencyLabel}
            </span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 md:overflow-y-visible md:px-7 md:py-6">
          <h4 className="mb-3 font-body text-xl font-bold text-balance text-stone-900 md:text-2xl">
            {locale === "ar" ? dish.nameAr : dish.nameEn}
          </h4>
          <p className="mb-5 w-full text-balance text-base leading-[1.7] wrap-break-word text-stone-500">
            {locale === "ar" ? dish.descriptionAr : dish.descriptionEn}
          </p>
          <div className="mb-4 h-0.5 w-10 rounded-full" style={{ backgroundColor: divider }} />
          {dish.allergens && dish.allergens.length > 0 ? (
            <div className="mb-6 flex flex-wrap gap-2">
              {dish.allergens.map((a: string) => (
                <span
                  key={a}
                  className="rounded-full bg-amber-50 px-3 py-1.5 text-base font-medium text-amber-700"
                >
                  {a}
                </span>
              ))}
            </div>
          ) : null}
          {isTableOrder ? (
            <div className="mb-6 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-stone-50/80 p-4">
                <button
                  type="button"
                  onClick={() => {
                    upsertSkyCartQuantityFromMenuItem(dish, selectedQty);
                    setSelectedQty(1);
                  }}
                  className="rounded-xl px-4 py-2.5 text-base font-semibold text-white transition-opacity hover:opacity-90"
                  style={{
                    background: `linear-gradient(to bottom right, ${ARCANE_RED}, ${ARCANE_DEFAULT_SECONDARY})`,
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
                  {locale === "ar" ? `في السلة: ${inCartQty}` : `In cart: ${inCartQty}`}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="border-t border-stone-100 px-6 py-4 md:px-7 md:py-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl border border-stone-200 py-3.5 text-base font-semibold text-stone-600 transition-all hover:border-stone-300 hover:bg-stone-50"
          >
            {locale === "ar" ? "العودة إلى القائمة" : "Back to Menu"}
          </button>
        </div>
      </div>
    </>
  );
}

function CategoryPills({
  categories,
  active,
  onChange,
  locale,
}: {
  categories: Category[];
  active: number;
  onChange: (id: number) => void;
  locale: "ar" | "en";
}) {
  const tabs: Category[] = [
    { id: 0, name: "All", nameAr: "الكل", nameEn: "All", menuItems: [] },
    ...categories,
  ];

  return (
    <div
      className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-2 scroll-smooth snap-x sm:-mx-0 sm:mb-12 sm:flex-wrap sm:justify-center sm:gap-3 sm:overflow-visible sm:px-0 md:mb-16"
      role="tablist"
      aria-label={locale === "ar" ? "التصنيفات" : "Categories"}
    >
      {tabs.map((cat) => {
        const isActive = cat.id === active;
        return (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(cat.id)}
            className="shrink-0 snap-start rounded-full border-2 px-4 py-2 text-xs font-black uppercase tracking-wide transition-colors sm:px-6 sm:py-2.5 sm:text-sm"
            style={{
              borderColor: isActive ? ARCANE_RED : "#e5e5e5",
              backgroundColor: isActive ? ARCANE_RED : "transparent",
              color: isActive ? "#FFFFFF" : "#111111",
            }}
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

function SlideProgress({
  slideIndex,
  total,
  isAr,
}: {
  slideIndex: number;
  total: number;
  isAr: boolean;
}) {
  return (
    <div className={`mt-5 ${isAr ? "text-end" : ""}`}>
      <p className="text-xs font-semibold tabular-nums text-[#666666] sm:text-sm">
        {slideIndex + 1} / {total}{" "}
        {total === 1
          ? isAr
            ? "منتج"
            : "item"
          : isAr
            ? "منتجات"
            : "items"}
      </p>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[#eeeeee]">
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{
            width: `${total > 0 ? ((slideIndex + 1) / total) * 100 : 0}%`,
            backgroundColor: ARCANE_RED,
          }}
        />
      </div>
    </div>
  );
}

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

function ProductMenuCard({
  item,
  isActive,
  isAr,
  currencyLabel,
  onSelect,
}: {
  item: MenuItem;
  isActive: boolean;
  isAr: boolean;
  currencyLabel: string;
  onSelect: () => void;
}) {
  const name = isAr ? item.nameAr : item.nameEn;
  const { hasDiscount, discountPercent } = getItemDiscount(item);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={isActive ? "true" : undefined}
      className={`group overflow-hidden border bg-white text-start transition-all hover:shadow-md ${
        isActive
          ? "border-2 shadow-md"
          : "border-[#eeeeee] hover:border-[#dddddd]"
      }`}
      style={isActive ? { borderColor: ARCANE_RED } : undefined}
    >
      <div className="relative aspect-square overflow-hidden bg-[#fafafa]">
        <LoadImage
          src={item.image}
          alt={name}
          fill
          disableLazy
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {hasDiscount && discountPercent ? (
          <span
            className="absolute start-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-black uppercase text-white"
            style={{ backgroundColor: ARCANE_RED }}
          >
            {isAr ? `${discountPercent}%` : `-${discountPercent}%`}
          </span>
        ) : null}
      </div>
      <div className={`p-3 sm:p-4 ${isAr ? "text-end" : ""}`}>
        <h4 className="line-clamp-2 font-body text-sm font-black leading-snug text-[#111111] sm:text-base">
          {name}
        </h4>
        <div
          className={`mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 ${isAr ? "justify-end" : ""}`}
        >
          {hasDiscount && item.originalPrice ? (
            <span className="text-xs font-semibold tabular-nums text-[#999999] line-through">
              {currencyLabel} {item.originalPrice}
            </span>
          ) : null}
          <span
            className="text-sm font-black tabular-nums sm:text-base"
            style={{ color: ARCANE_RED }}
          >
            {currencyLabel} {item.price}
          </span>
        </div>
      </div>
    </button>
  );
}

function ProductMenuGrid({
  items,
  activeIndex,
  isAr,
  currencyLabel,
  onSelect,
}: {
  items: MenuItem[];
  activeIndex: number;
  isAr: boolean;
  currencyLabel: string;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="mt-10 grid grid-cols-2 gap-3 sm:mt-12 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
      {items.map((item, index) => (
        <ProductMenuCard
          key={item.id}
          item={item}
          isActive={index === activeIndex}
          isAr={isAr}
          currencyLabel={currencyLabel}
          onSelect={() => onSelect(index)}
        />
      ))}
    </div>
  );
}

function NavArrow({
  direction,
  onClick,
  label,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="pointer-events-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[#111111] bg-white text-xl font-black text-[#111111] transition-colors hover:bg-[#111111] hover:text-white sm:h-12 sm:w-12"
    >
      {direction === "prev" ? "‹" : "›"}
    </button>
  );
}

export default function Menu({
  items,
  categories,
  currency,
}: {
  items: MenuItem[];
  categories: Category[];
  currency: string;
}) {
  const locale = useLocale() as "ar" | "en";
  const isAr = locale === "ar";
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);
  const displayName = menuInfo?.name?.trim() || "Arcane";
  const currencyLabel = useCurrencyLabel()(currency);

  const [activeCategory, setActiveCategory] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const featuredRef = useRef<HTMLDivElement>(null);

  const filteredItems = useMemo(
    () =>
      activeCategory === 0
        ? items
        : items.filter((d) => d.categoryId === activeCategory),
    [items, activeCategory],
  );

  const current = filteredItems[slideIndex] ?? null;
  const total = filteredItems.length;

  useEffect(() => {
    setSlideIndex(0);
  }, [activeCategory]);

  const goPrev = () => {
    setSlideIndex((i) => (i <= 0 ? Math.max(0, total - 1) : i - 1));
  };

  const goNext = () => {
    setSlideIndex((i) => (i >= total - 1 ? 0 : i + 1));
  };

  const selectProduct = (index: number) => {
    setSlideIndex(index);
    featuredRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (total === 0) {
    return (
      <section
        id="menu"
        className="overflow-x-clip bg-white px-4 py-16 text-center sm:px-6 sm:py-24"
      >
        <p className="text-base text-[#666666] sm:text-lg">
          {isAr ? "لا توجد عناصر في القائمة." : "No menu items yet."}
        </p>
      </section>
    );
  }

  const categoryId =
    activeCategory !== 0 ? activeCategory : current?.categoryId;
  const activeCat = categoryId
    ? categories.find((c) => c.id === categoryId)
    : undefined;
  const categoryLabel = activeCat
    ? isAr
      ? (activeCat.nameAr ?? activeCat.name)
      : (activeCat.nameEn ?? activeCat.name)
    : isAr
      ? "الكل"
      : "All";

  const name = current ? (isAr ? current.nameAr : current.nameEn) : "";
  const description = current
    ? isAr
      ? current.descriptionAr
      : current.descriptionEn
    : "";
  const { hasDiscount, discountPercent } = current
    ? getItemDiscount(current)
    : { hasDiscount: false, discountPercent: null as number | null };

  return (
    <section
      id="menu"
      className="overflow-x-clip bg-white px-4 py-6 sm:px-6 sm:py-6 md:py-6 lg:py-6"
      aria-labelledby="menu-heading"
    >
      <div className="mx-auto max-w-7xl">
        <p
          className="mb-3 text-center text-[10px] font-black uppercase tracking-[0.28em] sm:mb-4 sm:text-xs sm:tracking-[0.35em]"
          style={{ color: ARCANE_RED }}
        >
          {displayName}
        </p>
        <h2
          id="menu-heading"
          className="mb-4 text-center font-body text-2xl font-black uppercase tracking-tight text-[#111111] sm:mb-6 sm:text-3xl md:text-4xl lg:text-5xl"
        >
          {isAr ? (
            <>
              استكشف <span style={{ color: ARCANE_RED }}>القائمة</span>
            </>
          ) : (
            <>
              Explore <span style={{ color: ARCANE_RED }}>Menu</span>
            </>
          )}
        </h2>
    {/*     <p className="mx-auto mb-8 max-w-2xl text-center text-sm text-[#666666] sm:mb-12 sm:text-base md:text-lg">
          {isAr
            ? "تجربة تحريرية — كل منتج يحكي قصته."
            : "An editorial journey — each product tells its story."}
        </p> */}

        <CategoryPills
          categories={categories}
          active={activeCategory}
          onChange={setActiveCategory}
          locale={locale}
        />

        <div
          ref={featuredRef}
          className="relative scroll-mt-24 sm:scroll-mt-28"
        >
          <div
            key={`${activeCategory}-${current?.id}`}
            className="grid min-w-0 items-start gap-6 sm:gap-8 lg:grid-cols-2 lg:items-center lg:gap-16"
          >
            <div className={isAr ? "lg:order-2" : "lg:order-1"}>
              <div className="relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl bg-[#fafafa] shadow-[0_16px_48px_-20px_rgba(17,17,17,0.18)] ring-1 ring-black/[0.04] sm:aspect-[4/5] sm:max-w-none sm:rounded-3xl lg:max-h-[min(65vh,560px)]">
                {current ? (
                  <LoadImage
                    src={resolveMenuItemImageSrc(current.image)}
                    alt={name}
                    fill
                    width={960}
                    height={1200}
                    className="object-cover object-center"
                    disableLazy
                  />
                ) : null}
              </div>
            </div>

            <div
              className={`flex min-w-0 flex-col ${isAr ? "text-end lg:order-1" : "lg:order-2"}`}
            >
              <p
                className="text-xs font-black uppercase tracking-[0.2em] sm:text-sm sm:tracking-[0.25em]"
                style={{ color: ARCANE_RED }}
              >
                {categoryLabel}
              </p>
              <h3 className="mt-2 font-body text-xl font-black leading-tight text-[#111111] sm:mt-3 sm:text-2xl md:text-3xl lg:text-4xl">
                {name}
              </h3>
              {description ? (
                <p
                  className={`mt-3 text-pretty text-sm leading-relaxed text-[#666666] sm:mt-4 sm:text-base md:text-lg ${isAr ? "ms-0 sm:ms-auto" : ""} max-w-lg`}
                >
                  {description}
                </p>
              ) : null}
              <div className={`mt-4 sm:mt-6 ${isAr ? "flex flex-col items-end" : ""}`}>
                {hasDiscount && discountPercent ? (
                  <span
                    className="mb-2 inline-flex w-fit rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white sm:px-3.5 sm:py-1.5 sm:text-xs"
                    style={{ backgroundColor: ARCANE_RED }}
                  >
                    {isAr ? `${discountPercent}% خصم` : `${discountPercent}% off`}
                  </span>
                ) : null}
                <div
                  className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 ${isAr ? "justify-end" : ""}`}
                >
                  {hasDiscount && current?.originalPrice ? (
                    <span className="text-lg font-semibold tabular-nums text-[#999999] line-through sm:text-xl md:text-2xl">
                      {currencyLabel} {current.originalPrice}
                    </span>
                  ) : null}
                  <p
                    className="font-body text-2xl font-black tabular-nums sm:text-3xl md:text-4xl"
                    style={{ color: ARCANE_RED }}
                  >
                    {currencyLabel} {current?.price}
                  </p>
                </div>
              </div>

              <div
                className={`mt-6 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-3 ${isAr ? "sm:justify-end" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => current && setSelectedDish(current)}
                  className="w-full rounded-full px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white sm:w-auto sm:px-8 sm:py-4 sm:text-sm"
                  style={{ backgroundColor: ARCANE_RED }}
                >
                  {isAr ? "عرض التفاصيل" : "View Details"}
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="w-full rounded-full border-2 px-6 py-3.5 text-xs font-black uppercase tracking-wider sm:w-auto sm:px-8 sm:py-4 sm:text-sm"
                  style={{ borderColor: ARCANE_RED, color: ARCANE_RED }}
                >
                  {isAr ? "التالي ←" : "Next →"}
                </button>
              </div>

              <div
                className={`mt-6 flex items-center justify-between gap-4 ${isAr ? "flex-row-reverse" : ""}`}
              >
                <NavArrow
                  direction="prev"
                  onClick={goPrev}
                  label={isAr ? "السابق" : "Previous"}
                />
                <NavArrow
                  direction="next"
                  onClick={goNext}
                  label={isAr ? "التالي" : "Next"}
                />
              </div>

              <SlideProgress slideIndex={slideIndex} total={total} isAr={isAr} />
            </div>
          </div>
        </div>

        <ProductMenuGrid
          items={filteredItems}
          activeIndex={slideIndex}
          isAr={isAr}
          currencyLabel={currencyLabel}
          onSelect={selectProduct}
        />
      </div>

      <DishModal
        dish={selectedDish}
        onClose={() => setSelectedDish(null)}
        currencyLabel={currencyLabel}
      />
    </section>
  );
}
