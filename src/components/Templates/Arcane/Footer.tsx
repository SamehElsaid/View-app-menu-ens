"use client";

import { useLocale } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import {
  useArcaneTheme,
  hexToRgba,
} from "./ArcaneThemeContext";
import LoadImage from "@/components/ImageLoad";

const FOOTER_WAVE_PATH =
  "M0,52 C280,4 560,108 840,42 C1080,8 1280,88 1440,36 L1440,120 L0,120 Z";

function FooterWave() {
  const { primary } = useArcaneTheme();

  return (
    <div
      className="pointer-events-none relative z-20 -mb-px w-full translate-y-px leading-[0]"
      aria-hidden
    >
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="block h-16 w-full sm:h-24 md:h-28 lg:h-32"
      >
        <path d={FOOTER_WAVE_PATH} fill={primary} />
      </svg>
    </div>
  );
}

export default function Footer() {
  const locale = useLocale() as "ar" | "en";
  const isAr = locale === "ar";
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);
  const { primary, secondary } = useArcaneTheme();

  const displayName = menuInfo?.name?.trim() || "Arcane";
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-6 overflow-x-clip sm:mt-8" aria-label="Footer">
      <div className="relative bg-white">
        <FooterWave />
      </div>

      <div className="py-5 sm:py-6 md:py-8" style={{ backgroundColor: primary }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center sm:gap-5 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-4 md:text-start">
          <div className="flex max-w-full items-center justify-center gap-2 md:justify-start">
            {menuInfo?.logo ? (
              <div
                className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full ring-1 ring-white/25"
                style={{ boxShadow: `0 4px 14px ${hexToRgba(primary, 0.4)}` }}
              >
                <LoadImage
                  src={menuInfo.logo}
                  alt={displayName}
                  fill
                  className="object-cover"
                  disableLazy
                />
              </div>
            ) : (
              <div
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white"
                style={{
                  background: `linear-gradient(to bottom right, ${primary}, ${secondary})`,
                }}
              >
                {displayName.charAt(0)}
              </div>
            )}
            <span className="truncate font-body text-sm font-bold text-white sm:text-base">
              {displayName}
            </span>
          </div>

          <p
            className="!mb-0 max-w-full text-balance text-xs text-white/90 wrap-break-word sm:text-sm"
            dir="ltr"
          >
            <span>
              © {year} {displayName}.{" "}
            </span>
            <span>{isAr ? "جميع الحقوق محفوظة." : "All rights reserved."}</span>
          </p>

          <p
            dir="ltr"
            className="inline-flex max-w-full flex-wrap items-center justify-center gap-1 text-xs text-white/90 sm:text-sm"
          >
            <span>Powered by </span>
            <a
              href="https://www.ensmenu.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-white underline-offset-2 hover:underline"
            >
              ENSMenu
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
