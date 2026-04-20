"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import CategoryTabs from "./CategoryTabs";
import MenuItemO from "./MenuItemO";
import ProductModalO from "./ProductModalO";
import SearchBar from "./SearchBar";
import { useLocale } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import type { MenuItem } from "@/types/menu";
import {
  SKY_CART_UPDATED_EVENT,
  readSkyCartFromCookie,
  upsertSkyCartQuantityFromMenuItem,
  type SkyCartItem,
} from "@/lib/skyTemplateCart";
import { useTableCartAllowed } from "@/hooks/useTableCartAllowed";

const EMPTY_MENU: MenuItem[] = [];

const MenuSectionO = () => {
  const locale = useLocale();
  const isAr = locale === "ar";
  const searchParams = useSearchParams();
  const tableCartAllowed = useTableCartAllowed();
  const isTableOrder =
    Boolean(searchParams.get("table")?.trim()) && tableCartAllowed;
  const [activeCategory, setActiveCategory] = useState("0");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSticky, setIsSticky] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [cartById, setCartById] = useState<Record<number, SkyCartItem>>({});
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);

  const menuFromStore = useAppSelector((state) => state.menu.menu);
  const categories = useAppSelector((state) => state.menu.categories) ?? [];
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);
  const currency = menuInfo?.currency || "AED";

  useEffect(() => {
    const topEl = topSentinelRef.current;
    const bottomEl = bottomSentinelRef.current;
    if (!topEl || !bottomEl) return;

    const HEADER_OFFSET = 80;
    let topPassed = false;
    let bottomPassed = false;

    const update = () => {
      setIsSticky(topPassed && !bottomPassed);
    };

    const topObserver = new IntersectionObserver(
      ([entry]) => {
        topPassed = entry.boundingClientRect.top < HEADER_OFFSET;
        update();
      },
      { rootMargin: `-${HEADER_OFFSET}px 0px 0px 0px`, threshold: [0, 1] },
    );

    const bottomObserver = new IntersectionObserver(
      ([entry]) => {
        bottomPassed = entry.boundingClientRect.top < HEADER_OFFSET;
        update();
      },
      { rootMargin: `-${HEADER_OFFSET}px 0px 0px 0px`, threshold: [0, 1] },
    );

    topObserver.observe(topEl);
    bottomObserver.observe(bottomEl);

    return () => {
      topObserver.disconnect();
      bottomObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const sync = () => setCartById(readSkyCartFromCookie());
    sync();
    window.addEventListener(SKY_CART_UPDATED_EVENT, sync);
    return () => window.removeEventListener(SKY_CART_UPDATED_EVENT, sync);
  }, []);

  const handleAddToCart = (item: MenuItem, quantity: number) => {
    upsertSkyCartQuantityFromMenuItem(item, quantity);
    setCartById(readSkyCartFromCookie());
  };

  const filteredItems = useMemo(() => {
    let items = menuFromStore ?? EMPTY_MENU;
    if (activeCategory !== "0") {
      items = items.filter(
        (item) => item.categoryId === Number(activeCategory),
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.nameAr?.toLowerCase().includes(q) ||
          item.nameEn?.toLowerCase().includes(q) ||
          item.name?.toLowerCase().includes(q),
      );
    }
    return items;
  }, [activeCategory, searchQuery, menuFromStore]);

  return (
    <section id="menu" className="py-24 px-4 relative bg-[#fdfdfd]">
      <div className="max-w-screen-2xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-48px" }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-4xl md:text-6xl font-light text-[#001a23] mb-4 font-display tracking-tight">
            <span className="block font-bold opacity-20 text-sm md:text-base uppercase tracking-[0.3em] mb-2">
              {menuInfo?.name}
            </span>
            {isAr ? "المنيو" : "The Menu"}
          </h2>
          <div className="w-20 h-1 bg-cyan-600 mx-auto rounded-full opacity-30" />
        </motion.div>

        {/* Search Bar */}
        <motion.div
          className="mb-10 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.75, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
        >
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </motion.div>

        <div ref={topSentinelRef} aria-hidden="true" className="h-px w-full" />

        {/* Category Tabs — in-flow version (hidden while sticky floating is active) */}
        <div
          className={`relative z-10 py-3 sm:py-4 transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isSticky ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <div className="max-w-7xl mx-auto">
            <CategoryTabs
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              layoutIdPrefix="oceanic-inflow"
            />
          </div>
        </div>

        {/* Category Tabs — sticky floating version with smooth slide-in */}
        <AnimatePresence initial={false}>
          {isSticky && (
            <motion.div
              key="sticky-category-tabs"
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-[72px] sm:top-20 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl py-4 sm:py-5 px-2 sm:px-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)] border-b border-cyan-100"
            >
              <div className="max-w-7xl mx-auto">
                <CategoryTabs
                  categories={categories}
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
                  layoutIdPrefix="oceanic-sticky"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Menu Items Grid */}
        <motion.div
          layout
          transition={{ layout: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-7 gap-y-12 mt-12"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{
                    duration: 0.58,
                    delay: Math.min(index * 0.045, 0.32),
                    ease: [0.16, 1, 0.3, 1],
                    layout: { duration: 0.48, ease: [0.16, 1, 0.3, 1] },
                  }}
                >
                  <MenuItemO
                    item={item}
                    index={index}
                    currency={currency}
                    onClick={setSelectedItem}
                    isTableOrder={isTableOrder}
                    cartQuantity={cartById[item.id]?.quantity ?? 0}
                    onAddToCart={handleAddToCart}
                  />
                </motion.div>
              ))
            ) : (
              <motion.div
                className="col-span-full text-center py-24 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="text-slate-400 text-xl font-arabic">
                  {isAr
                    ? "عذراً، لم نجد ما تبحث عنه"
                    : "Sorry, no treasures found here"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div
          ref={bottomSentinelRef}
          aria-hidden="true"
          className="h-px w-full"
        />
      </div>

      <ProductModalO
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        currency={currency}
      />
    </section>
  );
};

export default MenuSectionO;
