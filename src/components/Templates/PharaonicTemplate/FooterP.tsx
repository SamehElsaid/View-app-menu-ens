"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useAppSelector } from "@/store/hooks";
import type { WorkingHours } from "@/types/menu";
import LoadImage from "@/components/ImageLoad";
import { useEnsmenuBrandingTracking } from "@/hooks/useEnsmenuBrandingTracking";
import { usePharaonicTheme, hexToRgba } from "./PharaonicThemeContext";
import { HieroglyphBorder } from "./PharaonicDecor";

const DAY_KEYS: (keyof WorkingHours)[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export default function FooterP() {
  const locale = useLocale();
  const t = useTranslations("footer");
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);
  const { primary, secondary } = usePharaonicTheme();
  const { onBrandingPointerDown } = useEnsmenuBrandingTracking();

  const displayName = menuInfo?.name?.trim() || "Menu";
  const year = new Date().getFullYear();
  const ownerPlan = menuInfo?.ownerPlanType;
  const isPro = ownerPlan != null && ownerPlan !== "" && ownerPlan !== "free";

  const footerDescription =
    locale === "ar"
      ? menuInfo?.footerDescriptionAr?.trim()
      : menuInfo?.footerDescriptionEn?.trim();

  const address =
    locale === "ar" ? menuInfo?.addressAr?.trim() : menuInfo?.addressEn?.trim();

  const phone = menuInfo?.phone?.trim();
  const workingHours = menuInfo?.workingHours ?? null;

  const hasWorkingHours = useMemo(() => {
    if (!workingHours) return false;
    return DAY_KEYS.some((day) => {
      const d = workingHours[day];
      return d && (d.closed || (d.open && d.close));
    });
  }, [workingHours]);

  const socialLinks = useMemo(() => {
    if (!menuInfo) return [];
    const links = [
      {
        key: "facebook",
        href: menuInfo.socialFacebook?.trim(),
        icon: <FaFacebookF className="h-4 w-4" aria-hidden />,
      },
      {
        key: "instagram",
        href: menuInfo.socialInstagram?.trim(),
        icon: <FaInstagram className="h-4 w-4" aria-hidden />,
      },
      {
        key: "twitter",
        href: menuInfo.socialTwitter?.trim(),
        icon: <FaXTwitter className="h-4 w-4" aria-hidden />,
      },
      {
        key: "whatsapp",
        href: menuInfo.socialWhatsapp?.trim()
          ? `https://wa.me/${menuInfo.socialWhatsapp.replace(/[^0-9]/g, "")}`
          : null,
        icon: <FaWhatsapp className="h-4 w-4" aria-hidden />,
      },
    ];
    return links.filter((l) => l.href);
  }, [menuInfo]);

  const showProBlock =
    isPro &&
    !!(
      footerDescription ||
      menuInfo?.footerLogo ||
      address ||
      phone ||
      hasWorkingHours ||
      socialLinks.length > 0
    );

  const borderColor = hexToRgba(primary, 0.2);

  return (
    <footer className="px-4 py-10 sm:px-8" style={{ borderTop: `1px solid ${borderColor}` }}>
      <HieroglyphBorder className="mb-8 opacity-35" />
      <div className="mx-auto max-w-[1200px]">
        {showProBlock && (
          <div className="mb-10 space-y-10 pb-10" style={{ borderBottom: `1px solid ${borderColor}` }}>
            {(menuInfo?.footerLogo || footerDescription) && (
              <div>
                {menuInfo?.footerLogo ? (
                  <div
                    className="relative mb-4 h-14 w-14 overflow-hidden rounded-sm"
                    style={{ border: `1px solid ${borderColor}` }}
                  >
                    <LoadImage
                      src={menuInfo.footerLogo}
                      alt={displayName}
                      fill
                      className="object-contain p-1"
                      disableLazy
                    />
                  </div>
                ) : null}
                {footerDescription ? (
                  <p
                    className="max-w-2xl text-sm leading-relaxed text-[#c4b59a]"
                    dir={locale === "ar" ? "rtl" : "ltr"}
                  >
                    {footerDescription}
                  </p>
                ) : null}
              </div>
            )}

            {(address || phone || hasWorkingHours) && (
              <div className="grid gap-10 sm:grid-cols-2">
                {(address || phone) && (
                  <div className="space-y-3">
                    <h3
                      className="text-[0.65rem] font-semibold uppercase tracking-[0.25em]"
                      style={{ color: secondary }}
                    >
                      {locale === "ar" ? "تواصل معنا" : "Contact"}
                    </h3>
                    {address ? (
                      <p className="text-sm text-[#c4b59a]" dir={locale === "ar" ? "rtl" : "ltr"}>
                        {address}
                      </p>
                    ) : null}
                    {phone ? (
                      <a
                        href={`tel:${phone.replace(/\s/g, "")}`}
                        className="inline-block text-sm transition-opacity hover:opacity-80"
                        style={{ color: primary }}
                        dir="ltr"
                      >
                        {phone}
                      </a>
                    ) : null}
                  </div>
                )}

                {hasWorkingHours && workingHours && (
                  <div>
                    <h3
                      className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.25em]"
                      style={{ color: secondary }}
                    >
                      {t("workingHours")}
                    </h3>
                    <ul className="space-y-1.5 text-sm text-[#c4b59a]">
                      {DAY_KEYS.map((day) => {
                        const d = workingHours[day];
                        const hasHours = d && !d.closed && d.open && d.close;
                        const isClosed = d?.closed;
                        if (!hasHours && !isClosed) return null;
                        return (
                          <li
                            key={day}
                            className="flex flex-wrap justify-between gap-x-4 py-1"
                            style={{ borderBottom: `1px solid ${hexToRgba(primary, 0.08)}` }}
                          >
                            <span>{t(`days.${day}`)}</span>
                            {isClosed ? (
                              <span className="text-red-400/90">{t("closed")}</span>
                            ) : (
                              <span dir="ltr" className="tabular-nums">
                                {d!.open} – {d!.close}
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {socialLinks.length > 0 && (
              <div>
                <h3
                  className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.25em]"
                  style={{ color: secondary }}
                >
                  {t("followUs")}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((link) => (
                    <a
                      key={link.key}
                      href={link.href!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-sm transition-opacity hover:opacity-80"
                      style={{
                        border: `1px solid ${borderColor}`,
                        color: primary,
                        background: hexToRgba(primary, 0.08),
                      }}
                      aria-label={link.key}
                    >
                      {link.icon}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <span className="text-sm tracking-[0.3em] text-[#a89880]">{displayName}</span>
          <p className="text-center text-sm text-[#8a7d68]">
            {locale === "ar"
              ? `© ${year} ${displayName}. جميع الحقوق محفوظة.`
              : `© ${year} ${displayName}. All rights reserved.`}
          </p>
          <p dir="ltr" className="flex items-center gap-1 text-sm text-[#8a7d68]">
            Powered by
            <a
              href="https://www.ensmenu.com/"
              target="_blank"
              rel="noopener noreferrer"
              onPointerDown={onBrandingPointerDown}
              className="font-medium transition-opacity hover:underline"
              style={{ color: primary }}
            >
              ENSMenu
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
