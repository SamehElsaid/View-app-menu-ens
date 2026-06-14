"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { useLocale } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import { useFunnyTheme } from "./FunnyThemeContext";
import { LanguageToggle } from "../Default/LanguageToggle";
import LoadImage from "@/components/ImageLoad";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const locale = useLocale();
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);
  const { primary } = useFunnyTheme();

  const siteName = menuInfo?.name?.trim();
  const displayName = siteName || (locale === "ar" ? "مرح" : "Funny");

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 border-b border-white/15 transition-all duration-300 ${
        scrolled ? "py-3" : "py-5"
      }`}
      style={{ backgroundColor: primary }}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 group"
          aria-label={displayName}
        >
          {menuInfo?.logo ? (
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-white/25 shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
              <LoadImage
                src={menuInfo.logo}
                alt={displayName}
                fill
                className="object-cover"
                disableLazy
              />
            </div>
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M12 3C12 3 7 8 7 13a5 5 0 0010 0c0-5-5-10-5-10z"
                  fill="white"
                  fillOpacity=".9"
                />
                <path
                  d="M12 13v6"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}
          <span className="font-body text-xl font-700 tracking-tight text-white">
            {displayName}
          </span>
        </Link>

        <div className="[&_button]:text-white [&_button]:hover:bg-white/15">
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
