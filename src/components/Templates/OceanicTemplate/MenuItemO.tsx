"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useLocale } from 'next-intl';

interface MenuItemData {
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

interface MenuItemProps {
  item: MenuItemData;
  index: number;
  currency: string;
  onClick: (item: MenuItemData) => void;
}

const MenuItemO = ({ item, index, currency, onClick }: MenuItemProps) => {
  const locale = useLocale();
  const isAr = locale === "ar";
  const displayName = isAr ? item.nameAr : item.nameEn;
  const displayDesc = isAr ? (item.descriptionAr ?? item.description) : (item.descriptionEn ?? item.description);

  const hasDiscount =
    !!item.originalPrice && item.originalPrice > item.price;
  const savedAmount = hasDiscount ? (item.originalPrice as number) - item.price : 0;

  return (
    <motion.div
      className="group relative bg-gradient-to-br from-[#001a23] via-[#00222d] to-[#002b36] rounded-[2rem] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_24px_60px_rgba(8,145,178,0.35)] transition-all duration-500 cursor-pointer border border-white/5 hover:border-cyan-400/30"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      layout
      onClick={() => onClick(item)}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#002433] via-[#002b3a] to-[#003544]">
        <Image
          src={item.image}
          alt={displayName || "Menu Item"}
          fill
          priority={index < 4}
          sizes="(max-w-7xl) 25vw, (max-w-sm) 100vw, 50vw"
          className="object-contain p-3 transition-transform duration-700 ease-out group-hover:scale-105 "
        />

        {/* Shadow Overlay (bottom only, lighter to keep image visible) */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#001a23] to-transparent z-10 pointer-events-none" />

        {/* Discount Badge */}
        {hasDiscount && (
          <motion.span
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 300 }}
            className="absolute top-4 start-4 z-20 bg-gradient-to-br from-rose-500 to-red-600 text-white text-[12px] font-extrabold px-3 py-1.5 rounded-full shadow-[0_8px_20px_rgba(244,63,94,0.45)] ring-2 ring-white/20"
          >
            -{item.discountPercent ?? Math.round((savedAmount / (item.originalPrice as number)) * 100)}%
          </motion.span>
        )}

        {/* Always-visible expand button */}
        <div className="absolute top-3 end-3 z-20">
          <motion.div
            className="bg-cyan-500/90 text-white p-2.5 rounded-full shadow-[0_4px_14px_rgba(6,182,212,0.45)] ring-1 ring-white/30 backdrop-blur-sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
          </motion.div>
        </div>
      </div>

      <div className="p-6 text-center md:text-start">
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors duration-300 font-display line-clamp-1">
            {displayName}
          </h3>

          <p className="text-cyan-100/60 text-sm line-clamp-1 leading-relaxed font-arabic group-hover:text-cyan-100/90 transition-colors min-h-[1.25rem]">
            {displayDesc}
          </p>
        </div>

        <div className="mt-4 flex flex-col items-center gap-2">
          <div className="flex items-baseline justify-center gap-2">
            {hasDiscount && (
              <span className="text-white/40 line-through text-sm font-medium">
                {item.originalPrice}
              </span>
            )}
            <span className="text-cyan-400 font-extrabold text-2xl leading-none font-display">
              {item.price}
            </span>
            <span className="text-cyan-500/70 text-[11px] font-bold uppercase tracking-widest">
              {currency}
            </span>
          </div>

          
        </div>

        <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between opacity-50 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
          <span className="text-xs font-bold text-cyan-500 uppercase tracking-widest">
            {isAr ? "عرض التفاصيل" : "View Details"}
          </span>
          <div className="h-1 w-12 bg-cyan-900 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 w-0 group-hover:w-full transition-all duration-700 delay-100" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MenuItemO;