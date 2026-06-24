"use client";

import { useLocale, useTranslations } from "next-intl";
import { FaHeart } from "react-icons/fa";
import { useAppSelector } from "@/store/hooks";
import { useEnsmenuBrandingTracking } from "@/hooks/useEnsmenuBrandingTracking";
import { useOneCardTheme } from "../OneCardTemplate/OneCardThemeContext";

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
      className="mt-8 scroll-mt-24 border-t border-dashed border-(--vanilla-gold,#b8893a)/35 pt-5"
    >
      <div className="mb-4 flex items-center justify-center" aria-hidden>
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-(--vanilla-gold,#b8893a)/35 bg-white">
          <FaHeart className="h-3 w-3 text-(--vanilla-gold,#b8893a)" />
        </span>
      </div>

      <div
        dir={isAr ? "rtl" : "ltr"}
        className="flex flex-col items-center gap-2 text-center text-xs text-zinc-500 sm:flex-row sm:justify-between sm:text-sm"
      >
        <p dir="ltr" className="flex items-center gap-1.5">
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

        <p className="text-balance">
          {isAr ? (
            <>
              <span dir="ltr">© {currentYear}</span> {t("rights")} {menuName}
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
