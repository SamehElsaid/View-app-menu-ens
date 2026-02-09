"use client";

import { useMemo, useState } from "react";
import { MenuItem } from "@/types/menu";
import { useLocale, useTranslations } from "next-intl";

import { MenuCardDefault } from "./MenuCardDefault";
import SwiperCategory from "../components/SwiperCategory";
import { useAppSelector } from "@/store/hooks";
import { Icon } from "../components/Icon";

interface Category {
  id: number;
  name: string;
  nameAr?: string;
  icon?: string;
  image?: string | null;
}

const categoryIcons: Record<string, string> = {
  all: "grid-line",
  appetizers: "bowl-line",
  مقبلات: "bowl-line",
  mains: "restaurant-line",
  "أطباق رئيسية": "restaurant-line",
  drinks: "cup-line",
  مشروبات: "cup-line",
  desserts: "cake-3-line",
  حلويات: "cake-3-line",
};

const GetCategoryIcon = (category: Category) => {
  if (category?.icon === "grid-line") {
    return categoryIcons.all;
  }
  return categoryIcons[category.name.toLowerCase()] || "restaurant-line";
};

export default function MenuSection({ currency }: { currency: string }) {
  const locale = useLocale();
  const t = useTranslations("menu");
  const [activeCategory, setActiveCategory] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(0);

  const storeMenuItems = useAppSelector((state) => state.menu.menu);
  const storeCategories = useAppSelector((state) => state.menu.categories);

  const menuItems = useMemo(() => storeMenuItems ?? [], [storeMenuItems]);

  const categories = useMemo(
    () => [...(storeCategories ?? [])],
    [storeCategories],
  );

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
      className={`max-w-7xl mx-auto relative ${isModalOpen ? "z-11111111111" : "z-10"} mt-36`}
    >
      <div className="text-center mb-20">
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
        categories={categories as Category[]}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      >
        <div className="flex flex-wrap justify-center gap-4 py-2">
          {categories.map((category) => (
            <button
              key={category.id.toString()}
              onClick={() => setActiveCategory(category.id as number)}
              className={`px-10 py-4 rounded-2xl text-sm font-black transition-all duration-300 shadow-sm ${
                category.id === activeCategory
                  ? "bg-(--bg-main) text-white shadow-(--bg-main)"
                  : "bg-white text-zinc-500 border border-zinc-100 hover:border-(--bg-main) hover:text-(--bg-main)"
              } `}
            >
              <Icon
                name={GetCategoryIcon(category as Category)}
                className="text-sm sm:text-base"
              />
              <span className="ms-1">
                {locale === "ar"
                  ? category.nameAr || category.name
                  : category.name}
              </span>
            </button>
          ))}
        </div>
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
