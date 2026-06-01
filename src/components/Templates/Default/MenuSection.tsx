"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MenuItem } from "@/types/menu";
import { useLocale, useTranslations } from "next-intl";

import {
  SKY_CART_UPDATED_EVENT,
  readSkyCartFromCookie,
  upsertSkyCartQuantityFromMenuItem,
  type SkyCartItem,
} from "@/lib/skyTemplateCart";
import { MenuCardDefault } from "./MenuCardDefault";
import SwiperCategory from "../components/SwiperCategory";
import { useAppSelector } from "@/store/hooks";
import { Icon } from "../components/Icon";
import { useCategoryNav } from "./CategoryNavContext";
import { getCategoryIconName, type MenuCategoryLike } from "./categoryIconMap";
import { useTableCartAllowed } from "@/hooks/useTableCartAllowed";

const NAV_OFFSET_PX = 80;

export default function MenuSection({ currency }: { currency: string }) {
  const locale = useLocale();
  const t = useTranslations("menu");
  const searchParams = useSearchParams();
  const tableCartAllowed = useTableCartAllowed();
  const isTableOrder =
    Boolean(searchParams.get("table")?.trim()) && tableCartAllowed;
  const [cart, setCart] = useState<Record<number, SkyCartItem>>({});
  const [isModalOpen, setIsModalOpen] = useState(0);
  const menuTitleRef = useRef<HTMLDivElement>(null);
  const { activeCategory, setActiveCategory, setShowCategoryBurger } =
    useCategoryNav();

  const storeMenuItems = useAppSelector((state) => state.menu.menu);
  const storeCategories = useAppSelector((state) => state.menu.categories);

  const menuItems = useMemo(() => storeMenuItems ?? [], [storeMenuItems]);

  const categories = useMemo(
    () => [...(storeCategories ?? [])],
    [storeCategories],
  );

  useEffect(() => {
    if (categories.length === 0) return;
    const hasActive = categories.some((c) => c.id === activeCategory);
    if (!hasActive) {
      setActiveCategory(categories[0].id as number);
    }
  }, [categories, activeCategory, setActiveCategory]);

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
    const sync = () => setCart(readSkyCartFromCookie());
    sync();
    window.addEventListener(SKY_CART_UPDATED_EVENT, sync);
    return () => window.removeEventListener(SKY_CART_UPDATED_EVENT, sync);
  }, []);

  const handleAddToCart = (item: MenuItem, quantityToAdd: number) => {
    upsertSkyCartQuantityFromMenuItem(item, quantityToAdd);
    setCart(readSkyCartFromCookie());
  };

  // Group items by category
  const allCategoriesArray = useMemo(() => {
    const map = new Map<number, { categoryId: number; items: MenuItem[] }>();
    menuItems.forEach((item: MenuItem) => {
      if (!map.has(item.categoryId)) {
        map.set(item.categoryId, { categoryId: item.categoryId, items: [] });
      }
      map.get(item.categoryId)!.items.push(item);
    });
    return Array.from(map.values());
  }, [menuItems]);

  return (
    <div
      id="menu"
      className={`max-w-7xl mx-auto scroll-mt-32 relative ${isModalOpen ? "z-11111111111" : "z-10"} mt-10`}
    >
     

      {/* Categories Navigation */}
      <SwiperCategory
        isGray={true}
        sticky={false}
        categories={categories as MenuCategoryLike[]}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      >
        {categories.map((category) => {
          const isActive = category.id === activeCategory;

          return (
            <div key={category.id.toString()} className="flex-none shrink-0">
              <button
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveCategory(category.id as number)}
                className={[
                  "inline-flex min-w-0 max-w-[min(90vw,18rem)] items-center justify-center gap-1.5 rounded-2xl border-2 px-4 py-2.5 text-base font-black transition-all duration-200 sm:max-w-none sm:px-10 sm:py-4 sm:text-base",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--bg-main)/45 focus-visible:ring-offset-2",
                  isActive
                    ? "border-transparent bg-(--bg-main) text-white shadow-md shadow-purple-300/40 hover:bg-(--bg-main)/90 active:scale-[0.98]"
                    : "group border-zinc-200 bg-white text-zinc-600 shadow-sm hover:border-(--bg-main) hover:bg-(--bg-main)/10 hover:text-(--bg-main) active:scale-[0.98] active:border-(--bg-main) active:bg-(--bg-main)/15",
                ].join(" ")}
              >
                <Icon
                  name={getCategoryIconName(category as MenuCategoryLike)}
                  className={
                    isActive
                      ? "shrink-0 text-base text-white sm:text-base"
                      : "shrink-0 text-base text-zinc-500 transition-colors group-hover:text-(--bg-main) sm:text-base"
                  }
                />
                <span className="min-w-0 truncate text-start">
                  {locale === "ar"
                    ? category.nameAr || category.name
                    : category.name}
                </span>
              </button>
            </div>
          );
        })}
      </SwiperCategory>

      {/* Menu Grid */}

      {allCategoriesArray.map((category) => (
        <div
          id={`category-${category.categoryId}`}
          className="mb-20 scroll-mt-32"
          key={category.categoryId}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {category.items.map((item: MenuItem, index: number) => (
              <MenuCardDefault
                key={item.id}
                item={item}
                index={index}
                currency={currency}
                onClick={() => {}}
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                isTableOrder={isTableOrder}
                cartQuantity={cart[item.id]?.quantity ?? 0}
                onAddToCart={(quantityToAdd) =>
                  handleAddToCart(item, quantityToAdd)
                }
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
