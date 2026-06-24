"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useIsOrderingEnabled } from "@/hooks/useIsOrderingEnabled";
import {
  Category,
  MenuItem,
  MenuItemSizeOption,
  MenuItemVariantOption,
} from "@/types/menu";
import { useLocale, useTranslations } from "next-intl";

import {
  getCartQuantityForMenuItem,
  readSkyCartFromCookie,
  subscribeSkyCartUpdated,
  upsertSkyCartFromMenuItemWithOptions,
  type SkyCart,
} from "@/lib/skyTemplateCart";
import { MenuCardDefault } from "./MenuCardDefault";
import SwiperCategory from "../components/SwiperCategory";
import { useAppSelector } from "@/store/hooks";
import { Icon } from "../components/Icon";
import { useCategoryNav } from "./CategoryNavContext";
import { getCategoryIconName, type MenuCategoryLike } from "./categoryIconMap";
import {
  buildCategorySections,
} from "@/lib/menuCategoryOrder";
import { useProductModalUrl } from "@/hooks/useProductModalUrl";
import LoadImage from "@/components/ImageLoad";
import { useMenuCatalogPagination } from "@/hooks/useMenuCatalogPagination";
import MenuCatalogSentinel from "@/components/Global/MenuCatalogSentinel";
import MenuCatalogSkeleton, {
  MenuCategoryHeaderSkeleton,
} from "@/components/Global/MenuCatalogSkeleton";

const NAV_OFFSET_PX = 80;

function getCategoryLabel(category: Category, locale: string): string {
  return locale === "ar"
    ? category.nameAr || category.name
    : category.nameEn || category.name;
}

