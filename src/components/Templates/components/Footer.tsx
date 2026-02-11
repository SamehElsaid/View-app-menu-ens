"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Icon } from "./Icon";

import { WorkingHours, MenuInfo } from "@/types/menu";
import LoadImage from "@/components/ImageLoad";

const DAY_KEYS: (keyof WorkingHours)[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export default function Footer({
  workingHours,
  menuInfo,
}: {
  workingHours: WorkingHours | null;
  menuInfo: MenuInfo | null;
}) {
  const locale = useLocale();
  const t = useTranslations("footer");
  const menuT = useTranslations("menu");

  const currentYear = new Date().getFullYear();

  // Check if there are any working hours set
  const hasWorkingHours = useMemo(() => {
    if (!workingHours) return false;
    return DAY_KEYS.some((day) => {
      const d = workingHours[day];
      return d && (d.closed || (d.open && d.close));
    });
  }, [workingHours]);

  const socialLinks = useMemo(() => {
    const links = [
      {
        icon: "facebook-circle-line",
        href: menuInfo?.socialFacebook,
        platform: "facebook",
      },
      {
        icon: "instagram-line",
        href: menuInfo?.socialInstagram,
        platform: "instagram",
      },
      {
        icon: "twitter-x-line",
        href: menuInfo?.socialTwitter,
        platform: "twitter",
      },
      {
        icon: "whatsapp-fill",
        href: menuInfo?.socialWhatsapp
          ? `https://wa.me/${menuInfo.socialWhatsapp.replace(/[^0-9]/g, "")}`
          : null,
        platform: "whatsapp",
      },
    ];
    return links.filter((link) => link.href && link.href.trim() !== "");
  }, [menuInfo]);

  return (
    <footer className="py-16 bg-white border-t border-purple-50 text-center mt-20">
      <div className="flex items-center justify-center gap-2 text-purple-600 mb-8">
        <div className="text-2xl font-black tracking-tighter flex items-center gap-2 justify-center">
          {menuInfo?.footerLogo ? (
            <LoadImage
              src={menuInfo?.footerLogo || ""}
              alt={menuInfo?.name || ""}
              disableLazy={true}
              fill
              className="relative w-10 h-10 rounded-full object-contain transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <>
              <Icon
                name="restaurant-2-line"
                className="relative text-(--text-3xl) transition-transform duration-300 group-hover:scale-110"
              />
              <span className="text-2xl font-black tracking-tighter">
                {menuInfo?.name || ""}
              </span>
            </>
          )}
        </div>
      </div>

      {menuInfo?.footerDescriptionAr && (
        <p className="mb-8 text-zinc-500 font-medium max-w-xl mx-auto px-4">
          {locale === "ar"
            ? menuInfo?.footerDescriptionAr
            : menuInfo?.footerDescriptionEn || ""}
        </p>
      )}

      {/* Working Hours */}
      {hasWorkingHours && workingHours && (
        <div className="mt-8 mb-8">
          <h4 className="text-lg font-bold mb-4 flex items-center justify-center gap-2">
            <Icon name="time-line" className="text-xl" />
            {t("workingHours")}
          </h4>
          <div className="inline-grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-start">
            {DAY_KEYS.map((day) => {
              const d = workingHours[day];
              const hasHours = d && !d.closed && d.open && d.close;
              const isClosed = d?.closed;

              if (!hasHours && !isClosed) return null;

              return (
                <div key={day} className="contents">
                  <span className="font-semibold text-zinc-700">
                    {t(`days.${day}`)}
                  </span>
                  {isClosed ? (
                    <span className="text-red-400 font-medium">
                      {t("closed")}
                    </span>
                  ) : (
                    <span className="text-zinc-500">
                      {d!.open} - {d!.close}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {socialLinks.length > 0 && (
        <div className="mt-8">
          <h4 className="text-lg font-bold mb-4">{t("followUs")}</h4>
          <div className="flex justify-center gap-8">
            {socialLinks.map((social) => (
              <a
                key={social.platform}
                href={social.href || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 font-bold hover:text-purple-600 transition-colors relative group"
              >
                <Icon name={social.icon} className="text-xl" />
                {social.platform}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 transition-all group-hover:w-full" />
              </a>
            ))}
          </div>
        </div>
      )}

      <p className="mt-8 text-zinc-400 font-medium">
        © {currentYear} {menuT("ourMenu")}. {t("rights")}
      </p>

      <p
        className="
        flex items-center justify-center
        gap-1 mt-2
        text-xs sm:text-sm
        text-(--text-muted)
      "
      >
        <span>{t("designedBy")}</span>
        <a
          href="https://www.facebook.com/ENSEGYPTEG"
          target="_blank"
          rel="noopener noreferrer"
          className="
            font-semibold
            text-(--bg-main)
            hover:underline
            transition
          "
        >
          ENS
        </a>
      </p>
    </footer>
  );
}
