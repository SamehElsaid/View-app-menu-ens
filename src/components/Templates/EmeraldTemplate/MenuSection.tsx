"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import type { Category, MenuItem } from "@/types/menu";
import { resolveMenuItemImageSrc } from "@/lib/menuItemImage";
import { useCurrencyLabel } from "@/lib/useCurrencyLabel";
import { useEmeraldTheme, hexToRgba } from "./EmeraldThemeContext";

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
            rounded-full text-sm font-semibold font-sans tracking-wide
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
              {locale === "ar" ? cat.nameAr ?? cat.name : cat.nameEn ?? cat.name}
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
}: {
  dish: MenuItem;
  index: number;
  onClick: (dish: MenuItem) => void;
  currencyLabel: string;
}) {
  const locale = useLocale();
  const { primary, secondary } = useEmeraldTheme();
  const badgeText = dish.discountPercent
    ? `${dish.discountPercent}% off`
    : null;
  const cardShadow = `0 2px 20px ${hexToRgba(primary, 0.06)}, 0 1px 4px rgba(0,0,0,0.04)`;
  const cardHoverShadow = `0 16px 48px ${hexToRgba(primary, 0.14)}, 0 4px 12px rgba(0,0,0,0.06)`;
  const iconShadow = `0 4px 20px ${hexToRgba(primary, 0.4)}`;
  const imageBg = hexToRgba(primary, 0.06);
  const imageSrc = resolveMenuItemImageSrc(dish.image);

  return (
    <article
      className="bg-white rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 ease-out hover:-translate-y-1.5 active:scale-[0.985] animate-slide-up motion-reduce:animate-none"
      style={{
        boxShadow: cardShadow,
        "--em-p": primary,
        animationDelay: `${index * 45}ms`,
      } as React.CSSProperties}
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
        <Image
          src={imageSrc}
          alt={locale === "ar" ? dish.nameAr : dish.nameEn}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.06]"
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAYAAAC09K7GAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMklEQVR4nGNgYGD4z8BQ/5+Bof4/A0P9fwaG+v8MDPX/GRjq/zMw1P9nYKj/z8BQ/x8AUEsHCEAAAAAAAAAAAAAAAAA="
        />
        {badgeText && (
          <span
            className={`absolute top-3 start-3 text-[11px] font-sans font-700 px-2.5 py-1 rounded-full tracking-wider uppercase bg-white/90 text-stone-700`}
          >
            {badgeText}
          </span>
        )}
        <div className="absolute bottom-3 end-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
          <span
            className="font-sans font-700 text-sm"
            style={{ color: primary }}
          >
            {currencyLabel} {dish.price}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-serif font-700 text-stone-900 text-lg leading-tight mb-2 transition-colors duration-200 group-hover:text-[var(--em-p)]">
          {locale === "ar" ? dish.nameAr : dish.nameEn}
        </h3>
        <p className="font-sans text-stone-500 text-sm leading-relaxed line-clamp-2">
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

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-50">
          <span
            className="font-sans text-xs font-600 tracking-wide uppercase"
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
  const { primary, secondary } = useEmeraldTheme();

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

  const backdrop = hexToRgba(primary, 0.45);
  const modalShadow = `0 24px 80px ${hexToRgba(primary, 0.2)}, 0 8px 24px rgba(0,0,0,0.12)`;
  const imageBg = hexToRgba(primary, 0.06);
  const divider = hexToRgba(secondary, 0.55);

  if (!dish) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 backdrop-blur-sm animate-fade-in motion-reduce:animate-none"
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
              <Image
                src={resolveMenuItemImageSrc(dish.image)}
                alt={locale === "ar" ? dish.nameAr : dish.nameEn}
                fill
                className="object-cover"
                sizes="560px"
                priority
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
                  {dish.price}
                </span>
                <span
                  className="font-sans font-600 text-sm opacity-70"
                  style={{ color: primary }}
                >
                  {currencyLabel}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto md:overflow-y-visible px-6 py-5 md:px-7 md:py-6">
              <h2 className="font-serif italic text-stone-900 text-xl md:text-2xl font-700 leading-tight mb-3 text-balance">
                {locale === "ar" ? dish.nameAr : dish.nameEn}
              </h2>

              <p className="font-sans text-stone-500 text-sm leading-[1.7] mb-5">
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
                        className="font-sans text-sm font-500 text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="px-6 py-4 md:px-7 md:py-5 border-t border-stone-100">
              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl border border-stone-200 font-sans font-600 text-stone-600 hover:bg-stone-50 hover:border-stone-300 transition-all text-sm"
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
  const [activeCategory, setActiveCategory] = useState(0);
  const locale = useLocale();
  const { primary, secondary } = useEmeraldTheme();
  const currencyLabel = useCurrencyLabel()(currency);

  const filteredItems =
    activeCategory === 0
      ? items
      : items.filter((dish) => dish.categoryId === activeCategory);

  return (
    <>
      <div className="mb-10">
        <p
          className="font-sans text-xs font-600 tracking-[0.18em] uppercase mb-3"
          style={{ color: secondary }}
        >
          {locale === "ar" ? "القائمة" : "Menu"}
        </p>
        <h2
          id="menu-heading"
          className="font-serif italic text-stone-900 text-[clamp(2rem,4vw,3rem)] leading-tight tracking-tight"
        >
          {locale === "ar" ? "القائمة" : "Menu"}
        </h2>
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
          className="font-sans text-sm text-stone-400 mb-8 font-500 animate-fade-in motion-reduce:animate-none"
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
              onClick={setSelectedDish}
              currencyLabel={currencyLabel}
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
