"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useAppSelector } from "@/store/hooks";
import LoadImage from "@/components/ImageLoad";
import {
  RETRO_SURFACE,
  RETRO_SURFACE_BORDER,
  useCoffeeTheme,
} from "./CoffeeThemeContext";
import MenuWifiDropdown from "@/components/Global/MenuWifiDropdown";

export default function Navbar() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);
  const { primary } = useCoffeeTheme();

  const [scrolled, setScrolled] = useState(false);

  const displayName = menuInfo?.name?.trim() ?? "";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const toggleLanguage = () => {
    const newLocale = locale === "ar" ? "en" : "ar";
    const query = searchParams.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`, {
      locale: newLocale,
    });
  };

  return (
    <>
      <style jsx global>{`
        :root {
          --retro-nav-offset: calc(4.25rem + env(safe-area-inset-top, 0px));
        }
        @media (min-width: 640px) {
          :root {
            --retro-nav-offset: calc(4.5rem + env(safe-area-inset-top, 0px));
          }
        }
        .retro-nav-link {
          position: relative;
        }
        .retro-nav-link::after {
          content: "";
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: 55%;
          height: 2px;
          background-color: ${primary};
          border-radius: 999px;
          transition: transform 0.25s ease;
        }
        .retro-nav-link:hover::after,
        .retro-nav-link:focus-visible::after {
          transform: translateX(-50%) scaleX(1);
        }
      `}</style>

      <header
        className={`fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top,0px)] transition-all duration-300 ${
          scrolled ? "shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)]" : ""
        }`}
        style={{
          backgroundColor: RETRO_SURFACE,
        }}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:gap-4 sm:px-6">
          <Link
            href="/"
            className="flex min-w-0 flex-1 items-center gap-3"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            {menuInfo?.logo ? (
              <div
                className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border bg-white shadow-sm sm:h-11 sm:w-11"
                style={{ borderColor: RETRO_SURFACE_BORDER }}
              >
                <LoadImage
                  src={menuInfo.logo}
                  alt={displayName || "Logo"}
                  fill
                  className="object-cover"
                  disableLazy
                />
              </div>
            ) : displayName ? (
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-serif text-sm font-black text-white sm:h-11 sm:w-11 sm:text-base"
                style={{ backgroundColor: primary }}
              >
                {displayName.charAt(0)}
              </div>
            ) : null}

            {displayName ? (
              <span
                className="truncate font-serif text-base font-black tracking-tight sm:text-lg"
                style={{ color: primary }}
              >
                {displayName}
              </span>
            ) : null}
          </Link>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <MenuWifiDropdown
              buttonClassName="border bg-white text-zinc-700 shadow-sm hover:bg-zinc-50"
              panelClassName="border-zinc-200 bg-white text-zinc-800"
            />
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex h-9 min-w-10 items-center justify-center rounded-full border bg-white px-2.5 text-[11px] font-black tracking-wider shadow-sm transition-all active:scale-95 hover:bg-zinc-50 sm:h-10 sm:min-w-11 sm:px-3 sm:text-xs"
              style={{ color: primary, borderColor: RETRO_SURFACE_BORDER }}
              aria-label={locale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
            >
              {locale === "ar" ? "EN" : "AR"}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
