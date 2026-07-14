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

export default function NavBar() {
  const { primary } = useOneCardTheme();
  const locale = useLocale();
  const socialLinks = useMenuSocialLinks();
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);

  const displayName = menuInfo?.name?.trim() ?? "";

  return (
    <header
      dir="ltr"
      className="relative z-20 flex items-center justify-between gap-3 px-3 pt-2"
    >
      <div className="flex shrink-0 items-center gap-1.5">
        <div
          className="vanilla-lang-pill inline-flex items-center gap-1.5 rounded-full bg-white px-2 py-1.5 text-sm font-bold shadow-[0_4px_14px_-6px_rgba(60,30,90,0.25)]"
          style={{ color: primary }}
        >
          <LanguageToggle />
        </div>
        <RateMenuButton
          buttonClassName="border border-(--vanilla-gold,#b8893a)/35 bg-white/80 text-[15px] hover:bg-white"
          iconClassName="text-[16px]"
        />
        <CallWaiterButton
          buttonClassName="border border-(--vanilla-gold,#b8893a)/35 bg-white/80 text-[15px] hover:bg-white"
          panelClassName="border-(--vanilla-gold,#b8893a)/25 bg-white text-zinc-800"
          iconClassName="text-[16px]"
        />
        <MenuWifiDropdown
          buttonClassName="border border-(--vanilla-gold,#b8893a)/35 bg-white/80 text-[15px] hover:bg-white"
          panelClassName="border-(--vanilla-gold,#b8893a)/25 bg-white text-zinc-800"
          iconClassName="text-[16px]"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col items-center justify-center text-center">
        {menuInfo?.logo ? (
          <div className="relative h-[78px] w-[120px] max-[380px]:h-16 max-[380px]:w-[100px]">
            <LoadImage
              src={menuInfo.logo}
              alt={displayName || "Logo"}
              fill
              className="object-contain"
              disableLazy
            />
          </div>
        ) : (
          <div
            className="flex flex-col items-center gap-1 leading-none"
            style={{ color: primary }}
            dir={locale === "ar" ? "rtl" : "ltr"}
          >
            <span className="text-xl font-black tracking-wide max-[380px]:text-lg">
              {displayName || (locale === "ar" ? "قائمتنا" : "Our Menu")}
            </span>
            <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-(--vanilla-gold,#b8893a) before:h-px before:w-4 before:bg-(--vanilla-gold,#b8893a) after:h-px after:w-4 after:bg-(--vanilla-gold,#b8893a)">
              CAFÉ
            </span>
          </div>
        )}
      </div>

      {socialLinks.length > 0 ? (
        <div className="flex shrink-0 items-center gap-1.5 max-[380px]:gap-1">
          {socialLinks.map((social) => {
            const SocialIcon = social.Icon;
            return (
              <a
                key={social.platform}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-(--vanilla-gold,#b8893a)/35 bg-white/80 text-[15px] transition-all duration-200 hover:scale-105 hover:bg-white max-[380px]:h-8 max-[380px]:w-8"
                style={{ color: primary }}
                aria-label={social.label}
              >
                <SocialIcon />
              </a>
            );
          })}
        </div>
      ) : (
        <span className="w-5 shrink-0" aria-hidden />
      )}
    </header>
  );
}
