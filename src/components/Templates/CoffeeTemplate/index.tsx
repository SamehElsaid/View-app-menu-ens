"use client";

import { useAppSelector } from "@/store/hooks";
import { Suspense, useCallback, useMemo, useState, useTransition } from "react";
import { useLocale } from "next-intl";
import Navbar from "./NavBar";
import HeroSection from "./HeroSection";
import PromoBanner from "./PromoBanner";
import MenuCategory from "./MenuCategory";
import CategoryFilter from "./CategoryFilter";
import Footer from "./Footer";
import { ENSFixedBanner } from "../components/ENSFixedBanner";
import { menuTemplateFontFamily } from "@/lib/menuTemplateFont";
import { sortCategories, buildCategorySections } from "@/lib/menuCategoryOrder";
import { useMenuCatalogPagination } from "@/hooks/useMenuCatalogPagination";
import MenuCatalogSentinel from "@/components/Global/MenuCatalogSentinel";
import MenuCatalogSkeleton from "@/components/Global/MenuCatalogSkeleton";

function CoffeeTemplate() {
  const locale = useLocale();
  const menu = useAppSelector((state) => state.menu);
  const [isPending, startTransition] = useTransition();

  /*
   * Two-layer selection (same pattern as OneCardTemplate):
   * - selectedCategoryId: updates instantly → drives visual highlight in CategoryFilter
   * - activeCategoryId: updates inside startTransition → drives the heavy re-render + API fetch
   */
  const [selectedCategoryId, setSelectedCategoryId] = useState(0);
  const [activeCategoryId, setActiveCategoryId] = useState(0);

  const handleCategorySelect = useCallback((id: number) => {
    setSelectedCategoryId(id);
    startTransition(() => {
      setActiveCategoryId(id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const storeCategories = useMemo(
    () => sortCategories(menu?.categories || []),
    [menu?.categories],
  );

  const { items, initialLoading, loadingMore, hasMore, sentinelRef } =
    useMenuCatalogPagination(activeCategoryId);

  const categorySections = useMemo(
    () => buildCategorySections(storeCategories, items),
    [storeCategories, items],
  );

  const renderContent = () => {
    if (initialLoading) {
      return <MenuCatalogSkeleton variant="coffee" count={6} />;
    }

    if (activeCategoryId !== 0) {
      const activeCategory = storeCategories.find(
        (c) => c.id === activeCategoryId,
      );
      if (items.length === 0) {
        return (
          <div className="py-16 text-center">
            <p className="text-[#B6AA99] text-base">
              {locale === "ar" ? "لا توجد منتجات في هذا التصنيف." : "No items in this category."}
            </p>
          </div>
        );
      }
      return (
        <Suspense fallback={null}>
          <MenuCategory
            title={activeCategory?.name || ""}
            titleAr={activeCategory?.nameAr || ""}
            description={activeCategory?.description || ""}
            descriptionAr={activeCategory?.descriptionAr || ""}
            items={items}
            currency={menu?.menuInfo?.currency || "AED"}
          />
        </Suspense>
      );
    }

    if (categorySections.length === 0) {
      return (
        <div className="py-20 text-center">
          <p className="text-[#B6AA99] text-base">
            {menu?.menuInfo?.name || "Menu"} - No items available
          </p>
        </div>
      );
    }

    return (
      <Suspense fallback={null}>
        {categorySections.map((section) => {
          const category = storeCategories.find(
            (c) => c.id === section.categoryId,
          );
          if (!category) return null;
          const categoryId = category.id
            ? `category-${category.id}`
            : `category-${category.name.replace(/\s+/g, "-").toLowerCase()}`;
          return (
            <div key={section.categoryId} id={categoryId}>
              <MenuCategory
                title={category.name}
                titleAr={category.nameAr || ""}
                description={category.description || ""}
                descriptionAr={category.descriptionAr || ""}
                items={section.items}
                currency={menu?.menuInfo?.currency || "AED"}
              />
            </div>
          );
        })}
      </Suspense>
    );
  };

  return (
    <main
      className="menu-template font-body min-h-screen bg-[#17120F]"
      style={{ fontFamily: menuTemplateFontFamily(locale) }}
    >
      <Navbar
        menuName={menu?.menuInfo?.name || undefined}
        menuLogo={menu?.menuInfo?.logo || undefined}
      />

      <HeroSection
        menuName={menu?.menuInfo?.name || undefined}
        menuDescription={menu?.menuInfo?.description || undefined}
      />

      <div className="container mx-auto px-6 pb-20" id="menu">
        <PromoBanner />

        <CategoryFilter
          categories={storeCategories}
          activeCategoryId={selectedCategoryId}
          onSelect={handleCategorySelect}
        />

        <div
          className={`transition-opacity duration-150 ${isPending ? "opacity-50 pointer-events-none" : "opacity-100"}`}
        >
          {renderContent()}
        </div>

        <MenuCatalogSentinel
          sentinelRef={sentinelRef}
          loadingMore={loadingMore}
          hasMore={hasMore}
          skeletonVariant="coffee"
        />
      </div>

      <Footer
        menuName={menu?.menuInfo?.name || undefined}
        menuLogo={menu?.menuInfo?.logo || undefined}
        footerLogo={menu?.menuInfo?.footerLogo || undefined}
        footerDescriptionEn={menu?.menuInfo?.footerDescriptionEn || undefined}
        footerDescriptionAr={menu?.menuInfo?.footerDescriptionAr || undefined}
        addressEn={menu?.menuInfo?.addressEn || undefined}
        addressAr={menu?.menuInfo?.addressAr || undefined}
        phone={menu?.menuInfo?.phone || undefined}
        socialFacebook={menu?.menuInfo?.socialFacebook || undefined}
        socialInstagram={menu?.menuInfo?.socialInstagram || undefined}
        socialTwitter={menu?.menuInfo?.socialTwitter || undefined}
        socialWhatsapp={menu?.menuInfo?.socialWhatsapp || undefined}
        workingHours={menu?.menuInfo?.workingHours || undefined}
      />
      {menu?.menuInfo?.ownerPlanType === "free" && <ENSFixedBanner />}
    </main>
  );
}

export default CoffeeTemplate;
