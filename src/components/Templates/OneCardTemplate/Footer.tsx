"use client";

import { useLocale, useTranslations } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import { useEnsmenuBrandingTracking } from "@/hooks/useEnsmenuBrandingTracking";
import { useOneCardTheme } from "./OneCardThemeContext";

export default function Footer() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const t = useTranslations("footer");
  const menuT = useTranslations("menu");
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);
  const { primary } = useOneCardTheme();
  const { onBrandingPointerDown } = useEnsmenuBrandingTracking();
  const currentYear = new Date().getFullYear();
  const menuName = menuInfo?.name?.trim() || menuT("ourMenu");

  return (
    <footer
      id="footer"
      className="scroll-mt-24 mt-8 rounded-[2rem] bg-zinc-100 px-4 py-5 sm:rounded-[2.5rem] sm:px-6 sm:py-6 md:mt-10 md:px-8 md:py-7 lg:mt-12 lg:rounded-[3rem] lg:py-8"
    >
      <div
        dir={isAr ? "rtl" : "ltr"}
        className="flex flex-col items-center gap-3 text-center text-sm text-zinc-500 md:flex-row md:justify-between md:gap-6 md:text-start md:text-base lg:text-lg"
      >
        <p dir="ltr" className="flex items-center justify-center gap-1.5 sm:justify-start">
          <span>{t("designedBy")}</span>
          <a
            href="https://www.ensmenu.com/"
            target="_blank"
            rel="noopener noreferrer"
            onPointerDown={onBrandingPointerDown}
            className="font-bold transition hover:underline"
            style={{ color: primary }}
          >
            ENSMenu
          </a>
        </p>

        <span
          className="hidden h-8 w-px bg-zinc-300 md:block lg:h-10"
          aria-hidden
        />

        <p className="text-balance text-xs sm:text-sm md:text-base">
          {isAr ? (
            <>
              {t("rights")}{" "}
              <span dir="ltr">
                © {currentYear} {menuName}
              </span>
            </>
          ) : (
            <>
              © {currentYear} {menuName}. {t("rights")}
            </>
          )}
        </p>
      </div>
    </footer>
  );
}
