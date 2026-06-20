"use client";

import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
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
import LoadImage from "@/components/ImageLoad";
import PromoBanner from "../CoffeeTemplate/PromoBanner";
import {
  subscribeSkyCartUpdated,
  readSkyCartFromCookie,
  upsertSkyCartQuantityFromMenuItem,
} from "@/lib/skyTemplateCart";
import { useTrackMenuItemClick } from "@/hooks/useTrackMenuItemClick";
import {
  sortCategories,
  sortMenuItems,
  sortMenuItemsForDisplay,
} from "@/lib/menuCategoryOrder";
import NeonDetailModal from "./NeonDetailModal";

function NeonMenuItemCard({
  item,
  currency,
  primaryColor,
  locale,
  isTableOrder,
  isProPlan,
  itemName,
  itemDescription,
  categoryName,
  onOpen,
}: {
  item: MenuItem;
  currency: string;
  primaryColor: string;
  locale: string;
  isTableOrder: boolean;
  isProPlan: boolean;
  itemName: string;
  itemDescription: string;
  categoryName: string;
  onOpen: (item: MenuItem) => void;
}) {
  const [pickQty, setPickQty] = useState(1);
  const [inCart, setInCart] = useState(0);

  useEffect(() => {
    const sync = () => {
      const c = readSkyCartFromCookie();
      setInCart(c[item.id]?.quantity ?? 0);
    };
    sync();
    return subscribeSkyCartUpdated(sync);
  }, [item.id]);

  return (
    <div
      onClick={() => onOpen(item)}
      className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 transition-all cursor-pointer group hover:shadow-xl hover:-translate-y-2"
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
      <div className="relative h-48 overflow-hidden leading-none">
        <LoadImage
          src={item.image}
          alt={itemName}
          fill
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
      <div className="p-5">
        <h3 className="!text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">
          {itemName}
        </h3>
        {isProPlan && (
          <p className="text-lg text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2">
            {itemDescription}
          </p>
        )}
        <div className={`${isProPlan ? "mt-4" : "mt-2"} flex flex-col gap-3`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span
              className="text-base px-3 py-1 rounded-full font-semibold w-fit"
              style={{
                backgroundColor: `${primaryColor}15`,
                color: primaryColor,
              }}
            >
              {categoryName}
            </span>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {item.originalPrice && item.originalPrice > item.price && (
                <span className="text-slate-400 line-through text-base">
                  {item.originalPrice} {currency}
                </span>
              )}
              <span
                className="font-bold text-base"
                style={{ color: primaryColor }}
              >
                {item.price} {currency}
              </span>
            </div>
          </div>
          {isTableOrder ? (
            <div
              className="flex flex-col gap-2 border-t border-slate-200 pt-3 dark:border-slate-600"
              onClick={(e) => e.stopPropagation()}
              role="presentation"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-1 py-0.5 dark:border-slate-600 dark:bg-slate-900/80">
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-base font-bold"
                    style={{ color: primaryColor }}
                    onClick={() => setPickQty((q) => Math.max(1, q - 1))}
                    aria-label={locale === "ar" ? "تقليل" : "Decrease"}
                  >
                    −
                  </button>
                  <span
                    className="min-w-7 text-center text-base font-bold tabular-nums"
                    style={{ color: primaryColor }}
                  >
                    {pickQty}
                  </span>
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-base font-bold"
                    style={{ color: primaryColor }}
                    onClick={() => setPickQty((q) => q + 1)}
                    aria-label={locale === "ar" ? "زيادة" : "Increase"}
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    upsertSkyCartQuantityFromMenuItem(item, pickQty);
                    setPickQty(1);
                  }}
                  className="shrink-0 rounded-full px-4 py-2 text-base font-bold text-white shadow-md transition hover:opacity-90"
                  style={{ backgroundColor: primaryColor }}
                >
                  {locale === "ar" ? "أضف للسلة" : "Add to cart"}
                </button>
              </div>
              {inCart > 0 ? (
                <p className="text-center text-base text-slate-500 dark:text-slate-400">
                  {locale === "ar"
                    ? `في السلة: ${inCart}`
                    : `In cart: ${inCart}`}
                </p>
              ) : null}
            </div>
          ) : null}
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
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  customizations?: Partial<MenuCustomizations> | null;
};

