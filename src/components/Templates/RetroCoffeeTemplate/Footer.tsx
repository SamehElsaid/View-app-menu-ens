"use client";

import { useLocale } from "next-intl";
import Link from "next/link";
import { IoLocationOutline, IoCallOutline } from "react-icons/io5";
import LoadImage from "@/components/ImageLoad";
import { useEnsmenuBrandingTracking } from "@/hooks/useEnsmenuBrandingTracking";
import { useAppSelector } from "@/store/hooks";
import {
  RETRO_SURFACE,
  RETRO_SURFACE_BORDER,
  useCoffeeTheme,
} from "./CoffeeThemeContext";

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

  const formatTime = (time?: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const daysOfWeek = [
    { key: "sunday", label: isAr ? "الأحد" : "Sunday" },
    { key: "monday", label: isAr ? "الإثنين" : "Monday" },
    { key: "tuesday", label: isAr ? "الثلاثاء" : "Tuesday" },
    { key: "wednesday", label: isAr ? "الأربعاء" : "Wednesday" },
    { key: "thursday", label: isAr ? "الخميس" : "Thursday" },
    { key: "friday", label: isAr ? "الجمعة" : "Friday" },
    { key: "saturday", label: isAr ? "السبت" : "Saturday" },
  ] as const;

  const workingHours = menuInfo?.workingHours;
  const displayWorkingHours = workingHours
    ? daysOfWeek
        .map((day) => {
          const dayHours = workingHours[day.key];
          if (!dayHours || dayHours.closed) return null;
          const openTime = formatTime(dayHours.open);
          const closeTime = formatTime(dayHours.close);
          if (openTime && closeTime) {
            return { day: day.label, hours: `${openTime} - ${closeTime}` };
          }
          return null;
        })
        .filter(Boolean)
    : [];

  const socialLinks = [
    { platform: "facebook", url: menuInfo?.socialFacebook },
    { platform: "instagram", url: menuInfo?.socialInstagram },
    { platform: "twitter", url: menuInfo?.socialTwitter },
    {
      platform: "whatsapp",
      url: menuInfo?.socialWhatsapp
        ? `https://wa.me/${menuInfo.socialWhatsapp.replace(/[^0-9]/g, "")}`
        : null,
    },
  ].filter((link) => link.url?.trim());

  const hasAbout = Boolean(displayLogo || menuName || footerDescription);
  const hasContact = Boolean(address || phone);
  const hasContent =
    hasAbout || hasContact || displayWorkingHours.length > 0 || socialLinks.length > 0;

  if (!hasContent && !menuName) return null;

  return (
    <footer
      id="contact"
      className="relative z-10 border-t"
      style={{
        borderColor: RETRO_SURFACE_BORDER,
        backgroundColor: RETRO_SURFACE,
      }}
    >
      <div className="mx-auto max-w-6xl px-3 py-8 sm:px-6 sm:py-10">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {hasAbout ? (
            <div className="md:col-span-1 lg:col-span-2">
              <Link
                href="/"
                className="mb-4 flex items-center gap-3"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                {displayLogo ? (
                  <div
                    className="relative h-10 w-10 overflow-hidden rounded-full border bg-white"
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
                    className="flex h-10 w-10 items-center justify-center rounded-full font-serif text-sm font-bold text-white"
                    style={{ backgroundColor: primary }}
                  >
                    {menuName.charAt(0)}
                  </div>
                ) : null}
                {menuName ? (
                  <span
                    className="font-serif text-lg font-semibold md:text-xl"
                    style={{ color: primary }}
                  >
                    {menuName}
                  </span>
                ) : null}
              </Link>
              {footerDescription ? (
                <p
                  className="max-w-md text-sm leading-relaxed sm:text-base"
                  style={{ color: colors.textMuted }}
                >
                  {footerDescription}
                </p>
              ) : null}
            </div>
          ) : null}

          {hasContact ? (
            <div>
              <h4
                className="mb-3 font-serif text-sm font-bold sm:mb-4 sm:text-base"
                style={{ color: primary }}
              >
                {isAr ? "تواصل معنا" : "Contact"}
              </h4>
              <div className="space-y-2.5 sm:space-y-3">
                {address ? (
                  <div className="flex items-start gap-2">
                    <IoLocationOutline
                      className="mt-0.5 shrink-0 text-base sm:text-lg"
                      style={{ color: primary }}
                    />
                    <p
                      className="text-sm sm:text-base"
                      style={{ color: colors.textMuted }}
                      dir={isAr ? "rtl" : "ltr"}
                    >
                      {address}
                    </p>
                  </div>
                ) : null}
                {phone ? (
                  <div className="flex items-center gap-2">
                    <IoCallOutline
                      className="shrink-0 text-base sm:text-lg"
                      style={{ color: primary }}
                    />
                    <a
                      href={`tel:${phone}`}
                      className="text-sm transition hover:opacity-80 sm:text-base"
                      style={{ color: colors.textMuted }}
                      dir="ltr"
                    >
                      {phone}
                    </a>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {displayWorkingHours.length > 0 ? (
            <div>
              <h4
                className="mb-3 font-serif text-sm font-bold sm:mb-4 sm:text-base"
                style={{ color: primary }}
              >
                {isAr ? "مواعيد العمل" : "Working Hours"}
              </h4>
              <div className="space-y-1.5 sm:space-y-2">
                {displayWorkingHours.map(
                  (item) =>
                    item && (
                      <div
                        key={item.day}
                        className="text-sm sm:text-base"
                        style={{ color: colors.textMuted }}
                      >
                        <span
                          className="font-medium"
                          style={{ color: primary }}
                        >
                          {item.day}:
                        </span>{" "}
                        {item.hours}
                      </div>
                    ),
                )}
              </div>
            </div>
          ) : null}

          {socialLinks.length > 0 ? (
            <div>
              <h4
                className="mb-3 font-serif text-sm font-bold sm:mb-4 sm:text-base"
                style={{ color: primary }}
              >
                {isAr ? "تابعنا" : "Follow Us"}
              </h4>
              <div className="flex flex-wrap gap-2.5 sm:gap-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.platform}
                    href={link.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold uppercase transition hover:text-white sm:h-10 sm:w-10 sm:text-sm"
                    style={{
                      borderColor: RETRO_SURFACE_BORDER,
                      color: colors.text,
                      backgroundColor: "#fff",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = primary;
                      e.currentTarget.style.borderColor = primary;
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#fff";
                      e.currentTarget.style.borderColor = RETRO_SURFACE_BORDER;
                      e.currentTarget.style.color = colors.text;
                    }}
                    aria-label={link.platform}
                  >
                    {link.platform.charAt(0)}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div
          className="mt-3 border-t pt-4 sm:mt-5 sm:pt-6"
          style={{ borderColor: RETRO_SURFACE_BORDER }}
        >
          <div
            dir={isAr ? "rtl" : "ltr"}
            className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:gap-4 sm:text-start"
          >
            {menuName ? (
              <p
                className="text-sm sm:text-base"
                style={{ color: colors.textMuted }}
              >
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
              className="flex items-center justify-center gap-1.5 text-sm sm:text-base"
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
    </footer>
  );
}
