"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import {
  useArcaneTheme,
  hexToRgba,
} from "./ArcaneThemeContext";
import LoadImage from "@/components/ImageLoad";

function LangToggle({ onHero }: { onHero: boolean }) {
  const locale = useLocale() as "ar" | "en";
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
      onClick={toggleLanguage}
      aria-label={locale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
      className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wide transition-colors sm:px-4 sm:py-2 sm:text-xs ${
        onHero
          ? "border-white/50 text-white hover:bg-white/10"
          : "border-[#e5e5e5] text-[#111111] hover:border-arcane-red hover:text-arcane-red"
      }`}
    >
      {locale === "ar" ? "EN" : "AR"}
    </button>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);
  const { primary, secondary } = useArcaneTheme();
  const displayName = menuInfo?.name?.trim() || "Arcane";
  const onHero = !pastHero;

  useEffect(() => {
    const handler = () => {
      const y = window.scrollY;
      const heroThreshold = Math.min(window.innerHeight * 0.42, 380);
      setScrolled(y > 16);
      setPastHero(y > heroThreshold);
    };
    window.addEventListener("scroll", handler, { passive: true });
    window.addEventListener("resize", handler, { passive: true });
    handler();
    return () => {
      window.removeEventListener("scroll", handler);
      window.removeEventListener("resize", handler);
    };
  }, []);

  const logoShadow = hexToRgba(primary, 0.35);

  const headerClass = onHero
    ? "border-transparent bg-transparent text-white"
    : "border-[#eeeeee]/80 bg-white/95 text-[#111111] shadow-sm backdrop-blur-xl";

  const nameColor = onHero ? "#FFFFFF" : primary;

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${headerClass} ${
        scrolled ? "py-2.5 sm:py-3" : "py-3 sm:py-5"
      }`}
      style={onHero ? { backgroundColor: "transparent" } : undefined}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6">
        <Link
          href="/"
          className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3"
          aria-label={displayName}
          onClick={(e) => {
            e.preventDefault();
            scrollTo("top");
          }}
        >
          {menuInfo?.logo ? (
            <div
              className={`relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 sm:h-9 sm:w-9 ${onHero ? "ring-white/30" : ""}`}
              style={{ boxShadow: onHero ? undefined : `0 4px 20px ${logoShadow}` }}
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
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white sm:h-9 sm:w-9 sm:text-xs"
              style={{
                background: onHero
                  ? "rgba(255,255,255,0.2)"
                  : `linear-gradient(to bottom right, ${primary}, ${secondary})`,
              }}
            >
              {displayName.charAt(0)}
            </div>
          )}
          <span
            className="truncate font-body text-base font-black uppercase tracking-wide sm:text-lg md:text-xl"
            style={{ color: nameColor }}
          >
            {displayName}
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <LangToggle onHero={onHero} />
        </div>
      </div>
    </header>
  );
}
