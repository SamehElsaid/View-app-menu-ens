"use client";

import React, { useState } from "react";

import { Icon } from "./Icon";
import { useLocale } from "next-intl";

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
            <Icon name="code-s-slash-line" className="text-sm" />
            <span className="text-xs font-bold">ENS</span>
          </div>
          <p className="text-xs sm:text-sm font-medium">
            {locale === "ar"
              ? "🚀 هل تريد منيو إلكتروني مثل هذا؟ تواصل مع ENS الآن!"
              : "🚀 Want a digital menu like this? Contact ENS now!"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://www.facebook.com/ENSEGYPTEG"
            target="_blank"
            rel="noopener noreferrer"
            className="
              bg-white text-purple-600 
              text-xs sm:text-sm font-bold
              px-3 sm:px-4 py-1.5 rounded-full
              transition-all duration-300
              hover:bg-purple-100
              hover:scale-105
              whitespace-nowrap
            "
          >
            {locale === "ar" ? "تواصل معنا" : "Contact Us"}
          </a>
          <button
            onClick={() => setIsVisible(false)}
            className="
              p-1 rounded-full
              hover:bg-white/20
              transition-colors
            "
            aria-label="Close"
          >
            <Icon name="close-line" className="text-lg" />
          </button>
        </div>
      </div>
    </div>
  );
};
