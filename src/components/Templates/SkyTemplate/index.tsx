import React, { useMemo, useState } from "react";
import { globalStylesSky } from "../Default/style";
import { useAppSelector } from "@/store/hooks";
import Navbar from "./NavBar";
import HeroSection from "../components/HeroSection";
import { useLocale } from "next-intl";
import AdVBanner from "../components/AdBanner";
import SwiperCategory from "../components/SwiperCategory";
import MenuCategoryButton from "./MenuCategoryButton";
import { MenuItem } from "@/types/menu";
import Footer from "./Footer";
import MenuCard from "./MenuCard";
import { ENSFixedBanner } from "../components/ENSFixedBanner";

function SkyTemplate() {
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);
  const menuCustomizations = useAppSelector(
    (state) => state.menu.menuCustomizations,
  );
  const storeMenuItems = useAppSelector((state) => state.menu.menu);
  const storeCategories = useAppSelector((state) => state.menu.categories);

  const locale = useLocale();
  const [activeCategory, setActiveCategory] = useState<number>(0);

  const menuItems = useMemo(() => storeMenuItems ?? [], [storeMenuItems]);

  const editedCategories = useMemo(
    () => [...(storeCategories ?? [])],
    [storeCategories],
  );

  const allCategoriesArray = useMemo(() => {
    const itemsByCategory = new Map<
      number,
      { categoryId: number; items: MenuItem[] }
    >();

    menuItems.forEach((item) => {
      const { categoryId } = item;
      if (!itemsByCategory.has(categoryId)) {
        itemsByCategory.set(categoryId, { categoryId, items: [] });
      }
      itemsByCategory.get(categoryId)!.items.push(item);
    });

    return Array.from(itemsByCategory.values());
  }, [menuItems]);
  const primaryColor = menuCustomizations?.primaryColor || "#2196F3";

  const globalStyle = globalStylesSky.replace(
    /(--bg-main:\s*)([^;]+)(;)/,
    `$1${primaryColor}$3`,
  );

  const customizationsHeroTitle =
    locale === "ar"
      ? menuCustomizations?.heroTitleAr
      : menuCustomizations?.heroTitleEn;
  const customizationsHeroSubtitle =
    locale === "ar"
      ? menuCustomizations?.heroSubtitleAr
      : menuCustomizations?.heroSubtitleEn;
  const title = customizationsHeroTitle || menuInfo?.name;
  const subtitle = customizationsHeroSubtitle || menuInfo?.description;

  return (
    <main className="min-h-screen  bg-white text---text-main)">
      <style jsx global>
        {globalStyle}
      </style>
      <Navbar
        menuName={menuInfo?.name || undefined}
        menuLogo={menuInfo?.logo || undefined}
        whatsapp={menuInfo?.socialWhatsapp || undefined}
      />
      {title ? (
        <HeroSection
          menuName={title || undefined}
          menuDescription={subtitle || undefined}
        />
      ) : (
        <div className="mt-20"></div>
      )}
      <AdVBanner />
      <section className="relative w-full  -mt-20 py-24 px-6 md:px-12 bg-white rounded-t-[5rem] shadow-[0_-20px_50px_-20px_rgba(14,165,233,0.05)]">
        <div className="max-w-7xl mx-auto relative z-10">
          <SwiperCategory
            categories={editedCategories}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          >
            {editedCategories.map((category) => (
              <div key={category.id} className="flex-none">
                <MenuCategoryButton
                  category={{
                    ...category,
                    image:
                      category.image === null ? undefined : category.image,
                  }}
                  isActive={category.id === activeCategory}
                  onClick={() => setActiveCategory(category.id as number)}
                />
              </div>
            ))}
          </SwiperCategory>

          {allCategoriesArray.map((category) => (
            <div
              id={`category-${category.categoryId}`}
              className="mb-20 scroll-mt-32"
              key={category.categoryId}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {category.items.map((item: MenuItem) => (
                  <MenuCard
                    key={item.id}
                    item={item}
                    currency={menuInfo?.currency || "AED"}
                    onClick={() => {}}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <Footer
        menuName={menuInfo?.name || ""}
        menuLogo={menuInfo?.logo || ""}
        footerLogo={menuInfo?.footerLogo || ""}
        footerDescriptionEn={menuInfo?.footerDescriptionEn || ""}
        footerDescriptionAr={menuInfo?.footerDescriptionAr || ""}
        addressEn={menuInfo?.addressEn || ""}
        addressAr={menuInfo?.addressAr || ""}
        phone={menuInfo?.phone || ""}
        socialFacebook={menuInfo?.socialFacebook || ""}
        socialInstagram={menuInfo?.socialInstagram || ""}
        socialTwitter={menuInfo?.socialTwitter || ""}
        socialWhatsapp={menuInfo?.socialWhatsapp || ""}
        workingHours={menuInfo?.workingHours || undefined}
      />
      {menuInfo?.ownerPlanType === "free" && <ENSFixedBanner />}
    </main>
  );
}

export default SkyTemplate;
