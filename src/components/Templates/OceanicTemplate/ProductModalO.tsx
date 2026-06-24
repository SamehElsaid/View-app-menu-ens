"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useIsOrderingEnabled } from "@/hooks/useIsOrderingEnabled";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { toast } from "react-toastify";
import { useLocale } from "next-intl";
import type { MenuItem, MenuItemSizeOption, MenuItemVariantOption } from "@/types/menu";
import {
  getCartQuantityForMenuItem,
  readSkyCartFromCookie,
  subscribeSkyCartUpdated,
  upsertSkyCartFromMenuItemWithOptions,
} from "@/lib/skyTemplateCart";
import {
  computeMenuItemUnitPrice,
  getMenuItemMinPrice,
  getMenuItemSizes,
  getMenuItemVariants,
  hasMenuItemOptions,
  pickSizeLabel,
  pickVariantLabel,
} from "@/lib/menuItemOptions";
import LoadImage from "@/components/ImageLoad";

interface ProductModalProps {
  item: MenuItem | null;
  onClose: () => void;
  currency: string;
}

const ProductModalO = ({ item, onClose, currency }: ProductModalProps) => {
  const locale = useLocale();
  const isAr = locale === "ar";
  const { isOrderingEnabled: isTableOrder } = useIsOrderingEnabled();
  const [selectedQty, setSelectedQty] = useState(1);
  const [inCartQty, setInCartQty] = useState(0);

  const sizes = useMemo(() => (item ? getMenuItemSizes(item) : []), [item]);
  const variants = useMemo(
    () => (item ? getMenuItemVariants(item) : []),
    [item],
  );
  const itemHasOptions = item ? hasMenuItemOptions(item) : false;
  const displayMinPrice = item ? getMenuItemMinPrice(item) : 0;

  const [selectedSize, setSelectedSize] = useState<MenuItemSizeOption | null>(
    null,
  );
  const [selectedVariant, setSelectedVariant] =
    useState<MenuItemVariantOption | null>(null);

  const selectedUnitPrice = item
    ? computeMenuItemUnitPrice(item, selectedSize, selectedVariant)
    : 0;

  useEffect(() => {
    if (item) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
    } else {
      document.body.style.overflow = "";
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("modal-open");
    };
  }, [item]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    if (!item) return;
    setSelectedSize(sizes[0] ?? null);
    setSelectedVariant(null);
    setSelectedQty(1);
    const sync = () => {
      const c = readSkyCartFromCookie();
      setInCartQty(getCartQuantityForMenuItem(c, item.id));
    };
    sync();
    return subscribeSkyCartUpdated(sync);
  }, [item, sizes]);

  const displayName = item ? (isAr ? item.nameAr : item.nameEn) : "";
  const displayDesc = item
    ? isAr
      ? (item.descriptionAr ?? item.description)
      : (item.descriptionEn ?? item.description)
    : "";
  const hasDiscount =
    !!item?.originalPrice && (item.originalPrice as number) > item.price;
  const savedAmount =
    hasDiscount && item ? (item.originalPrice as number) - item.price : 0;
  const discountPct =
    item?.discountPercent ??
    (hasDiscount && item
      ? Math.round((savedAmount / (item.originalPrice as number)) * 100)
      : 0);

  const priceDisplay = itemHasOptions
    ? isAr
      ? `من ${displayMinPrice}`
      : `From ${displayMinPrice}`
    : String(item?.price ?? 0);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {item && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100] bg-[#001a23]/85 backdrop-blur-md"
            onClick={onClose}
          />

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
            className="oceanic-modal-scroll fixed z-[110] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                       w-[95%] max-w-[520px] max-h-[92vh] overflow-y-auto rounded-[2.5rem]
                       bg-linear-to-b from-[#002b36] via-[#00222d] to-[#001a23]
                       border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.6)]"
          >
            <div className="relative w-full aspect-4/3 md:aspect-16/10 overflow-hidden bg-linear-to-br from-[#002433] via-[#002b3a] to-[#003544]">
              <LoadImage
                src={item.image ?? ""}
                alt={displayName}
                className="object-cover w-full h-full"
                disableLazy={true}
              />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-[#001a23] to-transparent pointer-events-none" />

              <motion.button
                whileHover={{
                  scale: 1.05,
                  rotate: 90,
                  transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] },
                }}
                whileTap={{ scale: 0.96, transition: { duration: 0.15 } }}
                onClick={onClose}
                className={`absolute top-5 ${isAr ? "left-5" : "right-5"} z-30 w-11 h-11
                           bg-black/30   border border-white/15 rounded-full
                           flex items-center justify-center text-white hover:bg-white/20 transition-colors`}
              >
                <FiX className="w-5 h-5" />
              </motion.button>

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
                  className="absolute top-5 start-5 z-20 bg-gradient-to-br from-rose-500 to-red-600 text-white text-base font-extrabold px-3.5 py-1.5 rounded-full shadow-[0_10px_25px_rgba(244,63,94,0.5)] ring-2 ring-white/20"
                >
                  -{discountPct}%
                </motion.div>
              )}
            </div>

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
                <h4 className="text-lg md:text-xl font-bold text-white mb-3 font-body">
                  {displayName}
                </h4>

                <p className="w-full text-cyan-100/70 text-base md:text-base leading-relaxed mb-6 font-body text-balance wrap-break-word">
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
                  className="mb-6 p-4 md:p-5 rounded-2xl bg-white/[0.04] border border-white/10   "
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
                      <span className="text-cyan-400 font-extrabold text-2xl font-body leading-none">
                        {itemHasOptions ? priceDisplay : selectedUnitPrice}
                      </span>
                      {!itemHasOptions && (
                        <span className="text-cyan-500/70 text-lg font-bold uppercase tracking-wider">
                          {currency}
                        </span>
                      )}
                    </div>
                  </div>

                  {hasDiscount && (
                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-center gap-3">
                      <span className="text-base text-emerald-300/90 font-semibold">
                        {isAr ? "وفّرت" : "You save"}
                      </span>
                      <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-base font-extrabold px-3.5 py-1.5 rounded-full">
                        {savedAmount} {currency}
                      </span>
                    </div>
                  )}
                </motion.div>

                {sizes.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.26, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-5"
                  >
                    <h5 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-cyan-300/70 text-start">
                      {isAr ? "الحجم" : "Size"}
                    </h5>
                    <div className="space-y-2">
                      {sizes.map((size) => {
                        const label = pickSizeLabel(size, locale);
                        const checked = selectedSize?.nameEn === size.nameEn;
                        return (
                          <label
                            key={`${size.nameEn}-${size.price}`}
                            className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2.5 transition text-start"
                            style={{
                              borderColor: checked
                                ? "rgba(34,211,238,0.6)"
                                : "rgba(255,255,255,0.1)",
                              backgroundColor: checked
                                ? "rgba(34,211,238,0.08)"
                                : "transparent",
                            }}
                          >
                            <span className="flex items-center gap-2.5">
                              <input
                                type="radio"
                                name={`oceanic-size-${item.id}`}
                                checked={checked}
                                onChange={() => setSelectedSize(size)}
                                className="h-4 w-4 accent-cyan-400"
                              />
                              <span className="text-sm font-medium text-cyan-100">
                                {label}
                              </span>
                            </span>
                            <span className="text-sm font-bold text-cyan-400">
                              {size.price} {currency}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : null}

                {variants.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-5"
                  >
                    <h5 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-cyan-300/70 text-start">
                      {isAr ? "الإضافات" : "Add-ons"}
                    </h5>
                    <div className="space-y-2">
                      <label
                        className="flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition text-start"
                        style={{
                          borderColor:
                            selectedVariant === null
                              ? "rgba(34,211,238,0.6)"
                              : "rgba(255,255,255,0.1)",
                          backgroundColor:
                            selectedVariant === null
                              ? "rgba(34,211,238,0.08)"
                              : "transparent",
                        }}
                      >
                        <input
                          type="radio"
                          name={`oceanic-variant-${item.id}`}
                          checked={selectedVariant === null}
                          onChange={() => setSelectedVariant(null)}
                          className="h-4 w-4 accent-cyan-400"
                        />
                        <span className="text-sm font-medium text-cyan-100">
                          {isAr ? "بدون إضافة" : "No add-on"}
                        </span>
                      </label>
                      {variants.map((variant) => {
                        const label = pickVariantLabel(variant, locale);
                        const checked =
                          selectedVariant?.labelEn === variant.labelEn;
                        return (
                          <label
                            key={`${variant.labelEn}-${variant.price}`}
                            className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2.5 transition text-start"
                            style={{
                              borderColor: checked
                                ? "rgba(34,211,238,0.6)"
                                : "rgba(255,255,255,0.1)",
                              backgroundColor: checked
                                ? "rgba(34,211,238,0.08)"
                                : "transparent",
                            }}
                          >
                            <span className="flex items-center gap-2.5">
                              <input
                                type="radio"
                                name={`oceanic-variant-${item.id}`}
                                checked={checked}
                                onChange={() => setSelectedVariant(variant)}
                                className="h-4 w-4 accent-cyan-400"
                              />
                              <span className="text-sm font-medium text-cyan-100">
                                {label}
                              </span>
                            </span>
                            <span className="text-sm font-bold text-cyan-400">
                              {variant.price > 0
                                ? `+${variant.price} ${currency}`
                                : isAr
                                  ? "مجاني"
                                  : "Free"}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : null}
              </motion.div>

              {isTableOrder && item ? (
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
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4   ">
                    <button
                      type="button"
                      onClick={() => {
                        upsertSkyCartFromMenuItemWithOptions(item, selectedQty, {
                          locale,
                          size: selectedSize,
                          variant: selectedVariant,
                        });
                        toast.success(
                          locale === "ar"
                            ? `تمت إضافة ${selectedQty} إلى السلة`
                            : `Added ${selectedQty} to cart`,
                        );
                        setSelectedQty(1);
                        onClose();
                      }}
                      className="rounded-xl bg-cyan-600 px-4 py-2.5 text-base font-bold text-white transition hover:bg-cyan-500"
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
                      <span className="min-w-8 text-center text-base font-semibold text-white">
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
                    <p className="text-center text-base text-cyan-200/70">
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
                {isAr ? (
                  <FiArrowLeft className="group-hover:-translate-x-1.5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                ) : (
                  <FiArrowRight className="group-hover:translate-x-1.5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                )}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default ProductModalO;
