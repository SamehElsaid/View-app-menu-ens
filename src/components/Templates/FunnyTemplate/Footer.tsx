"use client";

import { useLocale } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import { useFunnyTheme } from "./FunnyThemeContext";
import LoadImage from "@/components/ImageLoad";
import { useEnsmenuBrandingTracking } from "@/hooks/useEnsmenuBrandingTracking";

export default function Footer() {
  const locale = useLocale() as "ar" | "en";
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);
  const { onBrandingPointerDown } = useEnsmenuBrandingTracking();
  const { primary } = useFunnyTheme();

  const siteName = menuInfo?.name?.trim();
  const displayName = siteName || (locale === "ar" ? "مرح" : "Funny");
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t border-white/15 py-6"
      style={{ backgroundColor: primary }}
      aria-label="Footer"
    >
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {menuInfo?.logo ? (
            <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full ring-1 ring-white/25 shadow-[0_4px_14px_rgba(0,0,0,0.15)]">
              <LoadImage
                src={menuInfo.logo}
                alt={displayName}
                fill
                className="object-cover"
                disableLazy
              />
            </div>
          ) : (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 shadow-[0_4px_14px_rgba(0,0,0,0.15)]">
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
          <span className="font-body text-base font-700 text-white">
            {displayName}
          </span>
        </div>

        <p
          className="font-sans text-base text-white/75 !mb-0 text-balance wrap-break-word"
          dir="ltr"
        >
          <span>
            © {year} {displayName} .{" "}
          </span>
          <span>
            {locale === "ar" ? "جميع الحقوق محفوظة." : "All rights reserved."}
          </span>
        </p>

        <p
          dir="ltr"
          className="font-sans text-lg text-white/75 inline-flex flex-wrap items-center justify-center gap-1"
        >
          <span>Powered by </span>
          <a
            href="https://www.ensmenu.com/"
            target="_blank"
            rel="noopener noreferrer"
            dir="ltr"
            onPointerDown={onBrandingPointerDown}
            className="font-medium text-white hover:underline transition-colors shrink-0"
          >
            ENSMenu
          </a>
        </p>
      </div>
    </footer>
  );
}
