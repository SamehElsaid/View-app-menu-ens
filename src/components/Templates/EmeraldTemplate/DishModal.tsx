"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

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

export default function DishModal({ dish, onClose }: {dish: MenuItem | null, onClose: () => void}) {
  const locale = useLocale() as "ar" | "en";

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
          className="fixed inset-0 z-50 bg-[rgba(45,10,18,0.6)] backdrop-blur-[8px]"
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
          className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                     w-[calc(100%-1.5rem)] max-w-[480px] max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-[0_24px_80px_rgba(76,17,33,0.2),0_8px_24px_rgba(0,0,0,0.12)] flex flex-col"
        >
          <div className="relative h-52 md:h-56 flex-shrink-0 bg-[#fef1f5]">
            <Image
              src={dish.image}
              alt={locale === "ar" ? dish.nameAr : dish.nameEn}
              fill
              className="object-cover"
              sizes="560px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            <button
              onClick={onClose}
              className="absolute top-4 end-4 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center
                         text-stone-700 hover:bg-white transition-colors shadow-sm"
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
                className="absolute top-4 start-4 text-[11px] font-sans font-700 px-3 py-1 rounded-full
                           bg-[#4c1121] text-white tracking-wider uppercase shadow-sm"
              >
                {dish.discountPercent}% off
              </span>
            )}

            <div className="absolute bottom-4 end-4 bg-white/95 backdrop-blur rounded-full px-4 py-1.5 shadow">
              <span className="font-serif font-700 text-[#4c1121] text-xl">
                ${dish.price}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 md:p-6">
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="font-serif italic text-stone-900 text-lg md:text-2xl font-700 leading-tight mb-2 text-balance"
            >
              {locale === "ar" ? dish.nameAr : dish.nameEn}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="font-sans text-stone-500 text-sm leading-[1.6] mb-4"
            >
              {locale === "ar" ? dish.descriptionAr : dish.descriptionEn}
            </motion.p>

            <div className="w-10 h-0.5 bg-[#f5b0c4] rounded-full mb-4" />

           

            {dish.allergens && dish.allergens?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.4 }}
                className="mb-6"
              >
                <h3 className="font-sans text-xs font-700 uppercase tracking-[0.12em] text-amber-600 mb-3">
                  {locale === "ar" ? "المواد الحساسة للمرضى" : "Allergens"}
                </h3>
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

          <div className="px-5 py-3 md:p-5 border-t border-stone-50">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl border border-stone-200 font-sans font-600 text-stone-600
                         hover:bg-stone-50 transition-colors text-sm"
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
