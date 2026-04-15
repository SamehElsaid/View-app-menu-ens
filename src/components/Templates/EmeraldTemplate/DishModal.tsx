"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
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
  ingredients?: string[];
  allergens?: string[];
}

export default function DishModal({
  dish,
  onClose,
  currency,
}: {
  dish: MenuItem | null;
  onClose: () => void;
  currency: string;
}) {
  const locale = useLocale() as "ar" | "en";
  const { primary, secondary } = useEmeraldTheme();

  useEffect(() => {
    if (dish) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [dish]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const backdrop = hexToRgba(primary, 0.45);
  const modalShadow = `0 24px 80px ${hexToRgba(primary, 0.2)}, 0 8px 24px rgba(0,0,0,0.12)`;
  const imageBg = hexToRgba(primary, 0.06);
  const divider = hexToRgba(secondary, 0.55);

  return (
    <AnimatePresence>
      {dish && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 backdrop-blur-sm"
            style={{ backgroundColor: backdrop }}
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            key="modal"
            role="dialog"
            aria-modal="true"
            aria-label={locale === "ar" ? dish.nameAr : dish.nameEn}
            initial={{ opacity: 0, scale: 0.88, y: 32 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-1rem)] max-w-[600px] max-h-[90vh] md:max-h-none bg-white rounded-3xl overflow-hidden flex flex-col"
            style={{ boxShadow: modalShadow }}
          >
            <div
              className="relative aspect-[4/3] shrink-0"
              style={{ backgroundColor: imageBg }}
            >
              <Image
                src={resolveMenuItemImageSrc(dish.image)}
                alt={locale === "ar" ? dish.nameAr : dish.nameEn}
                fill
                className="object-cover"
                sizes="560px"
                priority
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />

              <button
                onClick={onClose}
                className="absolute top-3 end-3 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-stone-700 hover:bg-white hover:scale-105 transition-all shadow-md"
                aria-label="Close"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M4 4l8 8M12 4l-8 8"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              {dish.discountPercent && (
                <span
                  className="absolute top-3 start-3 text-[11px] font-sans font-700 px-3.5 py-1.5 rounded-full text-white tracking-wider uppercase shadow-md"
                  style={{ backgroundColor: primary }}
                >
                  {dish.discountPercent}% off
                </span>
              )}

              <div className="absolute bottom-4 end-4 bg-white/95 backdrop-blur-md rounded-2xl px-5 py-3 shadow-lg flex items-center gap-3">
                {dish.originalPrice && (
                  <span className="font-sans font-600 text-lg text-stone-400 line-through tabular-nums">
                    {dish.originalPrice} {currency}
                  </span>
                )}
                <span
                  className="font-sans font-800 text-3xl tracking-tight tabular-nums"
                  style={{ color: primary }}
                >
                  {dish.price}
                </span>
                <span
                  className="font-sans font-600 text-sm opacity-70"
                  style={{ color: primary }}
                >
                  {currency}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto md:overflow-y-visible px-6 py-5 md:px-7 md:py-6">
              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="font-serif italic text-stone-900 text-xl md:text-2xl font-700 leading-tight mb-3 text-balance"
              >
                {locale === "ar" ? dish.nameAr : dish.nameEn}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="font-sans text-stone-500 text-sm leading-[1.7] mb-5"
              >
                {locale === "ar" ? dish.descriptionAr : dish.descriptionEn}
              </motion.p>

              <div
                className="w-10 h-0.5 rounded-full mb-4"
                style={{ backgroundColor: divider }}
              />

              {dish.allergens && dish.allergens?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                  className="mb-6"
                >
                  <div className="flex flex-wrap gap-2">
                    {dish.allergens?.map((a: string) => (
                      <span
                        key={a}
                        className="font-sans text-sm font-500 text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            <div className="px-6 py-4 md:px-7 md:py-5 border-t border-stone-100">
              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl border border-stone-200 font-sans font-600 text-stone-600 hover:bg-stone-50 hover:border-stone-300 transition-all text-sm"
              >
                {locale === "ar" ? "العودة إلى القائمة" : "Back to Menu"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
