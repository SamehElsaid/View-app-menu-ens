import React, { useEffect, useMemo, useState } from "react";
import { globalStylesSky } from "../Default/style";
import { useAppSelector } from "@/store/hooks";
import Navbar from "./NavBar";
import HeroSection from "../components/HeroSection";
import { useLocale } from "next-intl";
import { toast } from "react-toastify";
import AdVBanner from "../components/AdBanner";
import SwiperCategory from "../components/SwiperCategory";
import MenuCategoryButton from "./MenuCategoryButton";
import { MenuItem } from "@/types/menu";
import Footer from "./Footer";
import MenuCard from "./MenuCard";
import { ENSFixedBanner } from "../components/ENSFixedBanner";

const CART_COOKIE_KEY = "sky_template_cart";
const CART_COOKIE_EXPIRES_DAYS = 1;
const CART_UPDATED_EVENT = "sky-template-cart-updated";

type CartItem = {
  id: number;
  quantity: number;
  name: string;
  price: number;
  image: string;
};

const readCartFromCookie = (): Record<number, CartItem> => {
  if (typeof document === "undefined") {
    return {};
  }

  const cookieEntry = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CART_COOKIE_KEY}=`));

  if (!cookieEntry) {
    return {};
  }

  try {
    const cookieValue = decodeURIComponent(cookieEntry.split("=")[1] || "");
    return JSON.parse(cookieValue) as Record<number, CartItem>;
  } catch {
    return {};
  }
};

function SkyTemplate() {
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);
  const menuCustomizations = useAppSelector(
    (state) => state.menu.menuCustomizations,
  );
  const storeMenuItems = useAppSelector((state) => state.menu.menu);
  const storeCategories = useAppSelector((state) => state.menu.categories);

  const locale = useLocale();
  const [activeCategory, setActiveCategory] = useState<number>(0);
  const [cart, setCart] = useState<Record<number, CartItem>>(() =>
    readCartFromCookie(),
  );

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

  useEffect(() => {
    const expiresDate = new Date(
      Date.now() + CART_COOKIE_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
    );

    document.cookie = `${CART_COOKIE_KEY}=${encodeURIComponent(
      JSON.stringify(cart),
    )}; expires=${expiresDate.toUTCString()}; path=/; SameSite=Lax`;
  }, [cart]);

  useEffect(() => {
    const handleCartUpdated = () => {
      setCart(readCartFromCookie());
    };

    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated);
    return () => window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated);
  }, []);

  const updateCartQuantity = (item: MenuItem, nextQuantity: number) => {
    setCart((prevCart) => {
      const nextCart = { ...prevCart };

      if (nextQuantity <= 0) {
        delete nextCart[item.id];
        return nextCart;
      }

      nextCart[item.id] = {
        id: item.id,
        quantity: nextQuantity,
        name: item.name,
        price: item.price,
        image: item.image,
      };

      return nextCart;
    });
  };

  const handleAddToCart = (item: MenuItem, quantityToAdd: number) => {
    const currentQuantity = cart[item.id]?.quantity ?? 0;
    updateCartQuantity(item, currentQuantity + quantityToAdd);
    toast.success(
      locale === "ar"
        ? `تمت إضافة ${quantityToAdd} إلى السلة`
        : `Added ${quantityToAdd} to cart`,
    );
  };

  const primaryColor = menuCustomizations?.primaryColor || "#2196F3";
  const cartLabels = useMemo(
    () =>
      locale === "ar"
        ? {
            addToCart: "أضف إلى السلة",
            increase: "زيادة الكمية",
            decrease: "تقليل الكمية",
          }
        : {
            addToCart: "Add to cart",
            increase: "Increase quantity",
            decrease: "Decrease quantity",
          },
    [locale],
  );

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
                    quantity={cart[item.id]?.quantity ?? 0}
                    addToCartLabel={cartLabels.addToCart}
                    increaseLabel={cartLabels.increase}
                    decreaseLabel={cartLabels.decrease}
                    onAddToCart={(selectedQuantity) =>
                      handleAddToCart(item, selectedQuantity)
                    }
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
