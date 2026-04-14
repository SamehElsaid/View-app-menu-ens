"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { MenuItem } from "@/types/menu";
import { useNoirTheme } from "./NoirThemeContext";
import { hexToRgba } from "./noirColorUtils";
import { NOIR_EASE, NOIR_EASE_TW_CLASS } from "./noirConstants";
import { resolveMenuItemImageSrc } from "@/lib/menuItemImage";

interface MenuCardProps {
  item: MenuItem;
  idx: number;
  onOpen: (item: MenuItem) => void;
  currency: string;
}

export default function MenuCard({
  item,
  idx,
  onOpen,
  currency,
}: MenuCardProps) {
  const locale = useLocale();
  const { primary } = useNoirTheme();
  const name = locale === "ar" ? item.nameAr : item.nameEn;
  const desc = locale === "ar" ? item.descriptionAr : item.descriptionEn;
  const catLabel = locale === "ar" ? item.categoryNameAr : item.categoryNameEn;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.55,
        delay: idx * 0.06,
        ease: NOIR_EASE,
      }}
      whileHover={{
        y: -4,
        boxShadow: `0 16px 48px rgba(0,0,0,0.5), 0 0 24px ${hexToRgba(primary, 0.2)}`,
        transition: { duration: 0.38, ease: NOIR_EASE },
      }}
      whileTap={{ scale: 0.995 }}
      className="group relative cursor-pointer overflow-hidden rounded-sm border border-violet/8 bg-glass backdrop-blur-lg shadow-[0_4px_24px_rgba(0,0,0,0.25)]"
      onClick={() => onOpen(item)}
    >
      <div className="relative h-[150px] overflow-hidden">
        <div
          className={`absolute inset-0 origin-bottom transition-transform duration-450 will-change-transform group-hover:scale-[1.05] ${NOIR_EASE_TW_CLASS}`}
        >
          <Image
            src={resolveMenuItemImageSrc(item.image)}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover saturate-[0.72] brightness-[0.9]"
          />
          <div
            className="pointer-events-none absolute inset-0 z-1"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.06) 38%, rgba(0,0,0,0.45) 78%, rgba(0,0,0,0.72) 100%), radial-gradient(120% 80% at 50% 0%, rgba(0,0,0,0.12), transparent 55%)",
            }}
          />
        </div>
        {item.discountPercent ? (
          <div className="absolute top-3 end-3 z-2 text-white text-xs tracking-[0.15em] uppercase py-0.5 px-2 rounded-xs bg-violet/90">
            {locale === "ar"
              ? `${item.discountPercent}٪ خصم`
              : `${item.discountPercent}% off`}
          </div>
        ) : null}
      </div>

      <div className="p-4">
        <p className="text-xs tracking-[0.3em] uppercase text-cyan mb-1">
          {catLabel}
        </p>
        <h3 className="font-display text-lg font-light leading-tight mb-1">
          {name}
        </h3>
        {desc && (
          <p className="text-xs text-text-secondary leading-relaxed mb-3 line-clamp-2">
            {desc}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="font-display text-lg font-light text-lavender">
            {currency} {item.price}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
