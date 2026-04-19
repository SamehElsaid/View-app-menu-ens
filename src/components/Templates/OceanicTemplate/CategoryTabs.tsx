"use client";

import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { Category } from '@/types/menu';

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryTabs = ({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) => {
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

  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
      <div className="flex gap-2.5 md:gap-3 justify-start md:justify-center min-w-max px-4">
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
              onClick={() => onCategoryChange(category.id.toString())}
              className={`
                relative group whitespace-nowrap
                px-5 md:px-6 py-2.5 md:py-3 rounded-full
                text-sm md:text-[15px] font-semibold
                transition-all duration-300 ease-out
                ${isActive
                  ? 'bg-gradient-to-br from-cyan-700 via-cyan-600 to-sky-700 text-white shadow-[0_10px_28px_-6px_rgba(6,95,120,0.55)] ring-1 ring-white/30'
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
                  layoutId="oceanic-active-tab"
                  className="absolute inset-0 rounded-full ring-2 ring-cyan-400/40 ring-offset-2 ring-offset-white pointer-events-none"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryTabs;
