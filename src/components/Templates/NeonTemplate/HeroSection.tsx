"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  useTransition,
} from "react";
import { useIsOrderingEnabled } from "@/hooks/useIsOrderingEnabled";
import { useLocale } from "next-intl";
import type {
  Category,
  MenuCustomizations,
  MenuInfo,
  MenuItem,
} from "@/types/menu";

import { FaStar } from "react-icons/fa";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import LoadImage from "@/components/ImageLoad";
import PromoBanner from "../CoffeeTemplate/PromoBanner";
import {
  subscribeSkyCartUpdated,
  readSkyCartFromCookie,
  upsertSkyCartFromMenuItemWithOptions,
  getCartQuantityForMenuItem,
  type SkyCart,
} from "@/lib/skyTemplateCart";
import {
  getMenuItemMinPrice,
  hasMenuItemOptions,
} from "@/lib/menuItemOptions";
import { toast } from "react-toastify";
import { useTrackMenuItemClick } from "@/hooks/useTrackMenuItemClick";
import {
  sortCategories,
  buildCategorySections,
} from "@/lib/menuCategoryOrder";
import { useMenuCatalogPagination } from "@/hooks/useMenuCatalogPagination";
import MenuCatalogSentinel from "@/components/Global/MenuCatalogSentinel";
import MenuCatalogSkeleton from "@/components/Global/MenuCatalogSkeleton";
import MenuItemDetailModal, {
  type MenuItemCartOptions,
} from "@/components/Global/MenuItemDetailModal";
import { useCurrencyLabel } from "@/lib/useCurrencyLabel";

