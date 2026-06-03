"use client";

import React, { useState } from "react";
import { FaGlobe, FaTimes } from "react-icons/fa";
import { useTranslations } from "next-intl";

const ENS_WEBSITE_URL = "https://ensmenu.com";

// ============================
// Fixed Bottom Banner Component
// ============================

export const ENSFixedBanner: React.FC = () => {
  const t = useTranslations("ensBanner");
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
      <div className="container mx-auto flex min-w-0 items-center justify-between gap-2 sm:gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pe-3 sm:gap-3 sm:pe-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="hidden shrink-0 items-center gap-2 rounded-full bg-white/20 px-3 py-1 backdrop-blur-base sm:flex">
            <FaGlobe className="text-base" aria-hidden />
            <span className="text-base font-bold">ENS</span>
          </div>
          <p className="shrink-0 me-1  whitespace-nowrap text-xs font-medium sm:text-base">
            {t("message")}
            <a href={ENS_WEBSITE_URL+"/auth/register "} target="_blank" rel="noopener noreferrer" className="text-white hover:underline underline">
              {t("ctaLink")}
            </a>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <a
            href={ENS_WEBSITE_URL+"/auth/register"}
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex items-center gap-1
              bg-white text-purple-700
              text-xs sm:text-base font-bold
              px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full
              transition-all duration-300
              hover:bg-white/90
              hover:scale-105
              whitespace-nowrap
            "
          >
            <FaGlobe className="size-4 shrink-0" aria-hidden />
            {t("cta")}
          </a>
          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="
              shrink-0 p-1.5 rounded-full
              hover:bg-white/20 active:bg-white/30
              transition-colors
            "
            aria-label={t("dismiss")}
          >
            <FaTimes className="size-4 sm:size-5" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
};
