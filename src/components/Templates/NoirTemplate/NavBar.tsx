"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import { useNoirTheme } from "./NoirThemeContext";
import { shadowGlow } from "./noirColorUtils";
import { LanguageToggle } from "../Default/LanguageToggle";

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const locale = useLocale();
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);
  const { primary } = useNoirTheme();

  const siteName = menuInfo?.name?.trim();
  const displayName = siteName || "NØIR";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-100 flex h-[72px] items-center justify-between px-4 backdrop-blur-[20px] transition-colors duration-300 sm:px-8 border-b border-violet/10 ${
        scrolled ? "bg-black/92" : "bg-black/60"
      }`}
    >
      <a
        href="#top"
        className="flex shrink-0 items-center gap-2 no-underline sm:gap-3"
      >
        {menuInfo?.logo ? (
          <div
            className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-violet/20"
            style={{ boxShadow: shadowGlow(primary, 20, 0.25) }}
          >
            <Image
              src={menuInfo.logo}
              alt=""
              fill
              className="object-cover"
              sizes="32px"
            />
          </div>
        ) : (
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-violet to-cyan"
            style={{ boxShadow: shadowGlow(primary, 20, 0.35) }}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
              <path
                d="M12 3C12 3 7 8 7 13a5 5 0 0010 0c0-5-5-10-5-10z"
                fill="white"
                fillOpacity=".9"
              />
            </svg>
          </div>
        )}
        <span className="font-logo text-lg tracking-[0.15em] text-lavender sm:text-xl sm:tracking-[0.2em]">
          {displayName}
        </span>
      </a>

      <ul className="flex list-none items-center gap-4 md:gap-8">
        <li>
          <a
            href="#menu"
            className="relative text-[0.65rem] uppercase tracking-[0.12em] text-text-secondary no-underline transition-colors duration-300 before:absolute before:-bottom-1 before:left-0 before:h-px before:w-0 before:bg-lavender before:transition-[width] before:duration-300 hover:before:w-full sm:text-xs sm:tracking-[0.15em]"
          >
            {locale === "ar" ? "القائمة" : "Menu"}
          </a>
        </li>
      </ul>

      <div className="flex shrink-0 items-center">
        <LanguageToggle />
      </div>
    </header>
  );
}
