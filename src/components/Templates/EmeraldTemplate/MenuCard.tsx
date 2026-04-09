"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";

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
  allergens?: string[];
}

interface PropsMenuCard {
  dish: MenuItem;
  index: number;
  onClick: (dish: MenuItem) => void;
  currency: string;
}



export default function MenuCard({ dish, index, onClick, currency }: PropsMenuCard) {
  const locale = useLocale();
  const badgeText = dish.discountPercent ? `${dish.discountPercent}% off` : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_20px_rgba(76,17,33,0.06),0_1px_4px_rgba(0,0,0,0.04)] cursor-pointer group transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.34,1.2,0.64,1)] hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(76,17,33,0.14),0_4px_12px_rgba(0,0,0,0.06)]"
      onClick={() => onClick(dish)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick(dish)}
      aria-label={locale === "ar" ? dish.nameAr : dish.nameEn}
    >
      <div className="relative h-52 overflow-hidden bg-[#fef1f5]">
        <Image
          src={dish.image}
          alt={locale === "ar" ? dish.nameAr : dish.nameEn}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.06]"
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAYAAAC09K7GAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMklEQVR4nGNgYGD4z8BQ/5+Bof4/A0P9fwaG+v8MDPX/GRjq/zMw1P9nYKj/z8BQ/x8AUEsHCEAAAAAAAAAAAAAAAAA="
        />
        {badgeText && (
          <span
            className={`absolute top-3 start-3 text-[11px] font-sans font-700 px-2.5 py-1 rounded-full tracking-wider uppercase bg-white/90 text-stone-700`}
          >
            {badgeText}
          </span>
        )}
        <div className="absolute bottom-3 end-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
          <span className="font-sans font-700 text-[#4c1121] text-sm">{currency} {dish.price}</span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-serif font-700 text-stone-900 text-lg leading-tight mb-2 group-hover:text-[#4c1121] transition-colors duration-200">
          {locale === "ar" ? dish.nameAr : dish.nameEn}
        </h3>
        <p className="font-sans text-stone-500 text-sm leading-relaxed line-clamp-2">
          {locale === "ar" ? dish.descriptionAr : dish.descriptionEn}
        </p>

        {dish.allergens && dish.allergens?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {dish.allergens?.map((a: string) => (
              <span
                key={a}
                className="text-[10px] font-sans font-500 text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full uppercase tracking-wide"
              >
                {a}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-50">
          <span className="font-sans text-xs text-[#7d1d35] font-600 tracking-wide uppercase">
            {locale === "ar" ? "عرض التفاصيل" : "View Details"}
          </span>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4c1121] to-[#9b2545] flex items-center justify-center shadow-[0_4px_20px_rgba(155,37,69,0.4)] group-hover:scale-110 transition-transform duration-200">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 6h8M7 3l3 3-3 3"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
