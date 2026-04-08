"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

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
    className={`fixed top-0 inset-x-0 z-40 bg-white/[0.82] backdrop-blur-[24px] border-b border-[#4c1121]/[0.08] transition-all duration-300 ${
      scrolled ? "py-3" : "py-5"
    }`}
  >
    <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-3 group" aria-label="Home">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4c1121] to-[#9b2545] flex items-center justify-center shadow-[0_4px_20px_rgba(155,37,69,0.4)]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3C12 3 7 8 7 13a5 5 0 0010 0c0-5-5-10-5-10z"
              fill="white"
              fillOpacity=".9"
            />
            <path d="M12 13v6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <span className="font-serif italic text-[#4c1121] text-xl font-700 tracking-tight">
          {locale === "ar" ? "زُمُرُّد" : "Emerald"}
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
