"use client";

import { useLocale } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import LoadImage from "@/components/ImageLoad";

export default function Footer() {
  const locale = useLocale() as "ar" | "en";
  const isAr = locale === "ar";
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);
  const displayName = menuInfo?.name?.trim() || (isAr ? "القائمة" : "Menu");
  const year = new Date().getFullYear();

  return (
    <footer className="music-footer music-container" aria-label="Footer">
      <div className="music-footer__card music-card-grid">
        <div className="music-footer__content">
          <div className="music-footer__brand">
            {menuInfo?.logo ? (
              <span className="music-footer__logo relative overflow-hidden">
                <LoadImage
                  src={menuInfo.logo}
                  alt={displayName}
                  fill
                  className="object-cover"
                  disableLazy
                />
              </span>
            ) : (
              <span className="music-footer__logo music-footer__logo--fallback" aria-hidden>
                {displayName.charAt(0)}
              </span>
            )}
            <span
              className={`music-footer__name text-brand-tomato${isAr ? " music-footer__name--ar" : ""}`}
            >
              {displayName}
            </span>
          </div>

          <p className="music-footer__copy text-brand-tomato/60" dir="ltr">
            <span>
              © {year} {displayName}
            </span>
            <span className="music-footer__copy-sep" aria-hidden>
              ·
            </span>
            <span>{isAr ? "جميع الحقوق محفوظة" : "All rights reserved"}</span>
          </p>

          <p className="music-footer__powered text-brand-tomato/60" dir="ltr">
            <span>Powered by </span>
            <a
              href="https://www.ensmenu.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="music-footer__link text-brand-tomato"
            >
              ENSMenu
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
