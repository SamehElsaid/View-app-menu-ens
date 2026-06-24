"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Icon } from "./Icon";

import { WorkingHours, MenuInfo } from "@/types/menu";
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

export default function Footer({
  workingHours,
  menuInfo,
}: {
  workingHours: WorkingHours | null;
  menuInfo: MenuInfo | null;
}) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const t = useTranslations("footer");
  const menuT = useTranslations("menu");
  const { onBrandingPointerDown } = useEnsmenuBrandingTracking();

  const currentYear = new Date().getFullYear();
  const menuName = menuInfo?.name?.trim() || menuT("ourMenu");

  const footerDescription = isAr
    ? menuInfo?.footerDescriptionAr?.trim()
    : menuInfo?.footerDescriptionEn?.trim();

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
    <footer
      id="footer"
      className="scroll-mt-20 mt-16 border-t border-purple-50 bg-white py-12 sm:py-16 [overflow-anchor:none]"
    >
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex items-center justify-center gap-2 text-purple-600">
            {menuInfo?.footerLogo ? (
              <LoadImage
                src={menuInfo.footerLogo}
                alt={menuInfo?.name || ""}
                disableLazy
                fill
                className="relative h-10 w-10 rounded-full object-contain"
              />
            ) : (
              <>
                <Icon
                  name="restaurant-2-line"
                  className="text-(--text-3xl)"
                />
                <span className="text-lg font-black tracking-tighter md:text-xl">
                  {menuInfo?.name || ""}
                </span>
              </>
            )}
          </div>

          {footerDescription ? (
            <p
              dir={isAr ? "rtl" : "ltr"}
              className="mb-8 max-w-2xl text-balance wrap-break-word text-base font-medium text-zinc-500"
            >
              {footerDescription}
            </p>
          ) : null}

          {hasWorkingHours && workingHours ? (
            <div className="mb-8 w-full">
              <h4 className="mb-4 flex items-center justify-center gap-2 !text-base font-bold">
                <Icon name="time-line" className="text-xl" />
                {t("workingHours")}
              </h4>
              <div
                dir={isAr ? "rtl" : "ltr"}
                className="mx-auto inline-grid grid-cols-2 gap-x-8 gap-y-2 text-start text-base"
              >
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
                        <span className="font-medium text-red-400">
                          {t("closed")}
                        </span>
                      ) : (
                        <span dir="ltr" className="text-zinc-500">
                          {d!.open} - {d!.close}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {socialLinks.length > 0 ? (
            <div className="mb-4 w-full">
              <h4 className="mb-4 !text-base font-bold">{t("followUs")}</h4>
              <div className="flex flex-wrap items-center justify-center gap-6">
                {socialLinks.map((social) => (
                  <a
                    key={social.platform}
                    href={social.href || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-center gap-2 font-bold text-zinc-400 transition-colors hover:text-purple-600"
                    aria-label={social.platform}
                  >
                    <Icon name={social.icon} className="text-xl" />
                    <span className="capitalize">{social.platform}</span>
                    <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-purple-600 transition-all group-hover:w-full" />
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className=" border-t border-purple-50 pt-4">
          <div
            dir={isAr ? "rtl" : "ltr"}
            className="flex flex-col items-center justify-between text-center sm:flex-row sm:text-start"
          >
            <p className="text-balance wrap-break-word text-base font-medium text-zinc-400">
              {isAr ? (
                <>
                  {t("rights")}{" "}
                  <span dir="ltr">© {currentYear} {menuName}</span>
                </>
              ) : (
                <>© {currentYear} {menuName}. {t("rights")}</>
              )}
            </p>

            <p
              dir="ltr"
              className="flex items-center justify-center gap-1.5 text-base text-(--text-muted)"
            >
              <span>{t("designedBy")}</span>
              <a
                href="https://www.ensmenu.com/"
                target="_blank"
                rel="noopener noreferrer"
                onPointerDown={onBrandingPointerDown}
                className="font-semibold text-(--bg-main) transition-colors hover:underline"
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
