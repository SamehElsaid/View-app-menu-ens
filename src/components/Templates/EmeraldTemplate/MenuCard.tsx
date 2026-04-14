"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { useEmeraldTheme } from "./EmeraldThemeContext";
import { hexToRgba } from "./emeraldThemeUtils";
import { resolveMenuItemImageSrc } from "@/lib/menuItemImage";

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

export default function MenuCard({
  dish,
  index,
  onClick,
  currency,
}: PropsMenuCard) {
  const locale = useLocale();
  const { primary, secondary } = useEmeraldTheme();
  const badgeText = dish.discountPercent
    ? `${dish.discountPercent}% off`
    : null;

  const cardShadow = `0 2px 20px ${hexToRgba(primary, 0.06)}, 0 1px 4px rgba(0,0,0,0.04)`;
  const cardHoverShadow = `0 16px 48px ${hexToRgba(primary, 0.14)}, 0 4px 12px rgba(0,0,0,0.06)`;
  const iconShadow = `0 4px 20px ${hexToRgba(primary, 0.4)}`;
  const imageBg = hexToRgba(primary, 0.06);
  const imageSrc = resolveMenuItemImageSrc(dish.image);

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.07,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="bg-white rounded-2xl overflow-hidden cursor-pointer group transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.34,1.2,0.64,1)] hover:-translate-y-1"
      style={
        {
          boxShadow: cardShadow,
          "--em-p": primary,
        } as React.CSSProperties
      }
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = cardHoverShadow;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = cardShadow;
      }}
      onClick={() => onClick(dish)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick(dish)}
      aria-label={locale === "ar" ? dish.nameAr : dish.nameEn}
    >
      <div
        className="relative h-52 overflow-hidden"
        style={{ backgroundColor: imageBg }}
      >
        <Image
          src={imageSrc}
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
          <span
            className="font-sans font-700 text-sm"
            style={{ color: primary }}
          >
            {currency} {dish.price}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-serif font-700 text-stone-900 text-lg leading-tight mb-2 transition-colors duration-200 group-hover:text-[var(--em-p)]">
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
          <span
            className="font-sans text-xs font-600 tracking-wide uppercase"
            style={{ color: secondary }}
          >
            {locale === "ar" ? "عرض التفاصيل" : "View Details"}
          </span>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
            style={{
              background: `linear-gradient(to bottom right, ${primary}, ${secondary})`,
              boxShadow: iconShadow,
            }}
          >
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