export const HeroSection: React.FC<HeroSectionProps> = ({
  menuData,
  selectedCategory,
  onCategoryChange,
  customizations = {},
}) => {
  const locale = useLocale();
  const { isOrderingEnabled: isTableOrder } = useIsOrderingEnabled();
  const [selectedFoodItem, setSelectedFoodItem] = useState<MenuItem | null>(
    null,
  );
  const productsRef = useRef<HTMLDivElement>(null);
  const { openItem } = useTrackMenuItemClick();

  const menuInfo =
    menuData?.menuInfo ??
    (Array.isArray(menuData?.menu) ? null : menuData?.menu);
  const customizationsData = customizations ?? {};
  const menuItems = useMemo(
    () =>
      Array.isArray(menuData?.menu)
        ? menuData.menu
        : Array.isArray(menuData?.items)
          ? menuData.items
          : [],
    [menuData],
  );
  const menuCategories = useMemo(
    () => (Array.isArray(menuData?.categories) ? menuData.categories : []),
    [menuData],
  );

  const currency = menuInfo?.currency || "AED";
  const isProPlan =
    menuInfo?.ownerPlanType !== "free" && !!menuInfo?.ownerPlanType;

  // Default customization values
  const primaryColor = customizationsData.primaryColor || "#14b8a6";
  const secondaryColor = customizationsData.secondaryColor || "#06b6d4";
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

  // Build categories from menuData with "all" option
  const categories = useMemo(() => {
    const allCategory = {
      id: "all",
      name: locale === "ar" ? "الكل" : "All",
      icon: "🍽️",
    };

    const dbCategories = sortCategories(
      menuCategories.filter((cat) => cat.isActive !== false),
    ).map((cat) => ({
      id: cat.id.toString(),
      name: locale === "ar" ? cat.nameAr || cat.name : cat.nameEn || cat.name,
      icon: "🍽️",
    }));

    return [allCategory, ...dbCategories];
  }, [menuCategories, locale]);

  // Filter items based on selected category
  const filteredItems = useMemo(() => {
    if (selectedCategory === "all") {
      return sortMenuItemsForDisplay(menuItems, menuCategories);
    }
    return sortMenuItems(
      menuItems.filter(
        (item) => item.categoryId?.toString() === selectedCategory,
      ),
    );
  }, [menuItems, menuCategories, selectedCategory]);

  const scrollToProducts = useCallback(() => {
    const el = productsRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, []);

  const handleCategorySelect = useCallback(
    (categoryId: string) => {
      onCategoryChange(categoryId);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(scrollToProducts);
      });
    },
    [onCategoryChange, scrollToProducts],
  );

  const selectedModalCategoryName = useMemo(() => {
    if (!selectedFoodItem) return "";
    return (
      categories.find(
        (cat) => cat.id === selectedFoodItem.categoryId?.toString(),
      )?.name ||
      (locale === "ar"
        ? selectedFoodItem.categoryNameAr || selectedFoodItem.categoryName
        : selectedFoodItem.categoryNameEn || selectedFoodItem.categoryName) ||
      ""
    );
  }, [selectedFoodItem, categories, locale]);

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

        {/* Categories Filter */}
        <div className="mb-16 -mx-4 px-4 md:mx-0 md:px-0">
          <div
            className="flex flex-nowrap md:flex-wrap items-center gap-3 md:gap-4 md:justify-center  pb-2 md:pb-0  scroll-smooth [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label={locale === "ar" ? "فئات القائمة" : "Menu categories"}
          >
            {categories.map((category) => {
              const isActive = selectedCategory === category.id;

              return (
                <button
                  key={category.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleCategorySelect(category.id)}
                  className={[
                    "shrink-0 snap-start flex items-center gap-2 rounded-2xl border-2 px-4 py-2.5 text-sm font-semibold transition-all duration-200 md:gap-3 md:px-6 md:py-3 md:text-base",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--neon-primary)]",
                    isActive
                      ? "scale-105 border-transparent text-white shadow-lg active:scale-[0.98]"
                      : "border-slate-200 bg-white text-slate-700 hover:scale-105 hover:border-[var(--neon-primary)] hover:bg-[color-mix(in_srgb,var(--neon-primary)_10%,white)] hover:text-[var(--neon-primary)] active:scale-[0.98] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-[color-mix(in_srgb,var(--neon-primary)_18%,#1e293b)]",
                  ].join(" ")}
                  style={
                    {
                      "--neon-primary": primaryColor,
                      "--neon-secondary": secondaryColor,
                      ...(isActive
                        ? {
                            background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                            boxShadow: `0 10px 15px -3px ${primaryColor}50`,
                          }
                        : {}),
                    } as React.CSSProperties
                  }
                >
                  <span className="text-xl md:text-2xl">{category.icon}</span>
                  <span className="whitespace-nowrap">{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="container mx-auto px-4">
          <PromoBanner />
        </div>
        {/* Menu Items Grid */}
        <div
          id="neon-menu-products"
          ref={productsRef}
          className="scroll-mt-28 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {filteredItems.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-600 dark:text-slate-400 text-base">
                {locale === "ar"
                  ? "لا توجد منتاجاتفي هذه الفئة"
                  : "No items in this category"}
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const itemName =
                locale === "ar"
                  ? item.nameAr || item.name
                  : item.nameEn || item.name;
              const itemDescription =
                locale === "ar"
                  ? item.descriptionAr || item.description
                  : item.descriptionEn || item.description;
              const itemCategoryName =
                locale === "ar"
                  ? item.categoryNameAr || item.categoryName
                  : item.categoryNameEn || item.categoryName;

              const categoryName =
                categories.find((cat) => cat.id === item.categoryId?.toString())
                  ?.name ||
                itemCategoryName ||
                "";

              return (
                <NeonMenuItemCard
                  key={item.id}
                  item={item}
                  currency={currency}
                  primaryColor={primaryColor}
                  locale={locale}
                  isTableOrder={isTableOrder}
                  isProPlan={isProPlan}
                  itemName={itemName}
                  itemDescription={itemDescription ?? ""}
                  categoryName={categoryName}
                  onOpen={(item) => openItem(item, setSelectedFoodItem)}
                />
              );
            })
          )}
        </div>
      </div>

      {selectedFoodItem ? (
        <NeonDetailModal
          item={selectedFoodItem}
          onClose={() => setSelectedFoodItem(null)}
          currency={currency}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          isProPlan={isProPlan}
          isTableOrder={isTableOrder}
          categoryName={selectedModalCategoryName}
        />
      ) : null}
    </section>
  );
};
