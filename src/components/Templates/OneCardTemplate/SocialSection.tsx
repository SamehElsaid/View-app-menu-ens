"use client";

import { useTranslations } from "next-intl";
import { useMenuSocialLinks } from "@/hooks/useMenuSocialLinks";
import { useOneCardTheme } from "./OneCardThemeContext";

export default function SocialSection() {
  const t = useTranslations("footer");
  const socialLinks = useMenuSocialLinks();
  const { primary } = useOneCardTheme();

  if (socialLinks.length === 0) return null;

  return (
    <section
      className="mt-8 px-2 md:mt-10 md:px-3 lg:mt-12"
      aria-label={t("followUs")}
    >
      <div className="mb-5 flex items-center gap-3 md:mb-6 md:gap-4 lg:mb-8">
        <span
          className="h-px flex-1"
          style={{ backgroundColor: `${primary}33` }}
          aria-hidden
        />
        <h2
          className="shrink-0 text-base font-black sm:text-lg md:text-xl lg:text-2xl"
          style={{ color: primary }}
        >
          {t("followUs")}
        </h2>
        <span
          className="h-px flex-1"
          style={{ backgroundColor: `${primary}33` }}
          aria-hidden
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:gap-5">
        {socialLinks.map((social) => {
          const SocialIcon = social.Icon;
          return (
            <a
              key={social.platform}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 rounded-2xl border border-zinc-100 bg-white px-3 py-4 text-sm font-bold text-zinc-700 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-10px_rgba(0,0,0,0.16)] sm:rounded-3xl sm:px-4 sm:py-5 md:flex-col md:gap-3 md:py-6 lg:py-7"
              aria-label={social.label}
            >
              <SocialIcon
                className="text-xl md:text-2xl lg:text-3xl"
                style={{ color: primary }}
              />
              <span className="md:text-base lg:text-lg">{social.label}</span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
