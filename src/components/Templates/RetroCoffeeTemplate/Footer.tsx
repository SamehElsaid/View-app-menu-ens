"use client";

import { useMemo } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";
import {
  IoLocationOutline,
  IoCallOutline,
  IoTimeOutline,
  IoChevronUpOutline,
} from "react-icons/io5";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import LoadImage from "@/components/ImageLoad";
import { useEnsmenuBrandingTracking } from "@/hooks/useEnsmenuBrandingTracking";
import { useAppSelector } from "@/store/hooks";
import {
  RETRO_BROWN,
  RETRO_PRIMARY,
  RETRO_SURFACE,
  RETRO_SURFACE_BORDER,
  hexToRgba,
  useCoffeeTheme,
} from "./CoffeeThemeContext";

const DAYS = [
  { key: "sunday", labelEn: "Sunday", labelAr: "الأحد" },
  { key: "monday", labelEn: "Monday", labelAr: "الإثنين" },
  { key: "tuesday", labelEn: "Tuesday", labelAr: "الثلاثاء" },
  { key: "wednesday", labelEn: "Wednesday", labelAr: "الأربعاء" },
  { key: "thursday", labelEn: "Thursday", labelAr: "الخميس" },
  { key: "friday", labelEn: "Friday", labelAr: "الجمعة" },
  { key: "saturday", labelEn: "Saturday", labelAr: "السبت" },
] as const;

