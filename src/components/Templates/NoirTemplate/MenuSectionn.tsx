"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CategoryTabs from "./CategoryTabs";
import MenuCard from "./MenuCard";
import DetailModal from "./DetailModal";
import { useLocale } from "next-intl";
import { Category, MenuItem } from "@/types/menu";
import { NOIR_EASE } from "./noirConstants";

interface Props {
  items: MenuItem[];
  categories: Category[];
  currency: string;
}

export default function MenuSectionn({ items, categories, currency }: Props) {
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<number>(0);
  const locale = useLocale();

  const filteredItems =
    activeCategory === 0
      ? items
      : items.filter((dish) => dish.categoryId === activeCategory);

  return (
    <>
      <p className="text-sm tracking-[0.5em] uppercase text-violet mb-4">
        {locale === "ar" ? "— القائمة الكاملة —" : "— Full Menu —"}
      </p>
      <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-light leading-tight mb-12">
        <em className="italic text-lavender">
          {locale === "ar" ? "إبداعات" : "Chef's"}
        </em>{" "}
        <span>{locale === "ar" ? "الشيف" : "Creations"}</span>
      </h2>

      <CategoryTabs
        categories={categories}
        active={activeCategory}
        onChange={(id) => setActiveCategory(Number(id))}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory.toString()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: NOIR_EASE }}
          className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5"
        >
          {filteredItems.map((item: MenuItem, idx: number) => (
            <MenuCard
              key={item.id}
              item={item}
              idx={idx}
              onOpen={setSelectedDish}
              currency={currency}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {selectedDish && (
          <DetailModal
            key={selectedDish.id}
            item={selectedDish}
            onClose={() => setSelectedDish(null)}
            currency={currency}
          />
        )}
      </AnimatePresence>
    </>
  );
}
