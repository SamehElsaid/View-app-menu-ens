"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import { useAppSelector } from "@/store/hooks";

export default function Footer() {
  const locale = useLocale() as "ar" | "en";
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);

  const siteName = menuInfo?.name?.trim();
  const displayName = siteName || (locale === "ar" ? "زُمُرُّد" : "Emerald");
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t border-stone-100 py-6 bg-white"
      aria-label="Footer"
    >
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {menuInfo?.logo ? (
            <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full shadow-[0_4px_14px_rgba(155,37,69,0.3)] ring-1 ring-[#4c1121]/10">
              <Image
                src={menuInfo.logo}
                alt=""
                fill
                className="object-cover"
                sizes="24px"
              />
            </div>
          ) : (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#4c1121] to-[#9b2545] shadow-[0_4px_20px_rgba(155,37,69,0.4)]">
              <svg
                width="11"
                height="11"
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
          <span className="font-serif italic text-[#4c1121] text-sm font-700">
            {displayName}
          </span>
        </div>

        <p className="font-sans text-xs text-stone-400 mb-0!">
          {locale === "ar"
            ? `© ${year} ${displayName}. جميع الحقوق محفوظة.`
            : `© ${year} ${displayName}. All rights reserved.`}
        </p>

        <p
          dir="ltr"
          className="font-sans text-xs text-stone-400 flex items-center gap-1"
        >
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
