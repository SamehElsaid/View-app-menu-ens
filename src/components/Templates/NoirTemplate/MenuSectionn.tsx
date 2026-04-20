"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import type { Category, MenuItem } from "@/types/menu";
import { resolveMenuItemImageSrc } from "@/lib/menuItemImage";
import { useCurrencyLabel } from "@/lib/useCurrencyLabel";
import {
  useNoirTheme,
  hexToRgba,
  shadowGlow,
  NOIR_EASE_TW_CLASS,
} from "./NoirThemeContext";
import {
  SKY_CART_UPDATED_EVENT,
  readSkyCartFromCookie,
  upsertSkyCartQuantityFromMenuItem,
  type SkyCartItem,
} from "@/lib/skyTemplateCart";
import { useTableCartAllowed } from "@/hooks/useTableCartAllowed";

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
        className="flex gap-3 md:gap-4 w-max min-w-0 mx-auto px-2 sm:px-4 py-1 snap-x snap-mandatory"
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
              className={`font-body flex min-h-[48px] items-center justify-center gap-2 text-base sm:text-[1.05rem] font-medium tracking-wide sm:tracking-[0.14em] uppercase py-3 px-6 sm:px-8 rounded-full cursor-pointer whitespace-nowrap transition-all duration-300 hover:scale-[1.04] hover:-translate-y-0.5 active:scale-[0.98] animate-slide-up motion-reduce:animate-none motion-reduce:hover:scale-100 motion-reduce:hover:translate-y-0 snap-start shrink-0
                ${
                  isActive
                    ? "bg-linear-to-br from-violet to-cyan text-white border border-white/10 ring-1 ring-white/15 shadow-lg"
                    : "bg-violet/4 text-text-secondary border border-violet/18 hover:border-violet/30 hover:bg-violet/8"
                }`}
            >
              <span className="leading-tight max-w-[14rem] sm:max-w-none truncate">
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

  const defaultShadow = "0 4px 24px rgba(0,0,0,0.25)";
  const hoverShadow = `0 16px 48px rgba(0,0,0,0.5), 0 0 24px ${hexToRgba(primary, 0.2)}`;

  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-sm border border-violet/8 bg-glass backdrop-blur-lg transition-all duration-300 ease-out hover:-translate-y-1 active:scale-[0.995] motion-reduce:hover:translate-y-0 animate-slide-up motion-reduce:animate-none"
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
          <Image
            src={resolveMenuItemImageSrc(item.image)}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover saturate-[0.72] brightness-[0.9]"
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
          <div className="absolute top-3 end-3 z-2 text-white text-xs tracking-[0.15em] uppercase py-0.5 px-2 rounded-xs bg-violet/90">
            {locale === "ar"
              ? `${item.discountPercent}٪ خصم`
              : `${item.discountPercent}% off`}
          </div>
        ) : null}
      </div>

      <div className="p-4">
        <p className="text-xs tracking-[0.3em] uppercase text-cyan mb-1">
          {catLabel}
        </p>
        <h3 className="font-display text-lg font-light leading-tight mb-1">
          {name}
        </h3>
        {desc && (
          <p className="text-xs text-text-secondary leading-relaxed mb-3 line-clamp-2">
            {desc}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="font-display text-lg font-light text-lavender">
            {currencyLabel} {item.price}
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
                  className="flex h-7 w-7 items-center justify-center rounded-md text-text-secondary text-sm"
                  onClick={() => setCardPickQty((q) => Math.max(1, q - 1))}
                  aria-label={locale === "ar" ? "تقليل" : "Decrease"}
                >
                  −
                </button>
                <span className="min-w-6 text-center text-xs text-text-primary">
                  {cardPickQty}
                </span>
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-text-secondary text-sm"
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

function NoirDetailModal({
  item,
  onClose,
  currencyLabel,
}: {
  item: MenuItem;
  onClose: () => void;
  currencyLabel: string;
}) {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const tableCartAllowed = useTableCartAllowed();
  const isTableOrder =
    Boolean(searchParams.get("table")?.trim()) && tableCartAllowed;
  const [selectedQty, setSelectedQty] = useState(1);
  const [inCartQty, setInCartQty] = useState(0);
  const { primary } = useNoirTheme();
  const name = locale === "ar" ? item.nameAr : item.nameEn;
  const desc = locale === "ar" ? item.descriptionAr : item.descriptionEn;
  const catLabel = locale === "ar" ? item.categoryNameAr : item.categoryNameEn;

  const panelShadow = `0 0 60px ${hexToRgba(primary, 0.2)}, 0 40px 80px rgba(0,0,0,0.6)`;
  const closeGlow = shadowGlow(primary, 20, 0.25);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handler);
    };
  }, [onClose]);

  useEffect(() => {
    const sync = () => {
      const c = readSkyCartFromCookie();
      setInCartQty(c[item.id]?.quantity ?? 0);
    };
    sync();
    window.addEventListener(SKY_CART_UPDATED_EVENT, sync);
    return () => window.removeEventListener(SKY_CART_UPDATED_EVENT, sync);
  }, [item.id]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-8 backdrop-blur-[12px] animate-fade-in motion-reduce:animate-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="max-h-[90vh] w-full max-w-[600px] overflow-y-auto rounded-[4px] border border-violet/20 bg-charcoal/95 animate-scale-in motion-reduce:animate-none"
        style={{ boxShadow: panelShadow }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-[280px] overflow-hidden">
          <Image
            src={resolveMenuItemImageSrc(item.image)}
            alt={name}
            fill
            className="object-cover saturate-[0.72]"
            sizes="600px"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(17,17,24,0) 0%, rgba(17,17,24,0.12) 35%, rgba(17,17,24,0.55) 72%, rgba(17,17,24,0.94) 100%), radial-gradient(100% 70% at 50% 0%, rgba(0,0,0,0.18), transparent 60%)",
            }}
          />
          <button
            type="button"
            className="absolute end-4 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-violet/30 bg-black/80 text-base text-text-secondary transition-[transform,background-color,box-shadow] duration-300 ease-out hover:bg-black/70 active:scale-95"
            style={{ boxShadow: "none" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = closeGlow;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none";
            }}
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-8">
          <p className="text-sm tracking-[0.3em] uppercase text-cyan mb-3">
            {catLabel}
          </p>
          <h3
            id="detail-modal-title"
            className="font-display text-4xl font-light leading-tight mb-4"
          >
            {name}
          </h3>
          {desc && (
            <p className="text-sm text-text-secondary leading-relaxed mb-6">
              {desc}
            </p>
          )}

          <div className="flex items-center justify-between gap-4">
            <span className="font-display text-3xl font-light text-lavender">
              {currencyLabel} {item.price}
            </span>
            {item.originalPrice && item.originalPrice > item.price && (
              <span className="text-sm text-text-secondary line-through">
                {currencyLabel} {item.originalPrice}
              </span>
            )}
          </div>

          {isTableOrder ? (
            <div className="mt-8 space-y-3 border-t border-violet/15 pt-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => {
                    upsertSkyCartQuantityFromMenuItem(item, selectedQty);
                    setSelectedQty(1);
                  }}
                  className="rounded-full border border-violet/40 bg-linear-to-br from-violet to-cyan px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                >
                  {locale === "ar" ? "أضف إلى السلة" : "Add to cart"}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-violet/30 text-text-secondary"
                    onClick={() => setSelectedQty((q) => Math.max(1, q - 1))}
                    aria-label={locale === "ar" ? "تقليل" : "Decrease"}
                  >
                    −
                  </button>
                  <span className="min-w-8 text-center text-sm text-text-primary">
                    {selectedQty}
                  </span>
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-violet/30 text-text-secondary"
                    onClick={() => setSelectedQty((q) => q + 1)}
                    aria-label={locale === "ar" ? "زيادة" : "Increase"}
                  >
                    +
                  </button>
                </div>
              </div>
              {inCartQty > 0 ? (
                <p className="text-sm text-text-secondary">
                  {locale === "ar"
                    ? `في السلة: ${inCartQty}`
                    : `In cart: ${inCartQty}`}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
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
  const [activeCategory, setActiveCategory] = useState(0);
  const [cartById, setCartById] = useState<Record<number, SkyCartItem>>({});
  const locale = useLocale();
  const searchParams = useSearchParams();
  const tableCartAllowed = useTableCartAllowed();
  const isTableOrder =
    Boolean(searchParams.get("table")?.trim()) && tableCartAllowed;
  const currencyLabel = useCurrencyLabel()(currency);

  useEffect(() => {
    const sync = () => setCartById(readSkyCartFromCookie());
    sync();
    window.addEventListener(SKY_CART_UPDATED_EVENT, sync);
    return () => window.removeEventListener(SKY_CART_UPDATED_EVENT, sync);
  }, []);

  const handleAddToCartCard = (item: MenuItem, quantity: number) => {
    upsertSkyCartQuantityFromMenuItem(item, quantity);
    setCartById(readSkyCartFromCookie());
  };

  const filteredItems =
    activeCategory === 0
      ? items
      : items.filter((dish) => dish.categoryId === activeCategory);

  return (
    <>
      <p className="text-sm tracking-[0.5em] uppercase text-violet mb-4">
        {locale === "ar" ? "— القائمة الكاملة —" : "— Full Menu —"}
      </p>
      <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-light leading-tight mb-12">
        <em className="italic text-lavender">
          {locale === "ar" ? "إبداعات" : "Chef's"}
        </em>{" "}
        <span>{locale === "ar" ? "الشيف" : "Creations"}</span>
      </h2>

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
            onOpen={setSelectedDish}
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
