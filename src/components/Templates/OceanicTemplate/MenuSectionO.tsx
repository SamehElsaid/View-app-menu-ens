"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CategoryTabs from './CategoryTabs';
import MenuItemO from './MenuItemO';
import ProductModalO from './ProductModalO';
import SearchBar from './SearchBar';
import { useLocale } from 'next-intl';
import { useAppSelector } from '@/store/hooks';


const MenuSectionO = () => {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [activeCategory, setActiveCategory] = useState('0');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSticky, setIsSticky] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);

  const menuItems = useAppSelector((state) => state.menu.menu) ?? [];
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
      { rootMargin: `-${HEADER_OFFSET}px 0px 0px 0px`, threshold: [0, 1] }
    );

    const bottomObserver = new IntersectionObserver(
      ([entry]) => {
        bottomPassed = entry.boundingClientRect.top < HEADER_OFFSET;
        update();
      },
      { rootMargin: `-${HEADER_OFFSET}px 0px 0px 0px`, threshold: [0, 1] }
    );

    topObserver.observe(topEl);
    bottomObserver.observe(bottomEl);

    return () => {
      topObserver.disconnect();
      bottomObserver.disconnect();
    };
  }, []);

  const filteredItems = useMemo(() => {
    let items = menuItems;
    if (activeCategory !== '0') {
      items = items.filter((item) => item.categoryId === Number(activeCategory));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter((item) =>
        item.nameAr?.toLowerCase().includes(q) ||
        item.nameEn?.toLowerCase().includes(q) ||
        item.name?.toLowerCase().includes(q)
      );
    }
    return items;
  }, [activeCategory, searchQuery, menuItems]);

  return (
    <section id="menu" className="py-24 px-4 relative bg-[#fdfdfd]">
      <div className="max-w-7xl mx-auto">
        
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
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
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </motion.div>

        <div ref={topSentinelRef} aria-hidden="true" className="h-px w-full" />

        {/* Category Tabs */}
        <div
          className={`transition-shadow duration-300 ease-out ${
            isSticky
              ? 'fixed top-[72px] sm:top-[80px] left-0 right-0 z-30 bg-white/95 backdrop-blur-xl py-3 px-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)] border-b border-cyan-100'
              : 'relative z-10 py-2'
          }`}
        >
          <div className="max-w-7xl mx-auto">
            <CategoryTabs
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </div>
        </div>

        {isSticky && <div aria-hidden="true" className="h-[72px]" />}

        {/* Menu Items Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 mt-12"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <MenuItemO
                    item={item}
                    index={index}
                    currency={currency}
                    onClick={setSelectedItem}
                  />
                </motion.div>
              ))
            ) : (
              <motion.div
                className="col-span-full text-center py-24 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-slate-400 text-xl font-arabic">
                  {isAr ? "عذراً، لم نجد ما تبحث عنه" : "Sorry, no treasures found here"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div ref={bottomSentinelRef} aria-hidden="true" className="h-px w-full" />
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