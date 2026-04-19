"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
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

interface ProductModalProps {
  item: MenuItemData | null;
  onClose: () => void;
  currency: string;
}

const ProductModalO = ({ item, onClose, currency }: ProductModalProps) => {
  const locale = useLocale();
  const isAr = locale === 'ar';

  useEffect(() => {
    if (item) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [item]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const displayName = item ? (isAr ? item.nameAr : item.nameEn) : "";
  const displayDesc = item ? (isAr ? (item.descriptionAr ?? item.description) : (item.descriptionEn ?? item.description)) : "";
  const hasDiscount = !!item?.originalPrice && (item.originalPrice as number) > item.price;
  const savedAmount = hasDiscount && item ? (item.originalPrice as number) - item.price : 0;
  const discountPct = item?.discountPercent
    ?? (hasDiscount && item ? Math.round((savedAmount / (item.originalPrice as number)) * 100) : 0);

  return (
    <AnimatePresence>
      {item && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[#001a23]/85 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="oceanic-modal-scroll fixed z-[70] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                       w-[95%] max-w-[520px] max-h-[92vh] overflow-y-auto rounded-[2.5rem]
                       bg-gradient-to-b from-[#002b36] via-[#00222d] to-[#001a23]
                       border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.6)]"
          >
            {/* Header Image Section */}
            <div className=" relative w-full aspect-[4/3] md:aspect-[16/10] overflow-hidden bg-gradient-to-br from-[#002433] via-[#002b3a] to-[#003544]">
              <Image
                src={item.image}
                alt={displayName}
                fill
                sizes="(max-width: 520px) 95vw, 520px"
                className="object-contain p-4"
                priority
              />
              {/* Gradient Overlay (bottom only, lighter to keep image visible) */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#001a23] to-transparent pointer-events-none" />

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.08, rotate: 90 }}
                whileTap={{ scale: 0.92 }}
                onClick={onClose}
                className={`absolute top-5 ${isAr ? 'left-5' : 'right-5'} z-30 w-11 h-11
                           bg-black/30 backdrop-blur-xl border border-white/15 rounded-full
                           flex items-center justify-center text-white hover:bg-white/20 transition-colors`}
              >
                <FiX className="w-5 h-5" />
              </motion.button>

              {/* Discount Tag */}
              {hasDiscount && (
                <motion.div
                  initial={{ scale: 0, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 300 }}
                  className="absolute top-5 start-5 z-20 bg-gradient-to-br from-rose-500 to-red-600 text-white text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow-[0_10px_25px_rgba(244,63,94,0.5)] ring-2 ring-white/20"
                >
                  -{discountPct}%
                </motion.div>
              )}
            </div>

            {/* Content Section */}
            <div className="p-7 md:p-8 text-center md:text-start">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 font-display">
                  {displayName}
                </h2>

                <p className="text-cyan-100/70 text-sm md:text-base leading-relaxed mb-6 font-arabic">
                  {displayDesc}
                </p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-8 p-4 md:p-5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm"
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <span className="text-[11px] uppercase tracking-widest text-cyan-300/60 font-bold">
                      {isAr ? "السعر" : "Price"}
                    </span>
                    <div className="flex items-baseline justify-center gap-2">
                      {hasDiscount && (
                        <span className="text-white/40 line-through text-lg font-bold">
                          {item.originalPrice}
                        </span>
                      )}
                      <span className="text-cyan-400 font-extrabold text-3xl font-display leading-none">
                        {item.price}
                      </span>
                      <span className="text-cyan-500/70 text-xs font-bold uppercase tracking-wider">
                        {currency}
                      </span>
                    </div>
                  </div>

                  {hasDiscount && (
                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-center gap-3">
                      <span className="text-sm text-emerald-300/90 font-semibold">
                        {isAr ? "وفّرت" : "You save"}
                      </span>
                      <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-extrabold px-3.5 py-1.5 rounded-full">
                        {savedAmount} {currency}
                      </span>
                    </div>
                  )}
                </motion.div>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                onClick={onClose}
                className="w-full group flex items-center justify-center gap-3 py-3.5 rounded-2xl
                           bg-white/5 border border-white/10 text-white font-bold
                           hover:bg-cyan-500 hover:border-cyan-400 hover:shadow-[0_10px_30px_rgba(6,182,212,0.35)] transition-all duration-300"
              >
                <span>{isAr ? "العودة للقائمة" : "Back to Menu"}</span>
                {isAr ? <FiArrowLeft className="group-hover:-translate-x-2 transition-transform"/> : <FiArrowRight className="group-hover:translate-x-2 transition-transform"/>}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductModalO;