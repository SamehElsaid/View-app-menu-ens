"use client";

import { useLocale } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import { usePharaonicTheme, shadowGlow } from "./PharaonicThemeContext";
import { LanguageToggle } from "../Default/LanguageToggle";
import { HieroglyphBorder } from "./PharaonicDecor";
import LoadImage from "@/components/ImageLoad";
import PharaonicMenuCta from "./PharaonicMenuCta";

export default function NavBar() {
  const locale = useLocale();
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);
  const { primary, secondary } = usePharaonicTheme();

  const displayName =
    menuInfo?.name?.trim() || (locale === "ar" ? "منيو" : "Menu");
  return (
    <header
      className="fixed top-0 left-0 right-0 z-100 bg-[#0c0a08] pt-[env(safe-area-inset-top,0px)] border-b"
      style={{ borderColor: `${primary}33` }}
    >
      <HieroglyphBorder className="opacity-30" />
      <div className="flex h-[60px] min-h-[56px] items-center justify-between px-4 sm:h-[72px] sm:px-8">
        <a
          href="#top"
          className="flex shrink-0 items-center gap-2 no-underline sm:gap-3"
        >
          {menuInfo?.logo ? (
            <div
              className="relative h-9 w-9 shrink-0 overflow-hidden rounded-sm"
              style={{
                border: `2px solid ${primary}`,
                boxShadow: shadowGlow(primary, 16, 0.35),
              }}
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
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm text-[#0c0a08] text-xs font-bold"
              style={{
                background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                boxShadow: shadowGlow(primary, 12, 0.4),
              }}
              aria-hidden
            >
              𓂀
            </div>
          )}
          <span
            className="text-lg sm:text-xl tracking-[0.12em] uppercase"
            style={{ color: primary }}
          >
            {displayName}
          </span>
        </a>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <PharaonicMenuCta variant="nav" />
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
