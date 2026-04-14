"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { MenuItem } from "@/types/menu";
import { useNoirTheme } from "./NoirThemeContext";
import { hexToRgba, shadowGlow } from "./noirColorUtils";
import { NOIR_EASE } from "./noirConstants";
import { resolveMenuItemImageSrc } from "@/lib/menuItemImage";

interface DetailModalProps {
  item: MenuItem;
  onClose: () => void;
  currency: string;
}

export default function DetailModal({
  item,
  onClose,
  currency,
}: DetailModalProps) {
  const locale = useLocale();
  const { primary } = useNoirTheme();
  const name = locale === "ar" ? item.nameAr : item.nameEn;
  const desc = locale === "ar" ? item.descriptionAr : item.descriptionEn;
  const catLabel = locale === "ar" ? item.categoryNameAr : item.categoryNameEn;

  const panelShadow = `0 0 60px ${hexToRgba(primary, 0.2)}, 0 40px 80px rgba(0,0,0,0.6)`;
  const closeGlow = shadowGlow(primary, 20, 0.25);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handler);
    };
  }, [onClose]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-8 backdrop-blur-[12px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: NOIR_EASE }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        className="max-h-[90vh] w-full max-w-[600px] overflow-y-auto rounded-[4px] border border-violet/20 bg-charcoal/95"
        style={{ boxShadow: panelShadow }}
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: NOIR_EASE }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-[280px] overflow-hidden">
          <Image
            src={resolveMenuItemImageSrc(item.image)}
            alt={name}
            fill
            className="object-cover saturate-[0.72]"
            sizes="600px"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(17,17,24,0) 0%, rgba(17,17,24,0.12) 35%, rgba(17,17,24,0.55) 72%, rgba(17,17,24,0.94) 100%), radial-gradient(100% 70% at 50% 0%, rgba(0,0,0,0.18), transparent 60%)",
            }}
          />
          <button
            type="button"
            className="absolute end-4 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-violet/30 bg-black/80 text-base text-text-secondary transition-[transform,background-color,box-shadow] duration-300 ease-out hover:bg-black/70 active:scale-95"
            style={{ boxShadow: "none" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = closeGlow;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none";
            }}
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-8">
          <p className="text-sm tracking-[0.3em] uppercase text-cyan mb-3">
            {catLabel}
          </p>
          <h3
            id="detail-modal-title"
            className="font-display text-4xl font-light leading-tight mb-4"
          >
            {name}
          </h3>
          {desc && (
            <p className="text-sm text-text-secondary leading-relaxed mb-6">
              {desc}
            </p>
          )}

          <div className="flex items-center justify-between gap-4">
            <span className="font-display text-3xl font-light text-lavender">
              {currency} {item.price}
            </span>
            {item.originalPrice && item.originalPrice > item.price && (
              <span className="text-sm text-text-secondary line-through">
                {currency} {item.originalPrice}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
