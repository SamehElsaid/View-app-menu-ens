"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CategoryTabs from "./CategoryTabs";
import MenuCard from "./MenuCard";
import DishModal from "./DishModal";
import { useLocale } from "next-intl";
import { Category } from "@/types/menu";


interface MenuItem {
  id: number;
  name: string;
  nameAr: string;
  nameEn: string;
  price: number;
  originalPrice: number | null;
  discountPercent: number | null;
  description: string | null;
  descriptionAr: string | null;
  descriptionEn: string | null;
  image: string;
  categoryId: number;
  categoryName: string;
  categoryNameAr: string;
  categoryNameEn: string;
  available: boolean;
  sortOrder: number;
}

export default function MenuSection({items, categories, currency }: {items: MenuItem[], categories: Category[], currency: string}) {
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<number>(0);
  const locale = useLocale();

  const filteredItems = activeCategory === 0 
  ? items 
  : items.filter(dish => dish.categoryId === activeCategory);
  return (
    <>
    <div className="mb-10">
      <p className="font-sans text-xs font-600 tracking-[0.18em] uppercase text-[#9b2545] mb-3">
        {locale === "ar" ? "القائمة" : "Menu"}
      </p>
      <h2
        id="menu-heading"
        className="font-serif italic text-stone-900 text-[clamp(2rem,4vw,3rem)] leading-tight tracking-tight"
      >
        {locale === "ar" ? "القائمة" : "Menu"}
      </h2>
    </div>

    <div className="hidden md:block mb-12">
      <CategoryTabs
        categories={categories}
        active={activeCategory}
        onChange={(id) => setActiveCategory(Number(id))}
      />
    </div>

    <AnimatePresence mode="wait">
      <motion.p
        key={activeCategory.toString() + "-count"}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="font-sans text-sm text-stone-400 mb-8 font-500"
      >
       {filteredItems.length} {filteredItems.length === 1 ? locale === "ar" ? "طبق" : "dish" : locale === "ar" ? "اطباق" : "dishes"}
          {activeCategory !== 0 && (
          <>
            {" "}
            in{" "}
            <span className="text-[#7d1d35]">
            {locale === "ar" 
                  ? categories.find((c) => c.id === activeCategory)?.nameAr 
                  : categories.find((c) => c.id === activeCategory)?.nameEn}
              </span>
          </>
        )}
      </motion.p>
    </AnimatePresence>

    <AnimatePresence mode="wait">
      <motion.div
        key={activeCategory.toString()}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8"
      >
       {filteredItems.map((dish: MenuItem, i: number) => (
            <MenuCard key={dish.id} dish={dish} index={i} onClick={setSelectedDish} currency={currency} />
          ))}
      </motion.div>
    </AnimatePresence>

    <DishModal dish={selectedDish} onClose={() => setSelectedDish(null)} currency={currency} />
  </>
  );
}
