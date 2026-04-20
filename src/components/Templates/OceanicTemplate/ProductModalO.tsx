"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import type { MenuItem } from '@/types/menu';
import {
  SKY_CART_UPDATED_EVENT,
  readSkyCartFromCookie,
  upsertSkyCartQuantityFromMenuItem,
} from '@/lib/skyTemplateCart';
import { useTableCartAllowed } from '@/hooks/useTableCartAllowed';

interface ProductModalProps {
  item: MenuItem | null;
  onClose: () => void;
  currency: string;
}

function ProductModalContent({
  item,
  onClose,
  currency,
}: {
  item: MenuItem;
  onClose: () => void;
  currency: string;
}) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const searchParams = useSearchParams();
  const tableCartAllowed = useTableCartAllowed();
  const isTableOrder =
    Boolean(searchParams.get('table')?.trim()) && tableCartAllowed;
  const [selectedQty, setSelectedQty] = useState(1);
  const [inCartQty, setInCartQty] = useState(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    const sync = () => {
      const c = readSkyCartFromCookie();
      setInCartQty(c[item.id]?.quantity ?? 0);
    };
    sync();
    window.addEventListener(SKY_CART_UPDATED_EVENT, sync);
    return () => window.removeEventListener(SKY_CART_UPDATED_EVENT, sync);
  }, [item.id]);

  const displayName = isAr ? item.nameAr : item.nameEn;
  const displayDesc = isAr
    ? (item.descriptionAr ?? item.description)
    : (item.descriptionEn ?? item.description);
  const hasDiscount =
    !!item.originalPrice && (item.originalPrice as number) > item.price;
  const savedAmount = hasDiscount
    ? (item.originalPrice as number) - item.price
    : 0;
  const discountPct =
    item.discountPercent ??
    (hasDiscount
      ? Math.round((savedAmount / (item.originalPrice as number)) * 100)
      : 0);

  return (
    <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[60] bg-[#001a23]/85 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 12 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 32,
              mass: 0.85,
            }}
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
                whileHover={{
                  scale: 1.05,
                  rotate: 90,
                  transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] },
                }}
                whileTap={{ scale: 0.96, transition: { duration: 0.15 } }}
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
                  transition={{
                    delay: 0.12,
                    type: "spring",
                    stiffness: 210,
                    damping: 28,
                    mass: 0.65,
                  }}
                  className="absolute top-5 start-5 z-20 bg-gradient-to-br from-rose-500 to-red-600 text-white text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow-[0_10px_25px_rgba(244,63,94,0.5)] ring-2 ring-white/20"
                >
                  -{discountPct}%
                </motion.div>
              )}
            </div>

            {/* Content Section */}
            <div className="p-7 md:p-8 text-center md:text-start">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.14,
                  duration: 0.62,
                  ease: [0.16, 1, 0.3, 1],
                }}
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
                  transition={{
                    delay: 0.22,
                    duration: 0.62,
                    ease: [0.16, 1, 0.3, 1],
                  }}
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

              {isTableOrder ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.28,
                    duration: 0.58,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="mb-6 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
                    <button
                      type="button"
                      onClick={() => {
                        upsertSkyCartQuantityFromMenuItem(item, selectedQty);
                        setSelectedQty(1);
                      }}
                      className="rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-500"
                    >
                      {isAr ? "أضف إلى السلة" : "Add to cart"}
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 text-cyan-100 transition hover:bg-white/10"
                        onClick={() =>
                          setSelectedQty((q) => Math.max(1, q - 1))
                        }
                        aria-label={isAr ? "تقليل" : "Decrease"}
                      >
                        −
                      </button>
                      <span className="min-w-8 text-center text-sm font-semibold text-white">
                        {selectedQty}
                      </span>
                      <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 text-cyan-100 transition hover:bg-white/10"
                        onClick={() => setSelectedQty((q) => q + 1)}
                        aria-label={isAr ? "زيادة" : "Increase"}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {inCartQty > 0 ? (
                    <p className="text-center text-sm text-cyan-200/70">
                      {isAr
                        ? `في السلة: ${inCartQty}`
                        : `In cart: ${inCartQty}`}
                    </p>
                  ) : null}
                </motion.div>
              ) : null}

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.32,
                  duration: 0.58,
                  ease: [0.16, 1, 0.3, 1],
                }}
                onClick={onClose}
                className="w-full group flex items-center justify-center gap-3 py-3.5 rounded-2xl
                           bg-white/5 border border-white/10 text-white font-bold
                           hover:bg-cyan-500 hover:border-cyan-400 hover:shadow-[0_10px_30px_rgba(6,182,212,0.35)] transition-[background,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              >
                <span>{isAr ? "العودة للقائمة" : "Back to Menu"}</span>
                {isAr ? <FiArrowLeft className="group-hover:-translate-x-1.5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"/> : <FiArrowRight className="group-hover:translate-x-1.5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"/>}
              </motion.button>
            </div>
          </motion.div>
    </>
  );
}

const ProductModalO = ({ item, onClose, currency }: ProductModalProps) => (
  <AnimatePresence>
    {item ? (
      <ProductModalContent
        key={item.id}
        item={item}
        onClose={onClose}
        currency={currency}
      />
    ) : null}
  </AnimatePresence>
);

export default ProductModalO;