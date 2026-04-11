"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useAppSelector } from "@/store/hooks";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);

  const siteName = menuInfo?.name?.trim();
  const displayName =
    siteName || (locale === "ar" ? "زُمُرُّد" : "Emerald");

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const toggleLanguage = () => {
    const newLocale = locale === "ar" ? "en" : "ar";
    router.push(pathname, { locale: newLocale });
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 bg-white/82 backdrop-blur-xl border-b border-[#4c1121]/8 transition-all duration-300 ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 group"
          aria-label={displayName}
        >
          {menuInfo?.logo ? (
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full shadow-[0_4px_20px_rgba(155,37,69,0.35)] ring-1 ring-[#4c1121]/10">
              <Image
                src={menuInfo.logo}
                alt=""
                fill
                className="object-cover"
                sizes="32px"
              />
            </div>
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#4c1121] to-[#9b2545] shadow-[0_4px_20px_rgba(155,37,69,0.4)]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
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
          <span className="font-serif italic text-[#4c1121] text-xl font-700 tracking-tight">
            {displayName}
          </span>
        </Link>

        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#f5b0c4]
                   text-[#62162a] font-sans text-sm font-600 hover:bg-[#fef1f5]
                   transition-colors duration-200"
          aria-label="Switch language"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20" />
            <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
          </svg>
          {locale === "ar" ? "EN" : "AR"}
        </button>
      </div>
    </header>
  );
}