function NeonMenuItemCard({
  item,
  currencyLabel,
  primaryColor,
  locale,
  isProPlan,
  itemName,
  itemDescription,
  categoryName,
  onOpen,
}: {
  item: MenuItem;
  currencyLabel: string;
  primaryColor: string;
  locale: string;
  isProPlan: boolean;
  itemName: string;
  itemDescription: string;
  categoryName: string;
  onOpen: (item: MenuItem) => void;
}) {
  const itemHasOptions = hasMenuItemOptions(item);
  const displayMinPrice = getMenuItemMinPrice(item);
  const priceLabel = itemHasOptions
    ? locale === "ar"
      ? `يبدأ من ${displayMinPrice}`
      : `Start from ${displayMinPrice}`
    : String(item.price);

  return (
    <div
      onClick={() => onOpen(item)}
      className="flex flex-col bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 transition-all cursor-pointer group hover:shadow-xl hover:-translate-y-2"
      style={{
        borderColor: undefined,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${primaryColor}60`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "";
      }}
    >
      <div className="relative h-48 shrink-0 overflow-hidden leading-none">
        <LoadImage
          src={item.image ?? ""}
          alt={itemName}
          fill
          width={400}
          height={400}
          disableLazy={true}
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
        {item.discountPercent && item.discountPercent > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-base font-bold">
            -{item.discountPercent}%
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg! font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">
          {itemName}
        </h3>
        {/* flex-1 spacer: description fills available space so bottom row always aligns */}
        <div className="flex-1">
          {isProPlan && itemDescription && (
            <p className="text-base text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {itemDescription}
            </p>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span
            className="text-sm px-3 py-1 rounded-full font-semibold shrink-0"
            style={{
              backgroundColor: `${primaryColor}15`,
              color: primaryColor,
            }}
          >
            {categoryName}
          </span>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {!itemHasOptions && item.originalPrice && item.originalPrice > item.price && (
              <span className="text-slate-400 line-through text-sm">
                {item.originalPrice} {currencyLabel}
              </span>
            )}
            <span
              className="font-bold text-base"
              style={{ color: primaryColor }}
            >
              {priceLabel} {currencyLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

type HeroSectionMenuData = {
  menuInfo?: MenuInfo | null;
  menu?: MenuItem[] | MenuInfo | null;
  items?: MenuItem[] | null;
  categories?: (Category & { isActive?: boolean })[] | null;
};

type HeroSectionProps = {
  menuData?: HeroSectionMenuData | null;
  customizations?: Partial<MenuCustomizations> | null;
};

export const HeroSection: React.FC<HeroSectionProps> = ({
  menuData,
  customizations = {},
}) => {
  const locale = useLocale();
  const { isOrderingEnabled: isTableOrder } = useIsOrderingEnabled();
  const [selectedFoodItem, setSelectedFoodItem] = useState<MenuItem | null>(null);
  const productsRef = useRef<HTMLDivElement>(null);
  const { openItem } = useTrackMenuItemClick();
  const getCurrencyLabel = useCurrencyLabel();

  // Two-layer deferred selection: selectedCategoryId updates instantly for visual feedback,
  // activeCategoryId updates inside startTransition to defer the expensive product-list re-render.
  const [selectedCategoryId, setSelectedCategoryId] = useState(0);
  const [activeCategoryId, setActiveCategoryId] = useState(0);
  const [isPending, startTransition] = useTransition();

  // Cart state — lifted to section level so all cards share a single subscription
  const [cart, setCart] = useState<SkyCart>(() =>
    typeof document === "undefined" ? {} : readSkyCartFromCookie(),
  );

  useEffect(() => {
    return subscribeSkyCartUpdated(() => setCart(readSkyCartFromCookie()));
  }, []);

  // Category carousel scroll state
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const isRtl = locale === "ar";

  const menuInfo =
    menuData?.menuInfo ??
    (Array.isArray(menuData?.menu) ? null : menuData?.menu);
  const customizationsData = customizations ?? {};
  const menuCategories = useMemo(
    () => (Array.isArray(menuData?.categories) ? menuData.categories : []),
    [menuData],
  );

  const currency = menuInfo?.currency || "AED";
  const currencyLabel = getCurrencyLabel(currency);
  const isProPlan =
    menuInfo?.ownerPlanType !== "free" && !!menuInfo?.ownerPlanType;

  const primaryColor = customizationsData.primaryColor || "#14b8a6";
  const secondaryColor = customizationsData.secondaryColor || "#06b6d4";

  const handleAddToCart = useCallback(
    (item: MenuItem, quantity: number, options?: MenuItemCartOptions) => {
      if (quantity <= 0) return;
      upsertSkyCartFromMenuItemWithOptions(item, quantity, {
        locale,
        size: options?.size ?? null,
        variant: options?.variant ?? null,
      });
      toast.success(locale === "ar" ? "تمت الإضافة إلى السلة" : "Added to cart");
    },
    [locale],
  );
  const heroTitle =
    locale === "ar"
      ? customizationsData.heroTitleAr?.trim() || menuInfo?.name || ""
      : customizationsData.heroTitleEn?.trim() || menuInfo?.name || "";
  const heroSubtitle =
    locale === "ar"
      ? customizationsData.heroSubtitleAr?.trim() || menuInfo?.description || ""
      : customizationsData.heroSubtitleEn?.trim() ||
        menuInfo?.description ||
        "";

  const { items, initialLoading, loadingMore, hasMore, sentinelRef } =
    useMenuCatalogPagination(activeCategoryId);

  // Build categories display array with numeric IDs (0 = All)
  const categories = useMemo(() => {
    const allCategory = {
      id: 0,
      name: locale === "ar" ? "الكل" : "All",
      icon: "🍽️",
      image: null as string | null,
    };

    const dbCategories = sortCategories(
      menuCategories.filter((cat) => cat.isActive !== false),
    ).map((cat) => ({
      id: cat.id,
      name: locale === "ar" ? cat.nameAr || cat.name : cat.nameEn || cat.name,
      icon: "🍽️",
      image: cat.image ?? null,
    }));

    return [allCategory, ...dbCategories];
  }, [menuCategories, locale]);

  // Group items by category for the "All" view (replaces manual groupedItems)
  const categorySections = useMemo(
    () => buildCategorySections(menuCategories, items),
    [menuCategories, items],
  );

  // Lookup helper for category name and image used in section headers
  const getCategoryDisplay = useCallback(
    (categoryId: number) => {
      const cat = menuCategories.find((c) => c.id === categoryId);
      return {
        name: cat
          ? locale === "ar"
            ? cat.nameAr || cat.name
            : cat.nameEn || cat.name
          : "",
        image: cat?.image ?? null,
      };
    },
    [menuCategories, locale],
  );

  const updateScrollState = useCallback(() => {
    const el = categoryScrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) {
      setCanScrollPrev(false);
      setCanScrollNext(false);
      return;
    }
    const absScroll = Math.abs(el.scrollLeft);
    setCanScrollPrev(absScroll > 2);
    setCanScrollNext(absScroll < maxScroll - 2);
  }, []);

  // Track scroll position and container resize
  useEffect(() => {
    const el = categoryScrollRef.current;
    if (!el) return;
    const frame = requestAnimationFrame(updateScrollState);
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState]);

  // Auto-scroll the active category button into view (same logic as CategoryCircles)
  useEffect(() => {
    const el = categoryScrollRef.current;
    if (!el) return;
    const inner = el.firstElementChild as HTMLElement | null;
    if (!inner) return;
    const children = Array.from(inner.children) as HTMLElement[];
    const idx = categories.findIndex((c) => c.id === selectedCategoryId);
    const child = children[idx < 0 ? 0 : idx];
    if (!child) return;
    const containerRect = el.getBoundingClientRect();
    const childRect = child.getBoundingClientRect();
    const delta =
      childRect.left + childRect.width / 2 -
      (containerRect.left + containerRect.width / 2);
    el.scrollBy({ left: delta, behavior: "smooth" });
  }, [selectedCategoryId, categories]);

  const handleCategoryNav = useCallback(
    (nav: "prev" | "next") => {
      const el = categoryScrollRef.current;
      if (!el) return;
      const sign = isRtl ? -1 : 1;
      el.scrollBy({ left: (nav === "next" ? 200 : -200) * sign, behavior: "smooth" });
    },
    [isRtl],
  );

  const scrollToProducts = useCallback(() => {
    const el = productsRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, []);

  const handleCategorySelect = useCallback(
    (id: number) => {
      setSelectedCategoryId(id);
      startTransition(() => {
        setActiveCategoryId(id);
      });
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(scrollToProducts);
      });
    },
    [scrollToProducts],
  );


  return (
    <section
      id="templates"
      className="py-10 bg-linear-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12 w-full min-w-0">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{
              backgroundColor: `${primaryColor}15`,
              border: `1px solid ${primaryColor}40`,
            }}
          >
            <FaStar className="w-4 h-4" style={{ color: primaryColor }} />
            <span
              className="text-base font-semibold"
              style={{ color: primaryColor }}
            >
              {heroTitle}
            </span>
          </div>

          {heroSubtitle ? (
            <p className="w-full max-w-2xl mx-auto text-lg md:text-lg text-slate-600 dark:text-slate-400 mb-12 text-balance wrap-break-word">
              {heroSubtitle}
            </p>
          ) : null}
        </div>

        {/* Categories Filter — circle style matching OneCard */}
        <div className="relative mb-16">
          <div className="px-6 py-4 rounded-2xl bg-white dark:bg-slate-800/90 shadow-[0_0_24px_8px_rgba(0,0,0,0.07)]">
            <div
              ref={categoryScrollRef}
              className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              dir={isRtl ? "rtl" : "ltr"}
            >
              <div
                className="flex gap-1"
                role="tablist"
                style={{ direction: isRtl ? "rtl" : "ltr" }}
                aria-label={locale === "ar" ? "فئات القائمة" : "Menu categories"}
              >
                {categories.map((category) => {
                  const isActive = selectedCategoryId === category.id;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      role="tab"
                      aria-pressed={isActive}
                      onClick={() => handleCategorySelect(category.id)}
                      className="flex min-w-[80px] max-w-[100px] shrink-0 flex-col items-center gap-1.5 transition-transform duration-200 ease-in hover:scale-[0.95]"
                    >
                      <span
                        className={`relative flex h-[60px] w-[60px] shrink-0 overflow-hidden rounded-full ${
                          isActive ? "border-4" : "border-[3px]"
                        }`}
                        style={{ borderColor: primaryColor }}
                      >
                        {category.image ? (
                          <LoadImage
                            src={category.image}
                            alt={category.name}
                            fill
                            width={200}
                            height={200}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span
                            className="flex h-full w-full items-center justify-center text-2xl"
                            style={{
                              backgroundColor: `${primaryColor}15`,
                              color: primaryColor,
                            }}
                          >
                            {category.icon}
                          </span>
                        )}
                      </span>
                      <span
                        className="w-full text-center text-xs font-semibold leading-tight"
                        style={{ color: primaryColor }}
                      >
                        {category.name}
                      </span>
                      <span
                        className="h-[3px] w-7 rounded-sm transition-[background] duration-200 ease-in"
                        style={{
                          backgroundColor: isActive ? primaryColor : "transparent",
                        }}
                        aria-hidden
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Prev scroll button */}
          <button
            type="button"
            aria-label={locale === "ar" ? "السابق" : "Scroll previous"}
            disabled={!canScrollPrev}
            onClick={() => handleCategoryNav("prev")}
            className="absolute top-1/2 -start-3 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full text-white transition-[transform,opacity] duration-200 ease-in enabled:hover:scale-[1.08] disabled:pointer-events-none disabled:cursor-default disabled:opacity-0"
            style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
          >
            <FiChevronLeft className="text-lg rtl:rotate-180" aria-hidden />
          </button>

          {/* Next scroll button */}
          <button
            type="button"
            aria-label={locale === "ar" ? "التالي" : "Scroll next"}
            disabled={!canScrollNext}
            onClick={() => handleCategoryNav("next")}
            className="absolute top-1/2 -end-3 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full text-white transition-[transform,opacity] duration-200 ease-in enabled:hover:scale-[1.08] disabled:pointer-events-none disabled:cursor-default disabled:opacity-0"
            style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
          >
            <FiChevronRight className="text-lg rtl:rotate-180" aria-hidden />
          </button>
        </div>

        <div className="container mx-auto px-4">
          <PromoBanner />
        </div>
        {/* Menu Items Grid */}
        <div id="neon-menu-products" ref={productsRef} className="scroll-mt-28 space-y-10">
          <div
            className={`transition-opacity duration-150 ${isPending ? "opacity-50 pointer-events-none" : "opacity-100"}`}
          >
            {activeCategoryId === 0 ? (
              /* ── All categories view: grouped with section headers ── */
              categorySections.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-600 dark:text-slate-400 text-base">
                    {locale === "ar" ? "لا توجد عناصر" : "No items available"}
                  </p>
                </div>
              ) : (
                categorySections.map((section) => {
                  const { name: catName, image: catImage } = getCategoryDisplay(section.categoryId);
                  return (
                    <div key={section.categoryId}>
                      {/* Category section header */}
                      <div className="mb-6 flex items-center gap-3">
                        {catImage ? (
                          <span
                            className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 shadow-sm"
                            style={{ borderColor: `${primaryColor}50` }}
                          >
                            <LoadImage
                              src={catImage}
                              alt={catName}
                              fill
                              width={200}
                              height={200}
                              className="object-cover"
                            />
                          </span>
                        ) : (
                          <span
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
                            style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                          >
                            🍽️
                          </span>
                        )}
                        <div className="flex flex-1 items-center gap-3">
                          <h3
                            className="text-xl font-black tracking-tight md:text-2xl"
                            style={{ color: primaryColor }}
                          >
                            {catName}
                          </h3>
                          <div
                            className="h-px flex-1 rounded-full opacity-30"
                            style={{ backgroundColor: primaryColor }}
                          />
                        </div>
                      </div>

                      {/* Items grid for this category */}
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {section.items.map((item) => {
                          const itemName =
                            locale === "ar" ? item.nameAr || item.name : item.nameEn || item.name;
                          const itemDescription =
                            locale === "ar"
                              ? item.descriptionAr || item.description
                              : item.descriptionEn || item.description;
                          return (
                            <NeonMenuItemCard
                              key={item.id}
                              item={item}
                              currencyLabel={currencyLabel}
                              primaryColor={primaryColor}
                              locale={locale}
                              isProPlan={isProPlan}
                              itemName={itemName}
                              itemDescription={itemDescription ?? ""}
                              categoryName={catName}
                              onOpen={(it) => openItem(it, setSelectedFoodItem)}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              /* ── Single category view ── */
              initialLoading ? (
                <MenuCatalogSkeleton count={6} />
              ) : items.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-600 dark:text-slate-400 text-base">
                    {locale === "ar"
                      ? "لا توجد عناصر في هذه الفئة"
                      : "No items in this category"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {items.map((item) => {
                    const itemName =
                      locale === "ar" ? item.nameAr || item.name : item.nameEn || item.name;
                    const itemDescription =
                      locale === "ar"
                        ? item.descriptionAr || item.description
                        : item.descriptionEn || item.description;
                    const categoryName =
                      categories.find((cat) => cat.id === item.categoryId)?.name ||
                      (locale === "ar"
                        ? item.categoryNameAr || item.categoryName
                        : item.categoryNameEn || item.categoryName) ||
                      "";
                    return (
                      <NeonMenuItemCard
                        key={item.id}
                        item={item}
                        currencyLabel={currencyLabel}
                        primaryColor={primaryColor}
                        locale={locale}
                        isProPlan={isProPlan}
                        itemName={itemName}
                        itemDescription={itemDescription ?? ""}
                        categoryName={categoryName}
                        onOpen={(it) => openItem(it, setSelectedFoodItem)}
                      />
                    );
                  })}
                </div>
              )
            )}
          </div>

          <MenuCatalogSentinel
            sentinelRef={sentinelRef}
            loadingMore={loadingMore}
            hasMore={hasMore}
          />
        </div>
      </div>

      {selectedFoodItem ? (
        <MenuItemDetailModal
          item={selectedFoodItem}
          currencyLabel={currencyLabel}
          isTableOrder={isTableOrder}
          cartQuantity={getCartQuantityForMenuItem(cart, selectedFoodItem.id)}
          primary={primaryColor}
          secondary={secondaryColor}
          onClose={() => setSelectedFoodItem(null)}
          onAddToCart={handleAddToCart}
        />
      ) : null}
    </section>
  );
};
