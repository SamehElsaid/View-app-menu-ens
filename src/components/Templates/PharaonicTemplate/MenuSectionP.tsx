"use client";

import { useEffect, useState } from "react";
import { useIsOrderingEnabled } from "@/hooks/useIsOrderingEnabled";
import type { Category, MenuItem } from "@/types/menu";
import { useCurrencyLabel } from "@/lib/useCurrencyLabel";
import { LotusDivider } from "./PharaonicDecor";
import {
  subscribeSkyCartUpdated,
  readSkyCartFromCookie,
  upsertSkyCartQuantityFromMenuItem,
  type SkyCartItem,
} from "@/lib/skyTemplateCart";
import { useTrackMenuItemClick } from "@/hooks/useTrackMenuItemClick";
import { pharaonicHaptic } from "./usePharaonicTouchDevice";
import PharaonicCategoryTabs from "./PharaonicCategoryTabs";
import PharaonicMenuCard from "./PharaonicMenuCard";
import PharaonicDetailModal from "./PharaonicDetailModal";

export default function MenuSectionP({
  items,
  categories,
  currency,
}: {
  items: MenuItem[];
  categories: Category[];
  currency: string;
}) {
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const { openItem } = useTrackMenuItemClick();
  const [activeCategory, setActiveCategory] = useState(0);
  const [cartById, setCartById] = useState<Record<number, SkyCartItem>>({});
  const { isOrderingEnabled: isTableOrder } = useIsOrderingEnabled();
  const currencyLabel = useCurrencyLabel()(currency);

  useEffect(() => {
    const sync = () => setCartById(readSkyCartFromCookie());
    sync();
    return subscribeSkyCartUpdated(sync);
  }, []);

  const filteredItems =
    activeCategory === 0
      ? items
      : items.filter((dish) => dish.categoryId === activeCategory);

  return (
    <>
      {/* <p
        className="mb-3 text-xs tracking-[0.45em] uppercase"
        style={{ color: primary, fontFamily: displayFont }}
      >
        {locale === "ar" ? "— القائمة الملكية —" : "— Royal Menu —"}
      </p>
      <h3
        className="mb-2 text-2xl font-semibold text-[#f5e6c8] sm:text-3xl"
        style={{ fontFamily: displayFont }}
      >
        {locale === "ar" ? "أطباق الملكية " : "Treasures of the Nile"}
      </h3>
      <p className="mb-4 text-xs tracking-[0.28em] uppercase text-[#8a7d68]/90">
        {locale === "ar"
          ? "كل طبق يحمل قصة مخفية"
          : "Each dish holds a hidden story"}
      </p> */}
      <LotusDivider className="mb-10" />

      <PharaonicCategoryTabs
        categories={categories}
        active={activeCategory}
        onChange={(id) => {
          if (
            typeof window !== "undefined" &&
            window.matchMedia("(pointer: coarse)").matches
          ) {
            pharaonicHaptic(6);
          }
          setActiveCategory(Number(id));
        }}
      />

      <div
        key={activeCategory}
        className={`ph-menu-grid grid grid-cols-1 gap-5 animate-fade-in motion-reduce:animate-none sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:gap-7 ${
          isTableOrder ? "max-md:pb-28" : ""
        }`}
      >
        {filteredItems.map((item, idx) => (
          <PharaonicMenuCard
            key={item.id}
            item={item}
            idx={idx}
            onOpen={(item) => openItem(item, setSelectedDish)}
            currencyLabel={currencyLabel}
            isTableOrder={isTableOrder}
            cartQuantity={cartById[item.id]?.quantity ?? 0}
            onAddToCart={(item, qty) => {
              upsertSkyCartQuantityFromMenuItem(item, qty);
              setCartById(readSkyCartFromCookie());
            }}
          />
        ))}
      </div>

      {selectedDish ? (
        <PharaonicDetailModal
          key={selectedDish.id}
          item={selectedDish}
          onClose={() => setSelectedDish(null)}
          currencyLabel={currencyLabel}
        />
      ) : null}
    </>
  );
}
