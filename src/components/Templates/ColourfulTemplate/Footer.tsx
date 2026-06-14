"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useAppSelector } from "@/store/hooks";
import type { WorkingHours } from "@/types/menu";
import { useColourfulTheme } from "./ColourfulThemeContext";
import LoadImage from "@/components/ImageLoad";
import { useEnsmenuBrandingTracking } from "@/hooks/useEnsmenuBrandingTracking";

const DAY_KEYS: (keyof WorkingHours)[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export default function Footer() {
  const locale = useLocale() as "ar" | "en";
  const t = useTranslations("footer");
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);
  const { onBrandingPointerDown } = useEnsmenuBrandingTracking();
  const { secondary } = useColourfulTheme();

  const siteName = menuInfo?.name?.trim();
  const displayName = siteName || (locale === "ar" ? "ملوّن" : "Colourful");
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

  return (
    <footer
      className="border-t border-white/10 py-6 sm:py-10"
      style={{ backgroundColor: secondary }}
      aria-label="Footer"
    >
      <div className="max-w-6xl mx-auto px-6">
        {showProBlock ? (
          <div className="mb-8 space-y-8 border-b border-white/15 pb-8 sm:mb-10 sm:space-y-10 sm:pb-10">
            {(menuInfo?.footerLogo || footerDescription) ? (
              <div>
                {menuInfo?.footerLogo ? (
                  <div className="relative mb-4 h-14 w-14 overflow-hidden rounded-lg border border-white/20">
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
                    className="max-w-2xl font-sans text-base leading-relaxed text-white/80 text-balance wrap-break-word"
                    dir={locale === "ar" ? "rtl" : "ltr"}
                  >
                    {footerDescription}
                  </p>
                ) : null}
              </div>
            ) : null}

            {(address || phone || hasWorkingHours) ? (
              <div className="grid gap-8 sm:grid-cols-2 sm:gap-10">
                {(address || phone) ? (
                  <div className="space-y-3">
                    <h3 className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-white/70">
                      {locale === "ar" ? "تواصل معنا" : "Contact"}
                    </h3>
                    {address ? (
                      <p
                        className="font-sans text-base leading-relaxed text-white/80"
                        dir={locale === "ar" ? "rtl" : "ltr"}
                      >
                        {address}
                      </p>
                    ) : null}
                    {phone ? (
                      <a
                        href={`tel:${phone.replace(/\s/g, "")}`}
                        className="inline-block font-sans text-base text-white transition-opacity hover:opacity-80"
                        dir="ltr"
                      >
                        {phone}
                      </a>
                    ) : null}
                  </div>
                ) : null}

                {hasWorkingHours && workingHours ? (
                  <div>
                    <h3 className="mb-3 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-white/70">
                      {t("workingHours")}
                    </h3>
                    <ul className="space-y-1.5 font-sans text-base text-white/80">
                      {DAY_KEYS.map((day) => {
                        const d = workingHours[day];
                        const hasHours = d && !d.closed && d.open && d.close;
                        const isClosed = d?.closed;

                        if (!hasHours && !isClosed) return null;

                        return (
                          <li
                            key={day}
                            className="flex flex-wrap justify-between gap-x-4 gap-y-0.5 border-b border-white/10 py-1 last:border-0"
                          >
                            <span className="text-white/65">
                              {t(`days.${day}`)}
                            </span>
                            {isClosed ? (
                              <span className="text-red-300/90">{t("closed")}</span>
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
                ) : null}
              </div>
            ) : null}

            {socialLinks.length > 0 ? (
              <div>
                <h3 className="mb-3 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-white/70">
                  {t("followUs")}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((link) => (
                    <a
                      key={link.key}
                      href={link.href!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition-colors hover:bg-white/20"
                      aria-label={link.key}
                    >
                      {link.icon}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {menuInfo?.logo ? (
              <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full ring-1 ring-white/25 shadow-[0_4px_14px_rgba(0,0,0,0.2)]">
                <LoadImage
                  src={menuInfo.logo}
                  alt={displayName}
                  fill
                  className="object-cover"
                  disableLazy
                />
              </div>
            ) : (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 shadow-[0_4px_14px_rgba(0,0,0,0.2)]">
                <svg
                  width="11"
                  height="11"
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
            <span className="font-body text-base font-700 text-white">
              {displayName}
            </span>
          </div>

          <p
            className="font-sans text-base text-white/75 !mb-0 text-balance wrap-break-word"
            dir="ltr"
          >
            <span>
              © {year} {displayName} .{" "}
            </span>
            <span>
              {locale === "ar" ? "جميع الحقوق محفوظة." : "All rights reserved."}
            </span>
          </p>

          <p
            dir="ltr"
            className="font-sans text-lg text-white/75 inline-flex flex-wrap items-center justify-center gap-1"
          >
            <span>Powered by </span>
            <a
              href="https://www.ensmenu.com/"
              target="_blank"
              rel="noopener noreferrer"
              dir="ltr"
              onPointerDown={onBrandingPointerDown}
              className="font-medium text-white hover:underline transition-colors shrink-0"
            >
              ENSMenu
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
