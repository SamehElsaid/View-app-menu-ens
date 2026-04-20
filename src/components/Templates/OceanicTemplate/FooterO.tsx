"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useAppSelector } from "@/store/hooks";
import type { WorkingHours } from "@/types/menu";
import { resolveMenuItemImageSrc } from "@/lib/menuItemImage";

const DAY_KEYS: (keyof WorkingHours)[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const Footer = () => {
  const locale = useLocale();
  const isAr = locale === "ar";
  const t = useTranslations("footer");
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);

  const displayName = menuInfo?.name?.trim() || "Oceanic";
  const year = new Date().getFullYear();

  const footerDescription =
    locale === "ar"
      ? menuInfo?.footerDescriptionAr?.trim()
      : menuInfo?.footerDescriptionEn?.trim();

  const address =
    locale === "ar"
      ? menuInfo?.addressAr?.trim()
      : menuInfo?.addressEn?.trim();

  const phone = menuInfo?.phone?.trim();
  const workingHours = menuInfo?.workingHours ?? null;

  const logoSrc = menuInfo?.logo
    ? resolveMenuItemImageSrc(menuInfo.logo)
    : null;
  const footerLogoSrc = menuInfo?.footerLogo
    ? resolveMenuItemImageSrc(menuInfo.footerLogo)
    : null;

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

  const showExtendedBlock = !!(
    footerDescription ||
    footerLogoSrc ||
    address ||
    phone ||
    hasWorkingHours ||
    socialLinks.length > 0
  );

  return (
    <footer className="relative pt-24 pb-8 px-4 overflow-hidden bg-gradient-to-b from-[#001a23] via-[#000d14] to-[#00060a]">
      <div className="absolute top-0 left-0 right-0 h-24 pointer-events-none overflow-hidden">
        <svg
          className="absolute top-0 w-full h-full opacity-60 animate-wave"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            fill="#fdfdfd"
            fillOpacity="0.35"
            d="M0,40 C360,110 720,0 1080,55 C1260,80 1350,50 1440,40 L1440,0 L0,0 Z"
          />
        </svg>
        <svg
          className="absolute top-0 w-full h-full"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            fill="#fdfdfd"
            d="M0,20 C240,90 720,-10 1080,40 C1260,65 1350,35 1440,25 L1440,0 L0,0 Z"
          />
        </svg>
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-cyan-500/10 blur-[160px]" />
        <div className="absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full bg-sky-600/10 blur-[140px]" />
        <div className="absolute -top-16 -right-16 w-[360px] h-[360px] rounded-full bg-teal-400/10 blur-[140px]" />
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="absolute top-16 left-[14%] w-2 h-2 rounded-full bg-cyan-300/50 shadow-[0_0_14px_rgba(34,211,238,0.6)] animate-pulse" />
        <span className="absolute top-24 right-[18%] w-1.5 h-1.5 rounded-full bg-cyan-200/40 shadow-[0_0_10px_rgba(165,243,252,0.6)] animate-pulse [animation-delay:.6s]" />
        <span className="absolute bottom-28 left-[22%] w-3 h-3 rounded-full bg-sky-300/40 shadow-[0_0_18px_rgba(125,211,252,0.6)] animate-pulse [animation-delay:1.2s]" />
        <span className="absolute bottom-20 right-[14%] w-2 h-2 rounded-full bg-teal-300/40 shadow-[0_0_14px_rgba(94,234,212,0.6)] animate-pulse [animation-delay:1.8s]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center text-center"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-cyan-400/40 blur-xl" />
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.3)] overflow-hidden border border-white/20">
                {logoSrc ? (
                  <Image
                    src={logoSrc}
                    alt={displayName}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <span className="text-cyan-700 font-bold text-xl tracking-tighter">
                    {displayName.substring(0, 1) || "O"}
                  </span>
                )}
                <div className="absolute inset-0 rounded-full border border-white/20 animate-pulse pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col items-start text-start">
              <h3 className="text-xl font-bold text-white font-display tracking-tight leading-tight">
                {displayName}
              </h3>
              {menuInfo?.description ? (
                <span className="text-xs text-cyan-200/60 mt-1 line-clamp-2 max-w-md font-arabic">
                  {menuInfo.description}
                </span>
              ) : null}
            </div>
          </div>
        </motion.div>

        {showExtendedBlock ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="mt-14 space-y-10 border-t border-white/10 pt-10"
          >
            {(footerLogoSrc || footerDescription) && (
              <div
                className="text-center md:text-start max-w-2xl mx-auto md:mx-0"
                dir={isAr ? "rtl" : "ltr"}
              >
                {footerLogoSrc ? (
                  <div className="relative mb-4 h-16 w-16 mx-auto md:mx-0 overflow-hidden rounded-2xl border border-white/15 bg-white/5">
                    <Image
                      src={footerLogoSrc}
                      alt={displayName}
                      fill
                      sizes="64px"
                      className="object-contain p-2"
                    />
                  </div>
                ) : null}
                {footerDescription ? (
                  <p className="text-sm leading-relaxed text-cyan-100/75 font-arabic">
                    {footerDescription}
                  </p>
                ) : null}
              </div>
            )}

            {(address || phone || hasWorkingHours) && (
              <div className="grid gap-10 sm:grid-cols-2">
                {(address || phone) && (
                  <div
                    className="space-y-3 text-center sm:text-start"
                    dir={isAr ? "rtl" : "ltr"}
                  >
                    <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400/90">
                      {isAr ? "تواصل معنا" : "Contact"}
                    </h4>
                    {address ? (
                      <p className="text-sm text-cyan-100/70 leading-relaxed font-arabic">
                        {address}
                      </p>
                    ) : null}
                    {phone ? (
                      <a
                        href={`tel:${phone.replace(/\s/g, "")}`}
                        className="inline-block text-sm text-cyan-300 hover:text-cyan-200 transition-colors"
                        dir="ltr"
                      >
                        {phone}
                      </a>
                    ) : null}
                  </div>
                )}

                {hasWorkingHours && workingHours && (
                  <div
                    className="text-center sm:text-start"
                    dir={isAr ? "rtl" : "ltr"}
                  >
                    <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400/90">
                      {t("workingHours")}
                    </h4>
                    <ul className="space-y-1.5 text-sm text-cyan-100/75 max-w-md mx-auto sm:mx-0">
                      {DAY_KEYS.map((day) => {
                        const d = workingHours[day];
                        const hasHours = d && !d.closed && d.open && d.close;
                        const isClosed = d?.closed;

                        if (!hasHours && !isClosed) return null;

                        return (
                          <li
                            key={day}
                            className="flex flex-wrap justify-between gap-x-4 gap-y-0.5 border-b border-white/5 py-1.5 last:border-0"
                          >
                            <span className="text-cyan-200/55">
                              {t(`days.${day}`)}
                            </span>
                            {isClosed ? (
                              <span className="text-rose-300/90">
                                {t("closed")}
                              </span>
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
              <div className="text-center md:text-start">
                <h4 className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400/90">
                  {t("followUs")}
                </h4>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  {socialLinks.map((link) => (
                    <a
                      key={link.key}
                      href={link.href!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-cyan-200/90 transition-colors hover:bg-cyan-500/20 hover:border-cyan-400/40 hover:text-white"
                      aria-label={link.key}
                    >
                      {link.icon}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : null}

        <div className="mt-12 pt-6 relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p
              dir={isAr ? "rtl" : "ltr"}
              className="text-white/35 text-xs font-arabic tracking-wide text-center md:text-start"
            >
              {isAr ? (
                <>
                  {"جميع الحقوق محفوظة © "}
                  {year} {displayName}
                </>
              ) : (
                <>
                  © {year} {displayName}. All rights reserved.
                </>
              )}
            </p>

            <div
              dir={isAr ? "rtl" : "ltr"}
              className={`flex items-center gap-2 text-[10px] tracking-[0.3em] text-white/25 ${
                isAr ? "font-arabic" : "uppercase"
              }`}
            >
              <span>
                {isAr ? "تصميم وتطوير بواسطة" : "Designed & Developed by"}
              </span>
              <a
                href="https://www.facebook.com/ENSEGYPTEG"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400/70 hover:text-cyan-300 transition-colors font-bold uppercase"
              >
                ENS
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
