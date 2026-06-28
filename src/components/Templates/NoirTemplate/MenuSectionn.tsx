"use client";

import { useEffect, useState } from "react";
import { useIsOrderingEnabled } from "@/hooks/useIsOrderingEnabled";
import { useLocale } from "next-intl";
import type { Category, MenuItem } from "@/types/menu";
import { useCurrencyLabel } from "@/lib/useCurrencyLabel";
import LoadImage from "@/components/ImageLoad";
import {
  useNoirTheme,
  hexToRgba,
  shadowGlow,
  NOIR_EASE_TW_CLASS,
} from "./NoirThemeContext";
import {
  subscribeSkyCartUpdated,
  readSkyCartFromCookie,
  upsertSkyCartFromMenuItemWithOptions,
  getCartQuantityForMenuItem,
  type SkyCartItem,
} from "@/lib/skyTemplateCart";
import { getMenuItemMinPrice, hasMenuItemOptions } from "@/lib/menuItemOptions";
import { getItemDiscount } from "@/lib/menuItemDiscount";
import { toast } from "react-toastify";
import { useTrackMenuItemClick } from "@/hooks/useTrackMenuItemClick";
import NoirDetailModal from "./NoirDetailModal";

function categoryTabLabel(cat: Category, locale: "ar" | "en"): string {
  const ar = cat.nameAr?.trim();
  const en = cat.nameEn?.trim();
  const fallback = cat.name?.trim();
  if (locale === "ar") {
    return ar || en || fallback || "";
  }
  return en || ar || fallback || "";
}

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
  const { primary } = useNoirTheme();

  const tabs: Category[] = [
    { id: 0, name: "All", nameAr: "الكل", nameEn: "All", menuItems: [] },
    ...categories,
  ];

  return (
    <div
      className="overflow-x-auto mb-12 md:mb-14 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <div
        className="flex gap-2 sm:gap-2.5 md:gap-3 w-max min-w-0 mx-auto px-2 sm:px-4 py-1 snap-x snap-mandatory"
        role="tablist"
        aria-label={locale === "ar" ? "تصنيفات القائمة" : "Menu categories"}
      >
        {tabs.map((cat, i) => {
          const isActive = cat.id === Number(active);
          const label = categoryTabLabel(cat, locale);
          return (
            <button
              key={i === 0 && cat.id === 0 ? "all" : `cat-${cat.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(cat.id.toString())}
              style={
                isActive
                  ? {
                      boxShadow: `0 0 22px ${hexToRgba(primary, 0.5)}, 0 4px 14px rgba(0,0,0,0.35)`,
                      animationDelay: `${i * 45}ms`,
                    }
                  : { animationDelay: `${i * 45}ms` }
              }
              className={`font-body flex min-h-[40px] items-center justify-center gap-1.5 text-base sm:text-base font-medium tracking-wide sm:tracking-[0.12em] uppercase py-2 px-4 sm:px-5 rounded-full cursor-pointer whitespace-nowrap transition-all duration-300 hover:scale-[1.04] hover:-translate-y-0.5 active:scale-[0.98] animate-slide-up motion-reduce:animate-none motion-reduce:hover:scale-100 motion-reduce:hover:translate-y-0 snap-start shrink-0
                ${
                  isActive
                    ? "bg-linear-to-br from-violet to-cyan text-white border border-white/10 ring-1 ring-white/15 shadow-lg"
                    : "bg-violet/4 text-text-secondary border border-violet/18 hover:border-violet/30 hover:bg-violet/8"
                }`}
            >
              <span className="max-w-[12rem] sm:max-w-none truncate">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NoirMenuCard({
  item,
  idx,
  onOpen,
  currencyLabel,
  isTableOrder,
  cartQuantity,
  onAddToCart,
}: {
  item: MenuItem;
  idx: number;
  onOpen: (item: MenuItem) => void;
  currencyLabel: string;
  isTableOrder: boolean;
  cartQuantity: number;
  onAddToCart: (item: MenuItem, quantity: number) => void;
}) {
  const locale = useLocale();
  const { primary } = useNoirTheme();
  const [cardPickQty, setCardPickQty] = useState(1);
  const name = locale === "ar" ? item.nameAr : item.nameEn;
  const desc = locale === "ar" ? item.descriptionAr : item.descriptionEn;
  const catLabel = locale === "ar" ? item.categoryNameAr : item.categoryNameEn;

  const { discountedPrice, strikethroughPrice } = getItemDiscount(item);
  const itemHasOptions = hasMenuItemOptions(item);
  const displayMinPrice = getMenuItemMinPrice(item);
  const cardPriceDisplay = itemHasOptions
    ? locale === "ar"
      ? `من ${displayMinPrice}`
      : `From ${displayMinPrice}`
    : String(discountedPrice);

  const defaultShadow = "0 4px 24px rgba(0,0,0,0.25)";
  const hoverShadow = `0 16px 48px rgba(0,0,0,0.5), 0 0 24px ${hexToRgba(primary, 0.2)}`;

  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-base border border-violet/8 bg-glass backdrop-blur-lg transition-all duration-300 ease-out hover:-translate-y-1 active:scale-[0.995] motion-reduce:hover:translate-y-0 animate-slide-up motion-reduce:animate-none"
      style={{
        boxShadow: defaultShadow,
        animationDelay: `${idx * 45}ms`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = hoverShadow;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = defaultShadow;
      }}
      onClick={() => onOpen(item)}
    >
      <div className="relative h-[150px] overflow-hidden">
        <div
          className={`absolute inset-0 origin-bottom transition-transform duration-450 will-change-transform group-hover:scale-[1.05] ${NOIR_EASE_TW_CLASS}`}
        >
          <LoadImage
            src={item.image ?? ""}
            alt={name}
            fill
            className="object-cover sm:saturate-[0.72] sm:brightness-[0.9]"
          />
          <div
            className="pointer-events-none absolute inset-0 z-1"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.06) 38%, rgba(0,0,0,0.45) 78%, rgba(0,0,0,0.72) 100%), radial-gradient(120% 80% at 50% 0%, rgba(0,0,0,0.12), transparent 55%)",
            }}
          />
        </div>
        {item.discountPercent ? (
          <div className="absolute top-3 end-3 z-2 text-white text-base tracking-[0.15em] uppercase py-0.5 px-2 rounded-base bg-violet/90">
            {locale === "ar"
              ? `${item.discountPercent}٪ خصم`
              : `${item.discountPercent}% off`}
          </div>
        ) : null}
      </div>

      <div className="p-4">
        <p className="font-body text-lg tracking-[0.3em] uppercase text-white/70 mb-1">
          {catLabel}
        </p>
        <h4 className="font-body text-xl font-light mb-1">{name}</h4>
        {desc && (
          <p className="font-body text-base text-text-secondary leading-relaxed mb-3 line-clamp-2">
            {desc}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="font-body text-lg font-light flex items-baseline gap-1.5">
            <span className="text-base font-body tracking-wide text-cyan">
              {currencyLabel}
            </span>
            {strikethroughPrice ? (
              <span className="text-sm text-white/40 line-through tabular-nums">
                {strikethroughPrice}
              </span>
            ) : null}
            <span className="text-lavender">{cardPriceDisplay}</span>
          </span>
        </div>

        {isTableOrder ? (
          <div
            className="mt-3 space-y-2 border-t border-violet/10 pt-3"
            onClick={(e) => e.stopPropagation()}
            role="presentation"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 rounded-lg border border-violet/20 bg-black/20 px-0.5 py-0.5">
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-text-secondary text-base"
                  onClick={() => setCardPickQty((q) => Math.max(1, q - 1))}
                  aria-label={locale === "ar" ? "تقليل" : "Decrease"}
                >
                  −
                </button>
                <span className="min-w-6 text-center text-base text-text-primary">
                  {cardPickQty}
                </span>
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-text-secondary text-base"
                  onClick={() => setCardPickQty((q) => q + 1)}
                  aria-label={locale === "ar" ? "زيادة" : "Increase"}
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  onAddToCart(item, cardPickQty);
                  setCardPickQty(1);
                }}
                className="rounded-full border border-violet/40 bg-violet/30 px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-white hover:bg-violet/45"
              >
                {locale === "ar" ? "أضف للسلة" : "Add to cart"}
              </button>
            </div>
            {cartQuantity > 0 ? (
              <p className="text-[10px] text-text-secondary text-center">
                {locale === "ar"
                  ? `في السلة: ${cartQuantity}`
                  : `In cart: ${cartQuantity}`}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function MenuSectionn({
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
  const { isOrderingEnabled: isTableOrder } = useIsOrderingEnabled();
  const currencyLabel = useCurrencyLabel()(currency);

  useEffect(() => {
    const sync = () => setCartById(readSkyCartFromCookie());
    sync();
    return subscribeSkyCartUpdated(sync);
  }, []);

  const handleAddToCartCard = (item: MenuItem, quantity: number) => {
    if (hasMenuItemOptions(item)) {
      openItem(item, setSelectedDish);
      return;
    }
    upsertSkyCartFromMenuItemWithOptions(item, quantity, { locale });
    setCartById(readSkyCartFromCookie());
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
      <p className="font-body text-lg tracking-[0.5em] uppercase text-violet mb-4">
        {locale === "ar" ? "— القائمة الكاملة —" : "— Full Menu —"}
      </p>
      <h3 className="font-body text-2xl font-light mb-12">
        <span className=" text-lavender">
          {locale === "ar" ? "إبداعات" : "Chef's"}
        </span>{" "}
        <span>{locale === "ar" ? "الشيف" : "Creations"}</span>
      </h3>

      <CategoryTabs
        categories={categories}
        active={activeCategory}
        onChange={(id) => setActiveCategory(Number(id))}
      />

      <div
        key={activeCategory}
        className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5 animate-fade-in motion-reduce:animate-none"
      >
        {filteredItems.map((item, idx) => (
          <NoirMenuCard
            key={item.id}
            item={item}
            idx={idx}
            onOpen={(item) => openItem(item, setSelectedDish)}
            currencyLabel={currencyLabel}
            isTableOrder={isTableOrder}
            cartQuantity={cartById[item.id]?.quantity ?? 0}
            onAddToCart={handleAddToCartCard}
          />
        ))}
      </div>

      {selectedDish ? (
        <NoirDetailModal
          key={selectedDish.id}
          item={selectedDish}
          onClose={() => setSelectedDish(null)}
          currencyLabel={currencyLabel}
        />
      ) : null}
    </>
  );
}
