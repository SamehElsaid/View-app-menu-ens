"use client";

import React, { useState } from "react";
import { FaGlobe, FaTimes } from "react-icons/fa";
import { useLocale } from "next-intl";

const ENS_WEBSITE_URL = "https://ensmenu.com";

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
          <div className="hidden sm:flex items-center gap-2 bg-white/20 backdrop-blur-base px-3 py-1 rounded-full">
            <FaGlobe className="text-base" aria-hidden />
            <span className="text-base font-bold">ENS</span>
          </div>
          <p className="text-base sm:text-base font-medium">
            {locale === "ar"
              ? "🚀 هل تريد منيو إلكتروني مثل هذا مجانا ؟ اضغط هنا !"
              : "🚀 Want a free digital menu like this? Click here!"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={ENS_WEBSITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex items-center gap-1.5
              bg-white text-purple-700
              text-base sm:text-base font-bold
              px-3 sm:px-4 py-1.5 rounded-full
              transition-all duration-300
              hover:bg-white/90
              hover:scale-105
              whitespace-nowrap
            "
          >
            <FaGlobe className="size-4 shrink-0" aria-hidden />
            ensmenu.com
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
