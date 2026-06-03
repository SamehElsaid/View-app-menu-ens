import { useAppSelector } from "@/store/hooks";
import { Suspense, useMemo } from "react";
import { useLocale } from "next-intl";
import Navbar from "./NavBar";
import HeroSection from "./HeroSection";
import PromoBanner from "./PromoBanner";
import MenuCategory from "./MenuCategory";
import { Category, MenuItem } from "@/types/menu";
import Footer from "./Footer";
import { ENSFixedBanner } from "../components/ENSFixedBanner";
import { menuTemplateFontFamily } from "@/lib/menuTemplateFont";
import { sortCategories, sortMenuItems } from "@/lib/menuCategoryOrder";

function CoffeeTemplate() {
  const locale = useLocale();
  const menu = useAppSelector((state) => state.menu);

  const categoriesWithItems = useMemo(() => {
    const categories = sortCategories(menu?.categories || []);
    const menuItems = menu?.menu || [];

    return categories.map((category: Category) => {
      const itemsFromCategory = category.menuItems || [];
      const fallbackItems = menuItems.filter(
        (item: MenuItem) =>
          item.categoryId === category.id ||
          item.categoryName === category.name,
      );
      const resolvedItems =
        itemsFromCategory.length > 0 ? itemsFromCategory : fallbackItems;

      return {
        ...category,
        menuItems: sortMenuItems(resolvedItems),
      };
    });
  }, [menu?.categories, menu?.menu]);

  return (
    <main
      className="menu-template font-body min-h-screen bg-[#17120F]"
      style={{ fontFamily: menuTemplateFontFamily(locale) }}
    >
      <Navbar
        menuName={menu?.menuInfo?.name || undefined}
        menuLogo={menu?.menuInfo?.logo || undefined}
        categories={categoriesWithItems.map((c) => ({
          id: c.id,
          title: c.name,
          titleAr: c.nameAr || c.name,
        }))}
      />

      <HeroSection
        menuName={menu?.menuInfo?.name || undefined}
        menuDescription={menu?.menuInfo?.description || undefined}
      />

      <div className="container mx-auto px-6 pb-20" id="menu">
        <PromoBanner />

        {categoriesWithItems.length > 0 ? (
          <Suspense fallback={null}>
            {categoriesWithItems.map((category: Category) => {
              const categoryId = category.id
                ? `category-${category.id}`
                : `category-${category.name.replace(/\s+/g, "-").toLowerCase()}`;
              return (
                <div key={category.id || category.name} id={categoryId}>
                  <MenuCategory
                    title={category.name}
                    titleAr={category.nameAr || ""}
                    description={category.description || ""}
                    descriptionAr={category.descriptionAr || ""}
                    items={category.menuItems || []}
                    currency={menu?.menuInfo?.currency || "AED"}
                  />
                </div>
              );
            })}
          </Suspense>
        ) : (
          <div className="text-center py-20">
            <p className="text-[#B6AA99] text-base">
              {menu?.menuInfo?.name || "Menu"} - No items available
            </p>
          </div>
        )}
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
