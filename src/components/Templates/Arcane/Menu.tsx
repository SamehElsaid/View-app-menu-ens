"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useIsOrderingEnabled } from "@/hooks/useIsOrderingEnabled";
import { useLocale } from "next-intl";
import type { Category, MenuItem } from "@/types/menu";
import { useCurrencyLabel } from "@/lib/useCurrencyLabel";
import { useArcaneTheme } from "./ArcaneThemeContext";
import {
  readSkyCartFromCookie,
  subscribeSkyCartUpdated,
  upsertSkyCartFromMenuItemWithOptions,
  type SkyCartItem,
} from "@/lib/skyTemplateCart";
import { hasMenuItemOptions } from "@/lib/menuItemOptions";
import { useTrackMenuItemClick } from "@/hooks/useTrackMenuItemClick";
import { useAppSelector } from "@/store/hooks";
import CategoryPills from "./CategoryPills";
import FeaturedProduct from "./FeaturedProduct";
import ProductMenuGrid from "./ProductMenuGrid";
import DishModal from "./DishModal";

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

  const { primary } = useArcaneTheme();
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);
  const displayName = menuInfo?.name?.trim() || "Arcane";
  const currencyLabel = useCurrencyLabel()(currency);
  const { trackItem } = useTrackMenuItemClick();
  const { isOrderingEnabled: isTableOrder } = useIsOrderingEnabled();

  const [activeCategory, setActiveCategory] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [featuredQty, setFeaturedQty] = useState(1);
  const [cartById, setCartById] = useState<Record<number, SkyCartItem>>({});
  const featuredRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => setCartById(readSkyCartFromCookie());
    sync();
    return subscribeSkyCartUpdated(sync);
  }, []);

  const addToCart = (item: MenuItem, quantity: number) => {
    if (hasMenuItemOptions(item)) {
      setSelectedDish(item);
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

  const trackProductAt = (index: number) => {
    const item = filteredItems[index];
    if (item?.id) trackItem(item.id);
  };

  const goPrev = () => {
    const next = slideIndex <= 0 ? Math.max(0, total - 1) : slideIndex - 1;
    setSlideIndex(next);
    trackProductAt(next);
  };

  const goNext = () => {
    const next = slideIndex >= total - 1 ? 0 : slideIndex + 1;
    setSlideIndex(next);
    trackProductAt(next);
  };

  const selectProduct = (index: number) => {
    setSlideIndex(index);
    trackProductAt(index);
    featuredRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (total === 0) {
    return (
      <section
        id="menu"
        className="overflow-x-clip bg-white px-4 py-16 text-center sm:px-6 sm:py-24"
      >
        <p className="text-base text-arcane-muted sm:text-lg">
          {locale === "ar" ? "لا توجد عناصر في القائمة." : "No menu items yet."}
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
    ? locale === "ar"
      ? (activeCat.nameAr ?? activeCat.name)
      : (activeCat.nameEn ?? activeCat.name)
    : locale === "ar"
      ? "الكل"
      : "All";

  return (
    <section
      id="menu"
      className={`overflow-x-clip bg-white px-4 py-6 sm:px-6 sm:py-6 md:py-6 lg:py-6 ${
        isTableOrder ? "pb-28 sm:pb-32" : ""
      }`}
      aria-labelledby="menu-heading"
    >
      <div className="mx-auto max-w-7xl">
        <p
          className="mb-3 text-center text-[10px] font-black uppercase tracking-[0.28em] sm:mb-4 sm:text-xs sm:tracking-[0.35em]"
          style={{ color: primary }}
        >
          {displayName}
        </p>
        <h2
          id="menu-heading"
          className="mb-4 text-center font-body text-2xl font-black uppercase tracking-tight text-arcane-ink sm:mb-6 sm:text-3xl md:text-4xl lg:text-5xl"
        >
          {locale === "ar" ? (
            <>
              استكشف <span style={{ color: primary }}>القائمة</span>
            </>
          ) : (
            <>
              Explore <span style={{ color: primary }}>Menu</span>
            </>
          )}
        </h2>

        <CategoryPills
          categories={categories}
          active={activeCategory}
          onChange={setActiveCategory}
          locale={locale}
        />

        <FeaturedProduct
          featuredRef={featuredRef}
          activeCategory={activeCategory}
          current={current}
          locale={locale}
          categoryLabel={categoryLabel}
          currencyLabel={currencyLabel}
          isTableOrder={isTableOrder}
          featuredQty={featuredQty}
          setFeaturedQty={setFeaturedQty}
          cartById={cartById}
          slideIndex={slideIndex}
          total={total}
          onViewDetails={() => {
            if (current?.id) trackItem(current.id);
            if (current) setSelectedDish(current);
          }}
          onAddToCart={addToCart}
          onGoPrev={goPrev}
          onGoNext={goNext}
        />

        <ProductMenuGrid
          items={filteredItems}
          activeIndex={slideIndex}
          isAr={locale === "ar"}
          currencyLabel={currencyLabel}
          isTableOrder={isTableOrder}
          cartById={cartById}
          onSelect={selectProduct}
          onAddToCart={addToCart}
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
