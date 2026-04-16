"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { useLocale } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import { useEmeraldTheme, hexToRgba } from "./EmeraldThemeContext";
import { LanguageToggle } from "../Default/LanguageToggle";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const locale = useLocale();
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);
  const { primary, secondary } = useEmeraldTheme();

  const siteName = menuInfo?.name?.trim();
  const displayName = siteName || (locale === "ar" ? "زُمُرُّد" : "Emerald");

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const borderSubtle = hexToRgba(primary, 0.08);
  const ringSoft = hexToRgba(primary, 0.1);
  const logoShadow = hexToRgba(primary, 0.35);
  const placeholderShadow = hexToRgba(primary, 0.4);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 bg-white/82 backdrop-blur-xl border-b transition-all duration-300 ${
        scrolled ? "py-3" : "py-5"
      }`}
      style={{ borderBottomColor: borderSubtle }}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 group"
          aria-label={displayName}
        >
          {menuInfo?.logo ? (
            <div
              className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1"
              style={{
                boxShadow: `0 4px 20px ${logoShadow}`,
                borderColor: ringSoft,
              }}
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
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{
                background: `linear-gradient(to bottom right, ${primary}, ${secondary})`,
                boxShadow: `0 4px 20px ${placeholderShadow}`,
              }}
            >
              <svg
                width="16"
                height="16"
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
          <span
            className="font-serif italic text-xl font-700 tracking-tight"
            style={{ color: primary }}
          >
            {displayName}
          </span>
        </Link>

        <LanguageToggle />
      </div>
    </header>
  );
}