function CategoryFilterChip({
  label,
  isActive,
  onClick,
  image,
  fallbackIcon,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  image?: string | null;
  fallbackIcon?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onClick}
      className={[
        "group relative inline-flex min-h-[3.5rem] min-w-[9rem] max-w-[min(88vw,15rem)] items-center justify-between gap-3 overflow-hidden rounded-full border ps-4 pe-1.5 py-1.5 transition-all duration-300 sm:min-w-[10rem] sm:ps-5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--bg-main)/45 focus-visible:ring-offset-2",
        isActive
          ? "border-transparent bg-linear-to-r from-(--bg-main) to-(--bg-main)/85 text-white shadow-[0_12px_28px_-14px] shadow-(--bg-main)/70"
          : "border-(--bg-main)/10 bg-white/95 text-zinc-800 shadow-[0_8px_24px_-20px] shadow-(--bg-main)/40 hover:-translate-y-0.5 hover:border-(--bg-main)/25 hover:shadow-[0_16px_30px_-18px] hover:shadow-(--bg-main)/35 active:translate-y-0",
      ].join(" ")}
    >
      {isActive ? (
        <span
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(255,255,255,0.22),transparent_55%)]"
          aria-hidden
        />
      ) : null}

      <span
        className={`relative z-10 min-w-0 flex-1 truncate text-start text-sm font-black leading-tight sm:text-[15px] ${
          isActive ? "text-white" : "text-zinc-800 group-hover:text-(--bg-main)"
        }`}
      >
        {label}
      </span>

      {image?.trim() ? (
        <span
          className={`relative z-10 h-11 w-11 shrink-0 overflow-hidden rounded-full shadow-md ring-2 ${
            isActive
              ? "ring-white/95"
              : "ring-white group-hover:ring-(--bg-main)/20"
          }`}
        >
          <LoadImage
            src={image}
            alt={label}
            fill
            height={44}
            width={44}
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </span>
      ) : fallbackIcon ? (
        <span
          className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-md ring-2 ${
            isActive
              ? "bg-white/18 ring-white/95 text-white"
              : "bg-(--bg-main)/10 ring-white text-(--bg-main) group-hover:bg-(--bg-main)/15"
          }`}
        >
          <Icon name={fallbackIcon} className="text-lg" />
        </span>
      ) : null}
    </button>
  );
}

function CategorySectionHeader({
  category,
  locale,
  itemCount,
}: {
  category: Category;
  locale: string;
  itemCount: number;
}) {
  const label = getCategoryLabel(category, locale);
  const countLabel =
    locale === "ar"
      ? `${itemCount} ${itemCount === 1 ? "منتج" : "منتجات"}`
      : `${itemCount} ${itemCount === 1 ? "item" : "items"}`;

  return (
    <div className="relative mb-10 overflow-hidden rounded-[1.75rem] border border-(--bg-main)/10 bg-white shadow-[0_18px_40px_-28px] shadow-(--bg-main)/35">
      {category.image?.trim() ? (
        <>
          <div className="absolute inset-0">
            <LoadImage
              src={category.image}
              alt=""
              fill
              className="object-cover opacity-[0.14] blur-md scale-110"
            />
          </div>
          <div className="absolute inset-0 bg-linear-to-r from-white via-white/95 to-white/80" />
        </>
      ) : (
        <div className="absolute inset-0 bg-linear-to-r from-(--bg-main)/6 via-white to-white" />
      )}

      <div className="relative flex items-center gap-4 p-4 sm:gap-5 sm:p-5">
        {category.image?.trim() ? (
          <span className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-2xl shadow-lg ring-4 ring-white sm:h-20 sm:w-20">
            <LoadImage
              src={category.image}
              alt={label}
              fill
              className="object-cover"
            />
          </span>
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-2xl font-black text-(--bg-main) sm:text-[1.75rem]">
              {label}
            </h2>
            <span className="rounded-full bg-(--bg-main)/10 px-3 py-1 text-xs font-black text-(--bg-main) sm:text-sm">
              {countLabel}
            </span>
          </div>
          <div className="mt-3 h-1 w-full max-w-xs overflow-hidden rounded-full bg-(--bg-main)/10">
            <div className="h-full w-2/5 rounded-full bg-linear-to-r from-(--bg-main) to-(--bg-main)/50" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MenuSection({ currency }: { currency: string }) {
  const locale = useLocale();
  const t = useTranslations("menu");
  const { isOrderingEnabled: isTableOrder } = useIsOrderingEnabled();
  const [cart, setCart] = useState<SkyCart>({});
  const { openItemId, isModalOpen, openModal, closeModal } = useProductModalUrl();
  const menuTitleRef = useRef<HTMLDivElement>(null);
  const { activeCategory, setActiveCategory, setShowCategoryBurger } =
    useCategoryNav();

  const storeCategories = useAppSelector((state) => state.menu.categories);

  const {
    items: menuItems,
    initialLoading: catalogInitialLoading,
    loadingMore: catalogLoadingMore,
    hasMore,
    sentinelRef,
  } = useMenuCatalogPagination(activeCategory);

  const categories = useMemo(
    () =>
      (storeCategories ?? []).filter(
        (category) => category.isActive !== false,
      ),
    [storeCategories],
  );

  useEffect(() => {
    const el = menuTitleRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const passed = rect.bottom < NAV_OFFSET_PX;
      setShowCategoryBurger(passed);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [setShowCategoryBurger]);

  useEffect(() => {
    return subscribeSkyCartUpdated(() => setCart(readSkyCartFromCookie()));
  }, []);

  const handleAddToCart = (
    item: MenuItem,
    quantityToAdd: number,
    options?: {
      size?: MenuItemSizeOption | null;
      variant?: MenuItemVariantOption | null;
    },
  ) => {
    upsertSkyCartFromMenuItemWithOptions(item, quantityToAdd, {
      locale,
      size: options?.size ?? null,
      variant: options?.variant ?? null,
    });
    setCart(readSkyCartFromCookie());
  };

  const categorySections = useMemo(
    () => buildCategorySections(categories, menuItems),
    [categories, menuItems],
  );

  const activeCategoryData = useMemo(() => {
    if (activeCategory === 0) return null;
    return categories.find((category) => category.id === activeCategory) ?? null;
  }, [activeCategory, categories]);

  const renderMenuCard = (item: MenuItem, index: number) => (
    <MenuCardDefault
      key={item.id}
      item={item}
      index={index}
      currency={currency}
      onClick={() => {}}
      openItemId={openItemId}
      onOpenModal={openModal}
      onCloseModal={closeModal}
      isTableOrder={isTableOrder}
      cartQuantity={getCartQuantityForMenuItem(cart, item.id)}
      onAddToCart={({ quantity, size, variant }) =>
        handleAddToCart(item, quantity, { size, variant })
      }
    />
  );

  return (
    <div
      id="menu"
      className={`max-w-7xl mx-auto scroll-mt-32 relative ${isModalOpen ? "z-11111111111" : "z-10"} mt-10`}
    >
      <div ref={menuTitleRef} className="mb-6 px-1">
        <p className="mb-3 text-center text-xs font-black uppercase tracking-[0.22em] text-(--bg-main)/55 sm:text-start">
          {t("ourMenu")}
        </p>
        <SwiperCategory
          isGray={true}
          sticky={false}
          showNavButtons
          filterMode
          viewAllSlide
          categories={categories as MenuCategoryLike[]}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        >
          <div className="flex-none shrink-0 snap-start">
            <CategoryFilterChip
              label={t("all")}
              isActive={activeCategory === 0}
              onClick={() => setActiveCategory(0)}
              fallbackIcon="grid-line"
            />
          </div>
          {categories.map((category) => (
            <div key={category.id.toString()} className="flex-none shrink-0 snap-start">
              <CategoryFilterChip
                label={getCategoryLabel(category, locale)}
                isActive={category.id === activeCategory}
                onClick={() => setActiveCategory(category.id as number)}
                image={category.image}
                fallbackIcon={getCategoryIconName(category as MenuCategoryLike)}
              />
            </div>
          ))}
        </SwiperCategory>
      </div>

      {activeCategory === 0 ? (
        categorySections.length > 0 ? (
          <div className="space-y-20">
            {categorySections.map((section) => {
              const category =
                categories.find((entry) => entry.id === section.categoryId) ??
                ({
                  id: section.categoryId,
                  name: section.items[0]?.categoryName ?? "",
                  nameAr: section.items[0]?.categoryNameAr ?? "",
                  nameEn: section.items[0]?.categoryNameEn ?? "",
                  menuItems: [],
                } as Category);

              return (
                <section
                  key={section.categoryId}
                  id={`category-${section.categoryId}`}
                  className="scroll-mt-32"
                >
                  <CategorySectionHeader
                    category={category}
                    locale={locale}
                    itemCount={section.items.length}
                  />
                  <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
                    {section.items.map((item, index) =>
                      renderMenuCard(item, index),
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-(--bg-main)/25 bg-white/80 px-6 py-12 text-center text-base font-medium text-zinc-500">
            {t("noItems")}
          </p>
        )
      ) : activeCategoryData ? (
        <>
          {catalogInitialLoading ? (
            <>
              <MenuCategoryHeaderSkeleton />
              <MenuCatalogSkeleton variant="default" count={6} />
            </>
          ) : (
            <>
              <CategorySectionHeader
                category={activeCategoryData}
                locale={locale}
                itemCount={activeCategoryData.itemsCount ?? menuItems.length}
              />
              {menuItems.length > 0 ? (
                <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
                  {menuItems.map((item, index) => renderMenuCard(item, index))}
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed border-(--bg-main)/25 bg-white/80 px-6 py-12 text-center text-base font-medium text-zinc-500">
                  {t("noItems")}
                </p>
              )}
            </>
          )}
        </>
      ) : null}

      <MenuCatalogSentinel
        sentinelRef={sentinelRef}
        loadingMore={catalogLoadingMore}
        hasMore={hasMore}
        skeletonVariant="default"
      />
    </div>
  );
}
