"use client";

import { useMemo } from "react";
import { useLocale } from "next-intl";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useAppSelector } from "@/store/hooks";
import { useEnsmenuBrandingTracking } from "@/hooks/useEnsmenuBrandingTracking";
import LoadImage from "@/components/ImageLoad";

export default function Footer() {
  const locale = useLocale() as "ar" | "en";
  const isAr = locale === "ar";
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);
  const { onBrandingPointerDown } = useEnsmenuBrandingTracking();
  const displayName = menuInfo?.name?.trim() || (isAr ? "القائمة" : "Menu");
  const year = new Date().getFullYear();

  const socialLinks = useMemo(() => {
    if (!menuInfo) return [];
    const links = [
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
        icon: <FaWhatsapp className="h-3.5 w-3.5" aria-hidden />,
        label: "WhatsApp",
      },
    ];
    return links.filter((link) => link.href);
  }, [menuInfo]);

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

          {socialLinks.length > 0 ? (
            <div className="music-footer__social">
              <p className="music-footer__social-label text-brand-tomato/55">
                {isAr ? "تابعنا" : "Follow us"}
              </p>
              <div className="music-footer__social-links">
                {socialLinks.map((link) => (
                  <a
                    key={link.key}
                    href={link.href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className="music-footer__social-link text-brand-tomato"
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>
          ) : null}

          <p className="music-footer__powered text-brand-tomato/60" dir="ltr">
            <span>Powered by </span>
            <a
              href="https://www.ensmenu.com/"
              target="_blank"
              rel="noopener noreferrer"
              onPointerDown={onBrandingPointerDown}
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
