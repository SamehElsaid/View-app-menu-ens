import { useAppSelector } from "@/store/hooks";
import { useMemo } from "react";
import Navbar from "./NavBar";
import HeroSection from "./HeroSection";
import PromoBanner from "./PromoBanner";
import MenuCategory from "./MenuCategory";
import { Category, MenuItem } from "@/types/menu";
import Footer from "./Footer";

function CoffeeTemplate() {
  const menu = useAppSelector((state) => state.menu);

  const categoriesWithItems = useMemo(() => {
    const categories = menu?.categories || [];
    const menuItems = menu?.menu || [];

    return categories.map((category: Category) => {
      const itemsFromCategory = category.menuItems || [];
      const fallbackItems = menuItems.filter(
        (item: MenuItem) =>
          item.categoryId === category.id ||
          item.categoryName === category.name,
      );

      return {
        ...category,
        menuItems:
          itemsFromCategory.length > 0 ? itemsFromCategory : fallbackItems,
      };
    });
  }, [menu?.categories, menu?.menu]);

  return (
    <main className="min-h-screen bg-[#17120F]">
      <Navbar
        menuName={menu?.menuInfo?.name || undefined}
        menuLogo={menu?.menuInfo?.logo || undefined}
      />

      <HeroSection
        menuName={menu?.menuInfo?.name || undefined}
        menuDescription={menu?.menuInfo?.description || undefined}
      />

      <div className="container mx-auto px-6 pb-20" id="menu">
        <PromoBanner
          menuId={menu?.menuInfo?.id || undefined}
          ownerPlanType={menu?.menuInfo?.ownerPlanType || undefined}
        />

        {categoriesWithItems.length > 0 ? (
          categoriesWithItems.map((category: Category) => {
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
                />
              </div>
            );
          })
        ) : (
          <div className="text-center py-20">
            <p className="text-[#B6AA99] text-lg">
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
    </main>
  );
}

export default CoffeeTemplate;
