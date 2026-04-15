"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MenuItem } from "@/types/menu";
import { useLocale, useTranslations } from "next-intl";

import { MenuCardDefault } from "./MenuCardDefault";
import SwiperCategory from "../components/SwiperCategory";
import { useAppSelector } from "@/store/hooks";
import { Icon } from "../components/Icon";
import { useCategoryNav } from "./CategoryNavContext";
import { getCategoryIconName, type MenuCategoryLike } from "./categoryIconMap";

const NAV_OFFSET_PX = 80;

export default function MenuSection({ currency }: { currency: string }) {
  const locale = useLocale();
  const t = useTranslations("menu");
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
      className={`max-w-7xl mx-auto scroll-mt-32 relative ${isModalOpen ? "z-11111111111" : "z-10"} mt-36`}
    >
      <div ref={menuTitleRef} className="text-center mb-20">
        <h2 className="text-4xl md:text-6xl font-black mb-6">
          <span className="text-(--bg-main) bg-(--bg-main)/10 px-4 py-1 rounded-2xl">
            {t("title")}
          </span>
        </h2>
        <div className="w-32 h-1.5 bg-(--bg-main) mx-auto rounded-full" />
      </div>

      {/* Categories Navigation */}
      <SwiperCategory
        isGray={true}
        sticky={false}
        categories={categories as MenuCategoryLike[]}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      >
        {categories.map((category) => (
          <div key={category.id.toString()} className="flex-none shrink-0">
            <button
              type="button"
              onClick={() => setActiveCategory(category.id as number)}
              className={`inline-flex min-w-0 max-w-[min(90vw,18rem)] items-center justify-center gap-1.5 rounded-2xl px-4 py-2.5 text-xs font-black shadow-sm transition-all duration-300 sm:max-w-none sm:px-10 sm:py-4 sm:text-sm ${
                category.id === activeCategory
                  ? "bg-(--bg-main) text-white shadow-(--bg-main)"
                  : "border border-zinc-100 bg-white text-zinc-500 hover:border-(--bg-main) hover:text-(--bg-main)"
              } `}
            >
              <Icon
                name={getCategoryIconName(category as MenuCategoryLike)}
                className="shrink-0 text-sm sm:text-base"
              />
              <span className="min-w-0 truncate text-start">
                {locale === "ar"
                  ? category.nameAr || category.name
                  : category.name}
              </span>
            </button>
          </div>
        ))}
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
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
