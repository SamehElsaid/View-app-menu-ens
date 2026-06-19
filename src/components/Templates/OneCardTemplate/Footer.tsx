"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useEnsmenuBrandingTracking } from "@/hooks/useEnsmenuBrandingTracking";
import { useAppSelector } from "@/store/hooks";
import { useOneCardTheme } from "./OneCardThemeContext";

export default function Footer() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);
  const { primary } = useOneCardTheme();
  const { onBrandingPointerDown } = useEnsmenuBrandingTracking();
  const currentYear = new Date().getFullYear();
  const menuName = menuInfo?.name?.trim() ?? "";

  const socialLinks = useMemo(() => {
    if (!menuInfo) return [];
    return [
      {
        key: "facebook",
        href: menuInfo.socialFacebook?.trim(),
        icon: <FaFacebookF className="h-3.5 w-3.5" aria-hidden />,
        label: "Facebook",
      },
      {
        key: "instagram",
        href: menuInfo.socialInstagram?.trim(),
        icon: <FaInstagram className="h-3.5 w-3.5" aria-hidden />,
        label: "Instagram",
      },
      {
        key: "twitter",
        href: menuInfo.socialTwitter?.trim(),
        icon: <FaXTwitter className="h-3.5 w-3.5" aria-hidden />,
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
    ].filter((link) => link.href);
  }, [menuInfo]);

  return (
    <footer
      className="mt-3 rounded-tr-[6rem] rounded-tl-[6rem] bg-white px-4 pb-5 pt-8 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.4)] sm:px-6"
      aria-label="Footer"
    >
      <div className="mx-auto  text-center">
        {socialLinks.length > 0 ? (
          <>
            <h4 className="mb-4 text-sm font-semibold text-zinc-500">
              {isAr ? "تابعنا" : "Follow us"}
            </h4>
            <div className="mb-6 flex flex-wrap items-center justify-center gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.key}
                  href={link.href!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 transition hover:text-zinc-900"
                >
                  {link.icon}
                  <span>{link.label}</span>
                </a>
              ))}
            </div>
          </>
        ) : null}

        <hr className="my-4 border-zinc-200 dark:border-zinc-700" />

        <div className="flex items-center justify-between gap-2 w-full">
          {menuName ? (
            <p
              className="text-xs text-zinc-500 mb-0!"
              dir={isAr ? "rtl" : "ltr"}
            >
              {isAr ? (
                <>
                  © جميع الحقوق محفوظة. {menuName} {currentYear}
                </>
              ) : (
                <>
                  © {currentYear} {menuName}. All rights reserved.
                </>
              )}
            </p>
          ) : null}

          <p dir="ltr" className="text-xs text-zinc-500">
            <span>Powered by</span>
            <Link
              href="https://www.ensmenu.com/"
              target="_blank"
              rel="noopener noreferrer"
              onPointerDown={onBrandingPointerDown}
              className="font-semibold hover:underline"
              style={{ color: primary }}
            >
              ENSMenu
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
