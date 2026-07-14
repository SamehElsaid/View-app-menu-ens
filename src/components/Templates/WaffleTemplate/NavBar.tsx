"use client";

import { useAppSelector } from "@/store/hooks";
import { useLocale } from "next-intl";
import { LanguageToggle } from "../Default/LanguageToggle";
import MenuWifiDropdown from "@/components/Global/MenuWifiDropdown";
import CallWaiterButton from "@/components/Global/CallWaiterButton";
import RateMenuButton from "@/components/Global/RateMenuButton";
import { useMenuSocialLinks } from "@/hooks/useMenuSocialLinks";
import { useOneCardTheme } from "../OneCardTemplate/OneCardThemeContext";
import LoadImage from "@/components/ImageLoad";
import { HEX_CLIP } from "./WaffleDecorations";

export default function NavBar() {
  const { primary, secondary } = useOneCardTheme();
  const locale = useLocale();
  const socialLinks = useMenuSocialLinks();
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);

  const displayName = menuInfo?.name?.trim() ?? "";

  return (
    <header dir="ltr" className="relative z-20">
      <div className="flex items-center justify-between px-1 pt-2">
        <div className="flex shrink-0 items-center gap-2">
          <div
            className="waffle-lang-pill inline-flex items-center rounded-full bg-white px-3 py-1.5 text-sm font-bold shadow-[0_4px_14px_rgba(0,0,0,0.25)]"
            style={{ color: primary }}
          >
            <LanguageToggle />
          </div>
          <RateMenuButton
            buttonClassName="bg-white/90 text-[#3d2314] shadow-[0_4px_14px_rgba(0,0,0,0.25)] hover:bg-white"
          />
          <CallWaiterButton
            buttonClassName="bg-white/90 text-[#3d2314] shadow-[0_4px_14px_rgba(0,0,0,0.25)] hover:bg-white"
            panelClassName="border-white/20 bg-[#3d2314]/95 text-white"
          />
          <MenuWifiDropdown
            buttonClassName="bg-white/90 text-[#3d2314] shadow-[0_4px_14px_rgba(0,0,0,0.25)] hover:bg-white"
            panelClassName="border-white/20 bg-[#3d2314]/95 text-white"
          />
        </div>

        {socialLinks.length > 0 ? (
          <div className="flex shrink-0 items-center gap-3">
            {socialLinks.map((social) => {
              const SocialIcon = social.Icon;
              return (
                <a
                  key={social.platform}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[17px] text-white/90 transition hover:text-white"
                  aria-label={social.label}
                >
                  <SocialIcon />
                </a>
              );
            })}
          </div>
        ) : (
          <span className="w-8 shrink-0" aria-hidden />
        )}
      </div>

      <div className="relative mx-auto mt-2 flex flex-col items-center pb-2 pt-1">
        <div
          className="absolute left-1/2 top-1/2 h-[130px] w-[130px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-2xl sm:h-[150px] sm:w-[150px]"
          style={{ backgroundColor: `${primary}55` }}
          aria-hidden
        />

        {menuInfo?.logo ? (
          <div className="relative flex h-[128px] w-[128px] items-center justify-center sm:h-[142px] sm:w-[142px]">
            <div
              className="absolute inset-[-6px] opacity-80 blur-sm"
              style={{
                background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                clipPath: HEX_CLIP,
              }}
              aria-hidden
            />
            <div
              className="absolute inset-[-2px]"
              style={{
                background: `linear-gradient(135deg, ${primary}ee, ${secondary}ee)`,
                clipPath: HEX_CLIP,
                boxShadow: `0 0 28px ${primary}99, 0 0 8px ${primary}`,
              }}
              aria-hidden
            />
            <div
              className="relative h-[88%] w-[88%] overflow-hidden bg-[#3d2314]"
              style={{ clipPath: HEX_CLIP }}
            >
              <LoadImage
                src={menuInfo.logo}
                alt={displayName || "Logo"}
                fill
                className="object-cover"
                disableLazy
              />
            </div>
          </div>
        ) : (
          <div
            className="relative flex h-[128px] w-[128px] flex-col items-center justify-center sm:h-[142px] sm:w-[142px]"
            dir={locale === "ar" ? "rtl" : "ltr"}
          >
            <div
              className="absolute inset-[-6px] opacity-80 blur-sm"
              style={{
                background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                clipPath: HEX_CLIP,
              }}
              aria-hidden
            />
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-[#3d2314] text-white"
              style={{ clipPath: HEX_CLIP }}
            >
              <span className="text-lg font-black leading-none">
                {displayName.slice(0, 6) || (locale === "ar" ? "وافل" : "Waffle")}
              </span>
              <span className="text-[9px] font-semibold tracking-[0.28em] text-white/75">
                • CAFE •
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
