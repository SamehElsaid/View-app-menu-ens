"use client";

import { useTranslations } from "next-intl";
import { useMenuSocialLinks } from "@/hooks/useMenuSocialLinks";
import { useOneCardTheme } from "../OneCardTemplate/OneCardThemeContext";

const PLATFORM_LABEL: Record<string, string> = {
  whatsapp: "Whatsapp",
  twitter: "Twitter X",
  instagram: "Instagram",
  facebook: "Facebook",
};

const PLATFORM_ICON_BG: Record<string, string> = {
  whatsapp: "#25D366",
  twitter: "#000000",
  instagram: "#E1306C",
  facebook: "#1877F2",
};

export default function SocialSection() {
  const t = useTranslations("footer");
  const socialLinks = useMenuSocialLinks();
  const { primary } = useOneCardTheme();

  if (socialLinks.length === 0) return null;

  return (
    <section className="mt-8 px-1" aria-label={t("followUs")}>
      <div className="mb-5 flex items-center justify-center gap-3">
        <span
          className="inline-flex items-center gap-[3px] text-(--vanilla-gold,#b8893a)"
          aria-hidden
        >
          <span className="h-px w-6 bg-current" />
          <span className="h-1.5 w-1.5 rotate-45 border border-current" />
        </span>
        <h2 className="shrink-0 text-lg font-black" style={{ color: primary }}>
          {t("followUs")}
        </h2>
        <span
          className="inline-flex items-center gap-[3px] text-(--vanilla-gold,#b8893a)"
          aria-hidden
        >
          <span className="h-1.5 w-1.5 rotate-45 border border-current" />
          <span className="h-px w-6 bg-current" />
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {socialLinks.map((social) => {
          const SocialIcon = social.Icon;
          return (
            <a
              key={social.platform}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-2xl border border-(--vanilla-gold,#b8893a)/20 bg-white px-3 py-3 text-sm font-bold text-zinc-700 shadow-[0_8px_22px_-14px_rgba(70,25,110,0.4)] transition hover:-translate-y-0.5"
              aria-label={social.label}
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
                style={{
                  backgroundColor:
                    PLATFORM_ICON_BG[social.platform] ?? primary,
                }}
              >
                <SocialIcon className="text-base" />
              </span>
              <span className="truncate">
                {PLATFORM_LABEL[social.platform] ?? social.label}
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
