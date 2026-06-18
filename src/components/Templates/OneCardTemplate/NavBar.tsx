"use client";

import { useMemo } from "react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { FiGlobe } from "react-icons/fi";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useAppSelector } from "@/store/hooks";
import { useOneCardTheme } from "./OneCardThemeContext";

export default function NavBar() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);
  const { primary } = useOneCardTheme();

  const toggleLanguage = () => {
    const newLocale = locale === "ar" ? "en" : "ar";
    const query = searchParams.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`, {
      locale: newLocale,
    });
  };

  const socialLinks = useMemo(() => {
    if (!menuInfo) return [];
    return [
      {
        key: "whatsapp",
        href: menuInfo.socialWhatsapp?.trim()
          ? `https://wa.me/${menuInfo.socialWhatsapp.replace(/[^0-9]/g, "")}`
          : null,
        icon: <FaWhatsapp className="h-full w-full" aria-hidden />,
        label: "WhatsApp",
      },
      {
        key: "twitter",
        href: menuInfo.socialTwitter?.trim(),
        icon: <FaXTwitter className="h-full w-full" aria-hidden />,
        label: "X",
      },
      {
        key: "instagram",
        href: menuInfo.socialInstagram?.trim(),
        icon: <FaInstagram className="h-full w-full" aria-hidden />,
        label: "Instagram",
      },
      {
        key: "facebook",
        href: menuInfo.socialFacebook?.trim(),
        icon: <FaFacebookF className="h-full w-full" aria-hidden />,
        label: "Facebook",
      },
    ].filter((link) => link.href);
  }, [menuInfo]);

  return (
    <header className="flex items-center justify-between gap-3 px-1 pb-3 pt-2 sm:px-2 rounded-br-full rounded-bl-full  bg-white">
      {socialLinks.length > 0 ? (
        <div className="flex items-center gap-3 sm:gap-4 mr-5">
          {socialLinks.map((link) => (
            <a
              key={link.key}
              href={link.href!}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              className="flex h-[18px] w-[18px] items-center justify-center  transition hover:scale-110 hover:text-white active:scale-95 sm:h-5 sm:w-5"
            >
              {link.icon}
            </a>
          ))}
        </div>
      ) : (
        <span className="w-10" aria-hidden />
      )}

      <button
        type="button"
        onClick={toggleLanguage}
        className="inline-flex items-center gap-2 rounded-full  py-1 pe-1 ps-3.5 text-xs font-bold shadow-sm transition active:scale-95 sm:text-sm ml-5"
        style={{ color: primary }}
        aria-label={
          locale === "ar" ? "Switch to English" : "التبديل إلى العربية"
        }
      >
        <span className="leading-none">{locale === "ar" ? "EN" : "AR"}</span>
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full text-white sm:h-7 sm:w-7"
          style={{ backgroundColor: primary }}
        >
          <FiGlobe className="h-3.5 w-3.5" aria-hidden />
        </span>
      </button>
    </header>
  );
}
