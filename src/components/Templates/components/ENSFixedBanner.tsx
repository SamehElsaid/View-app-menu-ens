"use client";

import React, { useState } from "react";
import { FaTimes, FaWhatsapp } from "react-icons/fa";
import { useLocale } from "next-intl";

/** ENS sales / support WhatsApp (same as main product links). */
const ENS_WHATSAPP_URL = "https://wa.me/971586551491";

// ============================
// Fixed Bottom Banner Component
// ============================

export const ENSFixedBanner: React.FC = () => {
  const locale = useLocale();
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div
      className="
      fixed bottom-0 left-0 right-0 z-50
      bg-linear-to-r from-blue-600 via-purple-600 to-blue-600
      text-white
      py-2.5 px-4
      shadow-lg shadow-purple-500/20
    "
    >
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
            <FaWhatsapp className="text-sm" aria-hidden />
            <span className="text-xs font-bold">ENS</span>
          </div>
          <p className="text-xs sm:text-sm font-medium">
            {locale === "ar"
              ? "🚀 هل تريد منيو إلكتروني مثل هذا؟ تواصل مع ENS عبر واتساب!"
              : "🚀 Want a digital menu like this? Contact ENS on WhatsApp!"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={ENS_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex items-center gap-1.5
              bg-[#25D366] text-white
              text-xs sm:text-sm font-bold
              px-3 sm:px-4 py-1.5 rounded-full
              transition-all duration-300
              hover:bg-[#20bd5a]
              hover:scale-105
              whitespace-nowrap
            "
          >
            <FaWhatsapp className="size-4 shrink-0" aria-hidden />
            {locale === "ar" ? "واتساب" : "WhatsApp"}
          </a>
          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="
              shrink-0 p-1.5 rounded-full
              hover:bg-white/20 active:bg-white/30
              transition-colors
            "
            aria-label={locale === "ar" ? "إغلاق الشريط" : "Dismiss banner"}
          >
            <FaTimes className="size-4 sm:size-5" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
};
