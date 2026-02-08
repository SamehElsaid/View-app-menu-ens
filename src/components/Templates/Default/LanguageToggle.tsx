"use client";

import React from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { FiGlobe } from "react-icons/fi";
import { Button } from "../components/Button";

// ============================
// Language Toggle Component
// ============================

export const LanguageToggle: React.FC = () => {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams() as URLSearchParams;

  const toggleLanguage = () => {
    const targetLocale = locale === "ar" ? "en" : "ar";
    const query = searchParams.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`, {
      locale: targetLocale,
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="group relative overflow-hidden rounded-full px-4 py-2"
    >
      <span className="flex items-center gap-2">
        <FiGlobe className="text-lg transition-transform duration-300 group-hover:rotate-180" />
        <span className="text-sm font-semibold tracking-wide">
          {locale === "ar" ? "EN" : "عربي"}
        </span>
      </span>
    </Button>
  );
};
