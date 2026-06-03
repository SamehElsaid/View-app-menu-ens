"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import LoadImage from "@/components/ImageLoad";

function LangToggle() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams() as URLSearchParams;

  const toggleLanguage = () => {
    const targetLocale = locale === "ar" ? "en" : "ar";
    const query = searchParams.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`, {
      locale: targetLocale,
    });
  };

  return (
    <button
      type="button"
      className="music-lang-btn"
      onClick={toggleLanguage}
      aria-label={locale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
    >
      {locale === "ar" ? "EN" : "AR"}
    </button>
  );
}

export default function Navbar() {
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);
  const displayName = menuInfo?.name?.trim() || "Menu";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`music-nav${scrolled ? " music-nav--scrolled" : ""}`}
      aria-label="Main navigation"
    >
      <div className="music-nav__inner">
        <div className="music-logo">
          {menuInfo?.logo ? (
            <span className="music-logo__icon relative overflow-hidden">
              <LoadImage
                src={menuInfo.logo}
                alt={displayName}
                fill
                className="object-cover"
                disableLazy
              />
            </span>
          ) : (
            <span className="music-logo__icon" aria-hidden>
              ☕
            </span>
          )}
          <span className="music-logo__text text-brand-tomato transition-colors duration-300">
            {displayName}
          </span>
        </div>
        <div className="music-nav__actions">
          <LangToggle />
        </div>
      </div>
    </header>
  );
}
