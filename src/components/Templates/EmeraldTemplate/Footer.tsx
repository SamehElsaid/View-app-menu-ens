"use client";

import { useLocale } from "next-intl";


export default function Footer() {
  const locale = useLocale() as "ar" | "en";

  return (
    <footer className="border-t border-stone-100 py-6 bg-white" aria-label="Footer">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#4c1121] to-[#9b2545] shadow-[0_4px_20px_rgba(155,37,69,0.4)] flex items-center justify-center">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3C12 3 7 8 7 13a5 5 0 0010 0c0-5-5-10-5-10z"
                fill="white"
                fillOpacity=".9"
              />
              <path d="M12 13v6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="font-serif italic text-[#4c1121] text-sm font-700">
            {locale === "ar" ? "زُمُرُّد" : "Emerald"}
          </span>
        </div>

        <p className="font-sans text-xs text-stone-400">{locale === "ar" ? "© 2025 زُمُرُّد. جميع الحقوق محفوظة." : "© 2025 Emerald. All rights reserved."}</p>

        <p dir="ltr" className="font-sans text-xs text-stone-400 flex items-center gap-1">
          {locale === "ar" ? "تصميم وتطوير" : "Designed & Developed by"}{" "}
          <a
            href="https://www.facebook.com/ENSEGYPTEG"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#4c1121] hover:underline transition-colors"
          >
            ENS
          </a>
        </p>
      </div>
    </footer>
  );
}
