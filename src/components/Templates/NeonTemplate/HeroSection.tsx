"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
  SKY_CART_UPDATED_EVENT,
  readSkyCartFromCookie,
  upsertSkyCartQuantityFromMenuItem,
} from "@/lib/skyTemplateCart";
import { useTableCartAllowed } from "@/hooks/useTableCartAllowed";

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
    window.addEventListener(SKY_CART_UPDATED_EVENT, sync);
    return () => window.removeEventListener(SKY_CART_UPDATED_EVENT, sync);
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
      <div className="relative h-48 overflow-hidden">
        <LoadImage
          src={item.image}
          alt={itemName}
          disableLazy={true}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
        {item.discountPercent && item.discountPercent > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            -{item.discountPercent}%
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">
          {itemName}
        </h3>
        {isProPlan && (
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2">
            {itemDescription}
          </p>
        )}
        <div
          className={`${
            isProPlan ? "mt-4" : "mt-2"
          } flex flex-col gap-3`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span
              className="text-xs px-3 py-1 rounded-full font-semibold w-fit"
              style={{
                backgroundColor: `${primaryColor}15`,
                color: primaryColor,
              }}
            >
              {categoryName}
            </span>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {item.originalPrice && item.originalPrice > item.price && (
                <span className="text-slate-400 line-through text-sm">
                  {item.originalPrice} {currency}
                </span>
              )}
              <span
                className="font-bold text-lg"
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
                    className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
                    style={{ color: primaryColor }}
                    onClick={() => setPickQty((q) => Math.max(1, q - 1))}
                    aria-label={locale === "ar" ? "تقليل" : "Decrease"}
                  >
                    −
                  </button>
                  <span
                    className="min-w-7 text-center text-sm font-bold tabular-nums"
                    style={{ color: primaryColor }}
                  >
                    {pickQty}
                  </span>
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
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
                  className="shrink-0 rounded-full px-4 py-2 text-xs font-bold text-white shadow-md transition hover:opacity-90"
                  style={{ backgroundColor: primaryColor }}
                >
                  {locale === "ar" ? "أضف للسلة" : "Add to cart"}
                </button>
              </div>
              {inCart > 0 ? (
                <p className="text-center text-xs text-slate-500 dark:text-slate-400">
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
  const searchParams = useSearchParams();
  const tableCartAllowed = useTableCartAllowed();
  const isTableOrder =
    Boolean(searchParams.get("table")?.trim()) && tableCartAllowed;
  const [, setSelectedFoodItem] = useState<MenuItem | null>(null);

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
      ? customizationsData.heroTitleAr || "استكشف قائمتنا"
      : customizationsData.heroTitleEn || "Explore Our Menu";
  const heroSubtitle =
    locale === "ar"
      ? customizationsData.heroSubtitleAr ||
        "اختر من مجموعة متنوعة من الأطباق اللذيذة"
      : customizationsData.heroSubtitleEn ||
        "Choose from a variety of delicious dishes";

  // Build categories from menuData with "all" option
  const categories = useMemo(() => {
    const allCategory = {
      id: "all",
      name: locale === "ar" ? "الكل" : "All",
      icon: "🍽️",
    };

    const dbCategories = menuCategories
      .filter((cat) => cat.isActive !== false)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((cat) => ({
        id: cat.id.toString(),
        name: locale === "ar" ? cat.nameAr || cat.name : cat.nameEn || cat.name,
        icon: "🍽️",
      }));

    return [allCategory, ...dbCategories];
  }, [menuCategories, locale]);

  // Filter items based on selected category
  const filteredItems = useMemo(() => {
    if (selectedCategory === "all") {
      return menuItems;
    }
    return menuItems.filter(
      (item) => item.categoryId?.toString() === selectedCategory,
    );
  }, [menuItems, selectedCategory]);

  return (
    <section
      id="templates"
      className="py-24 md:py-32 bg-linear-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{
              backgroundColor: `${primaryColor}15`,
              border: `1px solid ${primaryColor}40`,
            }}
          >
            <FaStar className="w-4 h-4" style={{ color: primaryColor }} />
            <span
              className="text-sm font-semibold"
              style={{ color: primaryColor }}
            >
              {locale === "ar" ? "قائمة الطعام" : "Menu Items"}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-6">
            {heroTitle}
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12">
            {heroSubtitle}
          </p>
        </div>

        {/* Categories Filter */}
        <div className="mb-16">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`group flex items-center gap-3 px-6 py-3 rounded-2xl font-semibold text-base transition-all duration-300 ${
                  selectedCategory === category.id
                    ? "text-white shadow-lg scale-105"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-700 hover:scale-105"
                }`}
                style={
                  selectedCategory === category.id
                    ? {
                        background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                        boxShadow: `0 10px 15px -3px ${primaryColor}50`,
                      }
                    : {
                        borderColor:
                          selectedCategory !== category.id
                            ? undefined
                            : `${primaryColor}40`,
                      }
                }
                onMouseEnter={(e) => {
                  if (selectedCategory !== category.id) {
                    e.currentTarget.style.borderColor = `${primaryColor}60`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== category.id) {
                    e.currentTarget.style.borderColor = "";
                  }
                }}
              >
                <span className="text-2xl">{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4">
          <PromoBanner
            menuId={menuInfo?.id || undefined}
            ownerPlanType={menuInfo?.ownerPlanType || undefined}
          />
        </div>
        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                {locale === "ar"
                  ? "لا توجد عناصر في هذه الفئة"
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
                  onOpen={setSelectedFoodItem}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Food Item Modal */}
      {/* <FoodItemModal
        isOpen={selectedFoodItem !== null}
        onClose={() => setSelectedFoodItem(null)}
        item={selectedFoodItem}
        isProPlan={isProPlan}
        currency={currency}
      /> */}
    </section>
  );
};
