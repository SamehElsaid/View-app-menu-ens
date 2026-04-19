"use client";

import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { Category } from '@/types/menu';

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  layoutIdPrefix?: string;
}

const CategoryTabs = ({ categories, activeCategory, onCategoryChange, layoutIdPrefix = 'oceanic' }: CategoryTabsProps) => {
  const locale = useLocale();
  const isAr = locale === 'ar';

  const allTab: Category = {
    id: 0,
    name: 'All',
    nameAr: 'الكل',
    nameEn: 'All',
    menuItems: [],
  } as Category;

  const tabs = [allTab, ...categories];

  const handleSelect = (id: string) => {
    onCategoryChange(id);
    if (typeof window === 'undefined') return;
    requestAnimationFrame(() => {
      const menuSection = document.getElementById('menu');
      // Offset = fixed header (~80) + sticky category bar (~88)
      const STICKY_OFFSET = 170;
      if (menuSection) {
        const top = menuSection.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: Math.max(0, top - STICKY_OFFSET), behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  };

  return (
    <div className="relative w-full">
      {/* Fade edges to hint horizontal scroll on mobile */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-6 md:w-8 bg-gradient-to-r from-white via-white/70 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-6 md:w-8 bg-gradient-to-l from-white via-white/70 to-transparent z-10" />

      <div className="oceanic-tabs-scroll w-full overflow-x-auto pb-3 md:pb-4 snap-x snap-mandatory scroll-smooth [-webkit-overflow-scrolling:touch]">
        <div className="flex gap-3 md:gap-3 justify-start md:justify-center min-w-max px-5 md:px-6 py-1">
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
                onClick={() => handleSelect(category.id.toString())}
                className={`
                  relative group whitespace-nowrap snap-start shrink-0
                  min-h-[44px] md:min-h-[48px]
                  px-6 md:px-7 py-3 md:py-3.5 rounded-full
                  text-[15px] md:text-[16px] font-semibold leading-tight
                  transition-all duration-300 ease-out
                  ${isActive
                    ? 'bg-gradient-to-br from-cyan-700 via-cyan-600 to-sky-700 text-white shadow-[0_8px_22px_-6px_rgba(6,95,120,0.55)] ring-1 ring-white/30'
                    : 'bg-cyan-50 text-cyan-900 border border-cyan-200 hover:border-cyan-400 hover:bg-cyan-100 shadow-sm hover:shadow-md'
                  }
                `}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.04, ease: 'easeOut' }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
              >
                <span className="relative z-10">{label}</span>

                {/* Active indicator glow */}
                {isActive && (
                  <motion.span
                    layoutId={`${layoutIdPrefix}-active-tab`}
                    className="absolute inset-0 rounded-full ring-2 ring-cyan-400/40 ring-offset-2 ring-offset-white pointer-events-none"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryTabs;
