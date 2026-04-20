"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useLocale } from "next-intl";
import type { MenuItemOProps } from "@/types/types";

/** First letter uppercase, rest lowercase (Latin scripts; Arabic unchanged visually). */
function sentenceCaseName(raw: string | undefined | null): string {
  if (raw == null) return "";
  const t = raw.trim();
  if (!t) return "";
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

const MenuItemO = ({
  item,
  index,
  currency,
  onClick,
  isTableOrder,
  cartQuantity = 0,
  onAddToCart,
}: MenuItemOProps) => {
  const [cardPickQty, setCardPickQty] = useState(1);
  const locale = useLocale();
  const isAr = locale === "ar";
  const displayName = isAr ? item.nameAr : item.nameEn;
  const nameLabel = sentenceCaseName(displayName);
  const displayDesc = isAr
    ? (item.descriptionAr ?? item.description)
    : (item.descriptionEn ?? item.description);

  const hasDiscount = !!item.originalPrice && item.originalPrice > item.price;
  const savedAmount = hasDiscount
    ? (item.originalPrice as number) - item.price
    : 0;

  return (
    <div
      className="group relative cursor-pointer"
      onClick={() => onClick(item)}
    >
      <div className="bg-linear-to-br from-[#001a23] via-[#00222d] to-[#002b36] rounded-4xl overflow-hidden border border-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.3)] transition-[transform,box-shadow,border-color,filter] duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:-translate-y-1.5 group-hover:shadow-[0_22px_50px_-10px_rgba(8,145,178,0.34),0_10px_36px_rgba(0,0,0,0.24)] group-hover:border-cyan-400/32 active:brightness-[0.98] active:translate-y-0">
        <div className="relative w-full aspect-4/3 overflow-hidden bg-linear-to-br from-[#002433] via-[#002b3a] to-[#003544]">
          <div className="absolute inset-0 origin-center backface-hidden transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.035] motion-reduce:transition-none motion-reduce:group-hover:scale-100">
            <Image
              src={item.image}
              alt={nameLabel || displayName || "Menu Item"}
              fill
              priority={index < 4}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className="object-cover"
            />

            <div
              className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-[#001a23] to-transparent z-10 pointer-events-none"
              aria-hidden
            />
          </div>

          {/* Discount Badge */}
          {hasDiscount && (
            <motion.span
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: Math.min(index * 0.05, 0.25) + 0.08,
                type: "spring",
                stiffness: 220,
                damping: 26,
                mass: 0.65,
              }}
              className="absolute top-4 start-4 z-20 bg-linear-to-br from-rose-500 to-red-600 text-white text-[12px] font-extrabold px-3 py-1.5 rounded-full shadow-[0_8px_20px_rgba(244,63,94,0.45)] ring-2 ring-white/20"
            >
              -
              {item.discountPercent ??
                Math.round(
                  (savedAmount / (item.originalPrice as number)) * 100,
                )}
              %
            </motion.span>
          )}

          {/* Always-visible expand button */}
          <div className="absolute top-3 end-3 z-20">
            <motion.div
              className="bg-cyan-500/90 text-white p-2.5 rounded-full shadow-[0_4px_14px_rgba(6,182,212,0.45)] ring-1 ring-white/30 backdrop-blur-sm"
              whileHover={{
                scale: 1.06,
                transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
              }}
              whileTap={{ scale: 0.97, transition: { duration: 0.18 } }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-[18px] h-[18px]"
              >
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
            </motion.div>
          </div>
        </div>

        <div className="p-7 sm:p-8 text-center md:text-start">
          <div className="flex flex-col gap-2">
            <h3 className="text-base font-bold text-white transition-colors duration-500 ease-out group-hover:text-cyan-400 font-display text-balance wrap-break-word leading-snug">
              {nameLabel || displayName}
            </h3>

            <p className="text-cyan-100/60 text-sm line-clamp-1 leading-relaxed font-arabic transition-colors duration-500 ease-out group-hover:text-cyan-100/90 min-h-5">
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

          {isTableOrder && onAddToCart ? (
            <div
              className="mt-4 w-full space-y-2 border-t border-white/10 pt-4"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              role="presentation"
            >
              <div className="flex flex-wrap items-center justify-center gap-2 md:justify-between">
                <div className="flex items-center gap-1 rounded-2xl border border-white/15 bg-white/5 px-1 py-1 backdrop-blur-sm">
                  <button
                    type="button"
                    onClick={() => setCardPickQty((q) => Math.max(1, q - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-sm font-bold text-cyan-100 transition hover:bg-white/10"
                    aria-label={isAr ? "تقليل" : "Decrease"}
                  >
                    −
                  </button>
                  <span className="min-w-7 text-center text-sm font-black text-white">
                    {cardPickQty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCardPickQty((q) => q + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-sm font-bold text-cyan-100 transition hover:bg-white/10"
                    aria-label={isAr ? "زيادة" : "Increase"}
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onAddToCart(item, cardPickQty);
                    setCardPickQty(1);
                  }}
                  className="rounded-2xl bg-cyan-600 px-4 py-2 text-xs font-black text-white shadow-md transition hover:bg-cyan-500"
                >
                  {isAr ? "أضف للسلة" : "Add to cart"}
                </button>
              </div>
              {cartQuantity > 0 ? (
                <p className="text-center text-xs text-cyan-200/70">
                  {isAr
                    ? `في السلة: ${cartQuantity}`
                    : `In cart: ${cartQuantity}`}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between opacity-60 transition-opacity duration-500 ease-out group-hover:opacity-100">
            <span className="text-xs font-bold text-cyan-500 uppercase tracking-widest">
              {isAr ? "عرض التفاصيل" : "View Details"}
            </span>
            <div className="h-1 w-12 bg-cyan-900 rounded-full overflow-hidden">
              <div className="h-full w-0 bg-cyan-500 transition-[width] duration-500 ease-out delay-75 group-hover:w-full motion-reduce:transition-none motion-reduce:group-hover:w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemO;