function formatTime(time?: string) {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

function FooterScallop() {
  return (
    <div className="pointer-events-none leading-[0]" aria-hidden>
      <svg
        viewBox="0 0 1200 28"
        preserveAspectRatio="none"
        className="block h-4 w-full sm:h-5"
      >
        <path
          d="M0,28 L0,14 Q25,0 50,14 T100,14 T150,14 T200,14 T250,14 T300,14 T350,14 T400,14 T450,14 T500,14 T550,14 T600,14 T650,14 T700,14 T750,14 T800,14 T850,14 T900,14 T950,14 T1000,14 T1050,14 T1100,14 T1150,14 T1200,14 L1200,28 Z"
          fill={RETRO_SURFACE}
        />
        <path
          d="M0,28 L0,16 Q25,4 50,16 T100,16 T150,16 T200,16 T250,16 T300,16 T350,16 T400,16 T450,16 T500,16 T550,16 T600,16 T650,16 T700,16 T750,16 T800,16 T850,16 T900,16 T950,16 T1000,16 T1050,16 T1100,16 T1150,16 T1200,16 L1200,28 Z"
          fill={hexToRgba(RETRO_PRIMARY, 0.12)}
        />
      </svg>
    </div>
  );
}

export default function Footer() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);
  const { colors, primary } = useCoffeeTheme();
  const { onBrandingPointerDown } = useEnsmenuBrandingTracking();
  const currentYear = new Date().getFullYear();

  const menuName = menuInfo?.name?.trim() ?? "";
  const displayLogo = menuInfo?.footerLogo || menuInfo?.logo;
  const footerDescription = isAr
    ? menuInfo?.footerDescriptionAr?.trim()
    : menuInfo?.footerDescriptionEn?.trim();
  const address = isAr
    ? menuInfo?.addressAr?.trim()
    : menuInfo?.addressEn?.trim();
  const phone = menuInfo?.phone?.trim();

  const workingHours = useMemo(() => {
    const schedule = menuInfo?.workingHours;
    if (!schedule) return [];

    return DAYS.map((day) => {
      const dayHours = schedule[day.key];
      if (!dayHours || dayHours.closed) return null;
      const openTime = formatTime(dayHours.open);
      const closeTime = formatTime(dayHours.close);
      if (!openTime || !closeTime) return null;
      return {
        day: isAr ? day.labelAr : day.labelEn,
        hours: `${openTime} – ${closeTime}`,
      };
    }).filter(Boolean) as Array<{ day: string; hours: string }>;
  }, [menuInfo?.workingHours, isAr]);

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
        icon: <FaWhatsapp className="h-4 w-4" aria-hidden />,
        label: "WhatsApp",
      },
    ];
    return links.filter((link) => link.href);
  }, [menuInfo]);

  const hasAbout = Boolean(displayLogo || menuName || footerDescription);
  const hasContact = Boolean(address || phone);
  const hasContent =
    hasAbout ||
    hasContact ||
    workingHours.length > 0 ||
    socialLinks.length > 0;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToMenu = () => {
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
  };

  if (!hasContent && !menuName) return null;

  return (
    <footer id="contact" className="relative z-10 mt-2 sm:mt-4" aria-label="Footer">
      <div style={{ backgroundColor: hexToRgba(RETRO_PRIMARY, 0.08) }}>
        <FooterScallop />
      </div>

      <div
        className="border-t"
        style={{
          borderColor: RETRO_SURFACE_BORDER,
          backgroundColor: RETRO_SURFACE,
        }}
      >
        <div className="mx-auto max-w-6xl px-3 py-8 sm:px-6 sm:py-10">
          <div
            className="overflow-hidden rounded-2xl border shadow-[0_8px_24px_-12px_rgba(132,98,62,0.18)] sm:rounded-3xl"
            style={{
              borderColor: RETRO_SURFACE_BORDER,
              backgroundColor: "#faf6ee",
            }}
          >
            <div
              className="h-1 w-full"
              style={{
                background: `linear-gradient(90deg, ${hexToRgba(RETRO_PRIMARY, 0.15)} 0%, ${primary} 50%, ${hexToRgba(RETRO_PRIMARY, 0.15)} 100%)`,
              }}
              aria-hidden
            />

            <div className="grid gap-8 p-5 sm:p-7 md:grid-cols-2 lg:grid-cols-12 lg:gap-10 lg:p-8">
              {hasAbout ? (
                <div className="lg:col-span-5">
                  <Link
                    href="/"
                    className="group mb-4 flex items-center gap-3"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToTop();
                    }}
                  >
                    {displayLogo ? (
                      <div
                        className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border bg-white shadow-sm transition group-hover:scale-105"
                        style={{ borderColor: RETRO_SURFACE_BORDER }}
                      >
                        <LoadImage
                          src={displayLogo}
                          alt={menuName || "Logo"}
                          fill
                          className="object-cover"
                          disableLazy
                        />
                      </div>
                    ) : menuName ? (
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-serif text-base font-bold text-white shadow-sm"
                        style={{ backgroundColor: primary }}
                      >
                        {menuName.charAt(0)}
                      </div>
                    ) : null}

                    {menuName ? (
                      <div>
                        <span
                          className="block font-serif text-lg font-black tracking-tight sm:text-xl"
                          style={{ color: primary }}
                        >
                          {menuName}
                        </span>
                        <span
                          className="mt-0.5 block text-[11px] font-bold uppercase tracking-[0.2em]"
                          style={{ color: colors.textMuted }}
                        >
                          {isAr ? "قائمة المقهى" : "Cafe Menu"}
                        </span>
                      </div>
                    ) : null}
                  </Link>

                  {footerDescription ? (
                    <p
                      className="max-w-md text-sm leading-relaxed sm:text-[15px]"
                      style={{ color: colors.textMuted }}
                    >
                      {footerDescription}
                    </p>
                  ) : null}

                  {socialLinks.length > 0 ? (
                    <div className="mt-5">
                      <p
                        className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.18em]"
                        style={{ color: RETRO_BROWN }}
                      >
                        {isAr ? "تابعنا" : "Follow us"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {socialLinks.map((link) => (
                          <a
                            key={link.key}
                            href={link.href!}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={link.label}
                            className="retro-footer-social flex h-9 w-9 items-center justify-center rounded-full border bg-white text-sm transition hover:-translate-y-0.5 hover:text-white active:scale-95 sm:h-10 sm:w-10"
                            style={{
                              borderColor: RETRO_SURFACE_BORDER,
                              color: RETRO_BROWN,
                              ["--retro-social-hover" as string]: primary,
                            }}
                          >
                            {link.icon}
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {hasContact ? (
                <div className="lg:col-span-3">
                  <h4
                    className="mb-3 flex items-center gap-2 font-serif text-sm font-bold sm:mb-4 sm:text-base"
                    style={{ color: primary }}
                  >
                    <IoLocationOutline className="text-lg" aria-hidden />
                    {isAr ? "تواصل معنا" : "Contact"}
                  </h4>
                  <div className="space-y-3">
                    {address ? (
                      <div
                        className="rounded-xl border px-3.5 py-3"
                        style={{
                          borderColor: RETRO_SURFACE_BORDER,
                          backgroundColor: RETRO_SURFACE,
                        }}
                      >
                        <p
                          className="text-sm leading-relaxed sm:text-[15px]"
                          style={{ color: colors.textMuted }}
                          dir={isAr ? "rtl" : "ltr"}
                        >
                          {address}
                        </p>
                      </div>
                    ) : null}
                    {phone ? (
                      <a
                        href={`tel:${phone}`}
                        className="flex items-center gap-2.5 rounded-xl border px-3.5 py-3 transition hover:brightness-[0.98] active:scale-[0.99]"
                        style={{
                          borderColor: RETRO_SURFACE_BORDER,
                          backgroundColor: RETRO_SURFACE,
                          color: colors.textMuted,
                        }}
                        dir="ltr"
                      >
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
                          style={{ backgroundColor: primary }}
                        >
                          <IoCallOutline className="text-base" aria-hidden />
                        </span>
                        <span className="text-sm font-semibold sm:text-[15px]">
                          {phone}
                        </span>
                      </a>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {workingHours.length > 0 ? (
                <div className="lg:col-span-4">
                  <h4
                    className="mb-3 flex items-center gap-2 font-serif text-sm font-bold sm:mb-4 sm:text-base"
                    style={{ color: primary }}
                  >
                    <IoTimeOutline className="text-lg" aria-hidden />
                    {isAr ? "مواعيد العمل" : "Working Hours"}
                  </h4>
                  <div
                    className="overflow-hidden rounded-xl border"
                    style={{
                      borderColor: RETRO_SURFACE_BORDER,
                      backgroundColor: RETRO_SURFACE,
                    }}
                  >
                    <ul className="divide-y" style={{ borderColor: RETRO_SURFACE_BORDER }}>
                      {workingHours.map((item) => (
                        <li
                          key={item.day}
                          className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm sm:px-4 sm:py-3 sm:text-[15px]"
                        >
                          <span
                            className="font-semibold"
                            style={{ color: RETRO_BROWN }}
                          >
                            {item.day}
                          </span>
                          <span
                            className="tabular-nums"
                            style={{ color: colors.textMuted }}
                            dir="ltr"
                          >
                            {item.hours}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </div>

            <div
              className="flex flex-wrap items-center justify-center gap-2 border-t px-4 py-3 sm:px-6"
              style={{
                borderColor: RETRO_SURFACE_BORDER,
                backgroundColor: hexToRgba(RETRO_PRIMARY, 0.06),
              }}
            >
              <button
                type="button"
                onClick={scrollToMenu}
                className="rounded-full border px-4 py-1.5 text-xs font-bold transition hover:-translate-y-px active:scale-95 sm:text-sm"
                style={{
                  borderColor: RETRO_SURFACE_BORDER,
                  color: RETRO_BROWN,
                  backgroundColor: "#fff",
                }}
              >
                {isAr ? "القائمة" : "Menu"}
              </button>
              <button
                type="button"
                onClick={scrollToTop}
                className="inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-bold text-white transition hover:brightness-110 active:scale-95 sm:text-sm"
                style={{ backgroundColor: primary }}
              >
                <IoChevronUpOutline className="text-sm" aria-hidden />
                {isAr ? "أعلى الصفحة" : "Back to top"}
              </button>
            </div>
          </div>

          <div
            className="mt-6 flex flex-col items-center justify-between gap-3 text-center sm:mt-8 sm:flex-row sm:gap-4 sm:text-start"
            dir={isAr ? "rtl" : "ltr"}
          >
            {menuName ? (
              <p className="text-sm" style={{ color: colors.textMuted }}>
                {isAr ? (
                  <>
                    جميع الحقوق محفوظة.{" "}
                    <span dir="ltr">
                      © {currentYear} {menuName}
                    </span>
                  </>
                ) : (
                  <>© {currentYear} {menuName}. All rights reserved.</>
                )}
              </p>
            ) : null}

            <p
              dir="ltr"
              className="flex items-center justify-center gap-1.5 text-sm"
              style={{ color: colors.textMuted }}
            >
              <span>Powered by</span>
              <a
                href="https://www.ensmenu.com/"
                target="_blank"
                rel="noopener noreferrer"
                onPointerDown={onBrandingPointerDown}
                className="font-semibold hover:underline"
                style={{ color: primary }}
              >
                ENSMenu
              </a>
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .retro-footer-social:hover {
          background-color: var(--retro-social-hover);
          border-color: var(--retro-social-hover);
        }
      `}</style>
    </footer>
  );
}
