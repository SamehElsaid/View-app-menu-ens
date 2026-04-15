"use client";
import React, { useState } from "react";
import Image from "next/image";
import { MdOutlineRestaurantMenu, MdRestaurant } from "react-icons/md";
import { FiMenu, FiPhoneCall, FiX } from "react-icons/fi";
import { LanguageToggle } from "./LanguageToggle";
import { useLocale, useTranslations } from "next-intl";
import Drawer from "@/components/Global/Drawer";
import { useAppSelector } from "@/store/hooks";
import { Icon } from "../components/Icon";
import { useCategoryNav } from "./CategoryNavContext";
import { getCategoryIconName, type MenuCategoryLike } from "./categoryIconMap";

function NavBar({
  logo,
  menuName,
}: {
  logo: string | null;
  menuName: string | null;
}) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const { showCategoryBurger, activeCategory, setActiveCategory } =
    useCategoryNav();
  const [categoriesDrawerOpen, setCategoriesDrawerOpen] = useState(false);

  const storeCategories = useAppSelector((state) => state.menu.categories);
  const categories = storeCategories ?? [];

  const toggleCategoriesDrawer = () => {
    if (categories.length === 0) return;
    setCategoriesDrawerOpen((open) => !open);
  };

  const pickCategory = (id: number) => {
    setActiveCategory(id);
    setCategoriesDrawerOpen(false);
  };

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 flex w-full justify-center items-center py-6">
      <div className="w-[90%] max-w-4xl">
        {" "}
        <div className="bg-white/80 backdrop-blur-xl border border-purple-100 px-4 py-4 sm:px-8 rounded-full flex items-center justify-between shadow-lg shadow-purple-500/5 gap-2">
          <div className="flex min-w-0  items-center gap-2 text-(--bg-main) ">
            {(showCategoryBurger || categoriesDrawerOpen) &&
            categories.length > 0 ? (
              <button
                type="button"
                onClick={toggleCategoriesDrawer}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow-sm transition ${
                  categoriesDrawerOpen
                    ? "border-(--bg-main) bg-(--bg-main) text-white hover:bg-(--bg-main)/90"
                    : "border border-zinc-200 bg-white text-zinc-700 hover:border-(--bg-main) hover:text-(--bg-main)"
                }`}
                aria-label={
                  categoriesDrawerOpen ? t("closeCategories") : t("categories")
                }
                aria-expanded={categoriesDrawerOpen}
              >
                {categoriesDrawerOpen ? (
                  <FiX className="text-xl" strokeWidth={2.5} />
                ) : (
                  <FiMenu className="text-xl" />
                )}
              </button>
            ) : null}
            <div className="min-w-0 text-2xl font-black tracking-tighter flex items-center gap-2">
              {logo ? (
                <Image
                  src={logo}
                  alt={menuName || ""}
                  width={40}
                  height={40}
                  sizes="40px"
                  className="relative h-10 w-10 shrink-0 rounded-full object-contain transition-transform duration-300 group-hover:scale-110"
                  unoptimized
                />
              ) : (
                <>
                  <MdRestaurant className="relative shrink-0 text-3xl transition-transform duration-300 group-hover:scale-110" />
                  <span className="truncate text-2xl font-black tracking-tighter">
                    {menuName}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-4 text-xs font-bold text-zinc-600 sm:gap-8 sm:text-sm md:gap-8">
            <a
              href="#menu"
              className="hover:text-(--bg-main) flex items-center gap-1 transition-colors"
            >
              <MdOutlineRestaurantMenu className="text-base sm:text-lg" />
              <span>{t("menu")}</span>
            </a>

            <a
              href="#footer"
              className="hover:text-(--bg-main) flex items-center gap-1 transition-colors"
            >
              <FiPhoneCall className="text-base sm:text-lg" />
              <span>{t("contact")}</span>
            </a>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="bg-(--bg-main) text-white  rounded-full font-bold text-sm shadow-md shadow-purple-200">
              <LanguageToggle />
            </div>
          </div>
        </div>
      </div>

      {categories.length > 0 ? (
        <Drawer
          open={categoriesDrawerOpen}
          onClose={() => setCategoriesDrawerOpen(false)}
          title={t("categories")}
          right={locale === "ar"}
          length={categories.length}
        >
          <ul className="flex flex-col gap-2 px-4 pb-4">
            {categories.map((category) => (
              <li key={category.id}>
                <button
                  type="button"
                  onClick={() => pickCategory(category.id as number)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-start text-base font-bold transition ${
                    category.id === activeCategory
                      ? "border-(--bg-main) bg-(--bg-main)/10 text-(--bg-main)"
                      : "border-zinc-100 bg-white text-zinc-600 hover:border-(--bg-main)/40"
                  }`}
                >
                  <Icon
                    name={getCategoryIconName(category as MenuCategoryLike)}
                    className="text-xl"
                  />
                  <span className="flex-1 truncate">
                    {locale === "ar"
                      ? category.nameAr || category.name
                      : category.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t border-zinc-100 px-4 pb-8 pt-4">
            <button
              type="button"
              onClick={() => setCategoriesDrawerOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 py-3.5 text-base font-bold text-zinc-700 transition hover:border-(--bg-main) hover:bg-(--bg-main)/5 hover:text-(--bg-main)"
            >
              <FiX className="text-lg" strokeWidth={2.5} />
              {t("closeCategories")}
            </button>
          </div>
        </Drawer>
      ) : null}
    </nav>
  );
}

export default NavBar;
