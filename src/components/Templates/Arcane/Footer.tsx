"use client";

import { useMemo } from "react";
import { useLocale } from "next-intl";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useAppSelector } from "@/store/hooks";
import { useEnsmenuBrandingTracking } from "@/hooks/useEnsmenuBrandingTracking";
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
  const { onBrandingPointerDown } = useEnsmenuBrandingTracking();

  const displayName = menuInfo?.name?.trim() || "Arcane";
  const year = new Date().getFullYear();

  const socialLinks = useMemo(() => {
    if (!menuInfo) return [];
    const links = [
      {
        key: "facebook",
        href: menuInfo.socialFacebook?.trim(),
        icon: <FaFacebookF className="h-4 w-4" aria-hidden />,
        label: "Facebook",
      },
      {
        key: "instagram",
        href: menuInfo.socialInstagram?.trim(),
        icon: <FaInstagram className="h-4 w-4" aria-hidden />,
        label: "Instagram",
      },
      {
        key: "twitter",
        href: menuInfo.socialTwitter?.trim(),
        icon: <FaXTwitter className="h-4 w-4" aria-hidden />,
        label: "X",
      },
      {
        key: "whatsapp",
        href: menuInfo.socialWhatsapp?.trim()
          ? `https://wa.me/${menuInfo.socialWhatsapp.replace(/[^0-9]/g, "")}`
          : null,
        icon: <FaWhatsapp className="h-4 w-4" aria-hidden />,
        label: "WhatsApp",
      },
    ];
    return links.filter((link) => link.href);
  }, [menuInfo]);

  return (
    <footer className="relative mt-6 overflow-x-clip sm:mt-8" aria-label="Footer">
      <div className="relative bg-white">
        <FooterWave />
      </div>

      <div className="py-5 sm:py-6 md:py-8" style={{ backgroundColor: primary }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 sm:gap-6 sm:px-6">
          <div className="flex max-w-full items-center justify-center gap-2">
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

          {socialLinks.length > 0 ? (
            <div className="flex flex-col items-center gap-3">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/80 sm:text-xs">
                {isAr ? "تابعنا" : "Follow us"}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.key}
                    href={link.href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition hover:border-white/40 hover:bg-white/20"
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>
          ) : null}

          <div
            className={`flex w-full flex-col items-center gap-3 text-center md:flex-row md:items-center md:justify-between md:gap-4 md:text-start ${
              isAr ? "md:flex-row-reverse" : ""
            }`}
          >
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
                onPointerDown={onBrandingPointerDown}
                className="font-semibold text-white underline-offset-2 hover:underline"
              >
                ENSMenu
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
