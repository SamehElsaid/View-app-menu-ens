"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiX } from "react-icons/fi";
import MenuItemO from "./MenuItemO";
import ProductModalO from "./ProductModalO";
import { useLocale } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import type { MenuItem, Category } from "@/types/menu";
import type { CategoryTabsProps } from "@/types/types";
import {
  SKY_CART_UPDATED_EVENT,
  readSkyCartFromCookie,
  upsertSkyCartQuantityFromMenuItem,
  type SkyCartItem,
} from "@/lib/skyTemplateCart";
import { useTableCartAllowed } from "@/hooks/useTableCartAllowed";

const SEARCH_MIN_CHARS = 3;

function OceanicCategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
  layoutIdPrefix = "oceanic",
}: CategoryTabsProps) {
  const locale = useLocale();
  const isAr = locale === "ar";

  const allTab: Category = {
    id: 0,
    name: "All",
    nameAr: "الكل",
    nameEn: "All",
    menuItems: [],
  } as Category;

  const tabs = [allTab, ...categories];

  const handleSelect = (id: string) => {
    onCategoryChange(id);
    if (typeof window === "undefined") return;
    requestAnimationFrame(() => {
      const menuSection = document.getElementById("menu");
      const STICKY_OFFSET = 170;
      if (menuSection) {
        const top = menuSection.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: Math.max(0, top - STICKY_OFFSET),
          behavior: "smooth",
        });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-linear-to-r from-white via-white/70 to-transparent md:w-8" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-linear-to-l from-white via-white/70 to-transparent md:w-8" />

      <div className="oceanic-tabs-scroll w-full snap-x snap-mandatory overflow-x-auto scroll-smooth pb-3 md:pb-4 [-webkit-overflow-scrolling:touch]">
        <div className="flex min-w-max justify-start gap-3 px-5 py-1 md:justify-center md:gap-3 md:px-6">
          {tabs.map((category, index) => {
            const isActive = activeCategory === category.id.toString();
            const label =
              (isAr ? category.nameAr : category.nameEn) ||
              category.name ||
              (isAr ? category.nameEn : category.nameAr) ||
              `#${category.id}`;

            return (
              <motion.button
                key={category.id}
                type="button"
                onClick={() => handleSelect(category.id.toString())}
                className={`
                  relative group shrink-0 snap-start whitespace-nowrap
                  min-h-11 md:min-h-[48px]
                  px-6 py-3 md:px-7 md:py-3.5 rounded-full
                  text-[15px] md:text-md font-semibold leading-tight
                  transition-[transform,box-shadow,background-color,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
                  ${
                    isActive
                      ? "bg-linear-to-br from-cyan-700 via-cyan-600 to-sky-700 text-white shadow-[0_8px_22px_-6px_rgba(6,95,120,0.55)] ring-1 ring-white/30"
                      : "border border-cyan-200 bg-cyan-50 text-cyan-900 shadow-sm hover:border-cyan-400 hover:bg-cyan-100 hover:shadow-md"
                  }
                `}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.52,
                  delay: Math.min(index * 0.035, 0.28),
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{
                  y: -1,
                  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                }}
                whileTap={{ scale: 0.98, transition: { duration: 0.15 } }}
              >
                <span className="relative z-10">{label}</span>

                {isActive && (
                  <motion.span
                    layoutId={`${layoutIdPrefix}-active-tab`}
                    className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-cyan-400/40 ring-offset-2 ring-offset-white"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function OceanicSearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const locale = useLocale();
  const isAr = locale === "ar";

  const [localValue, setLocalValue] = useState(value);
  const isTypingRef = useRef(false);

  useEffect(() => {
    if (isTypingRef.current) return;
    queueMicrotask(() => {
      setLocalValue((prev) => (prev === value ? prev : value));
    });
  }, [value]);

  useEffect(() => {
    if (!isTypingRef.current) return;
    const trimmed = localValue.trim();
    if (trimmed.length === 0) {
      onChange("");
      isTypingRef.current = false;
      return;
    }
    if (trimmed.length < SEARCH_MIN_CHARS) return;
    onChange(localValue);
    isTypingRef.current = false;
  }, [localValue, onChange]);

  const handleChange = (next: string) => {
    isTypingRef.current = true;
    setLocalValue(next);
  };

  const handleClear = () => {
    isTypingRef.current = false;
    setLocalValue("");
    onChange("");
  };

  return (
    <motion.div
      className="relative mx-auto max-w-lg px-2"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="group relative">
        <div
          className={`absolute top-1/2 z-10 -translate-y-1/2 transition-colors duration-300 ${isAr ? "right-5" : "left-5"}`}
        >
          <FiSearch
            className={`h-5 w-5 ${localValue ? "text-cyan-600" : "text-slate-400"} group-focus-within:text-cyan-500`}
          />
        </div>

        <input
          type="search"
          placeholder={
            isAr ? "ابحث عن طبقك المفضل..." : "Search for your favorite dish..."
          }
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          className={`
            h-14 w-full rounded-full
            border-2 border-white/50 bg-white/40 backdrop-blur-xl
            ${isAr ? "pr-14 pl-12" : "pl-14 pr-12"}
            text-lg font-medium text-[#001a23]
            shadow-[0_8px_30px_rgb(0,0,0,0.04)]
            placeholder:italic placeholder:text-slate-400
            transition-all duration-300
            focus:border-cyan-500/30 focus:bg-white/80 focus:outline-none focus:ring-4 focus:ring-cyan-500/10
            font-arabic
          `}
        />

        <AnimatePresence>
          {localValue ? (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.5, x: isAr ? 10 : -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              onClick={handleClear}
              className={`
                absolute top-1/2 -translate-y-1/2
                ${isAr ? "left-4" : "right-4"}
                flex h-8 w-8 items-center justify-center rounded-full bg-slate-200/50 backdrop-blur-sm
                transition-all duration-200 group
                hover:bg-red-50 hover:text-red-500
              `}
              aria-label={isAr ? "مسح" : "Clear"}
            >
              <FiX className="h-4 w-4 transition-transform group-hover:rotate-90" />
            </motion.button>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="absolute -bottom-2 left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent blur-sm" />
    </motion.div>
  );
}

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
          <OceanicSearchBar value={searchQuery} onChange={setSearchQuery} />
        </motion.div>

        <div ref={topSentinelRef} aria-hidden="true" className="h-px w-full" />

        {/* Category Tabs — in-flow version (hidden while sticky floating is active) */}
        <div
          className={`relative z-10 py-3 sm:py-4 transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isSticky ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <div className="max-w-7xl mx-auto">
            <OceanicCategoryTabs
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
                <OceanicCategoryTabs
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
