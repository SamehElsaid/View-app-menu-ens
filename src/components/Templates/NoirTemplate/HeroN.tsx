"use client";

import { useLocale } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import { useNoirTheme } from "./NoirThemeContext";
import NoirChevronRight from "./NoirChevronRight";

export default function HeroN() {
  const locale = useLocale();
  const { primary, secondary } = useNoirTheme();
  const menuInfo = useAppSelector((s) => s.menu.menuInfo);
  const c = useAppSelector((s) => s.menu.menuCustomizations);

  const heroTitle =
    locale === "ar"
      ? (c?.heroTitleAr?.trim() || menuInfo?.name || "")
      : (c?.heroTitleEn?.trim() || menuInfo?.name || "");
  const heroSubtitle =
    locale === "ar"
      ? (c?.heroSubtitleAr?.trim() || menuInfo?.description || "")
      : (c?.heroSubtitleEn?.trim() || menuInfo?.description || "");

  const titleParts = heroTitle
    .split(/\n+/)
    .map((s: string) => s.trim())
    .filter(Boolean);
  const line1 = titleParts[0] ?? "";
  const line2 = titleParts[1];

  const menuLabel = menuInfo?.name?.trim() || "";

  return (
    <section className="flex flex-col items-center justify-center text-center px-8 pt-50 pb-16 relative">
      {menuLabel ? (
        <p className="font-body text-[0.7rem] tracking-[0.5em] uppercase text-cyan mb-6 opacity-0 animate-fade-up [animation-delay:0.2s]">
          — {menuLabel} —
        </p>
      ) : null}

      <h1 className="font-display text-[clamp(2.5rem,7vw,5rem)] font-light leading-none tracking-tight mb-4 opacity-0 animate-fade-up [animation-delay:0.4s]">
        {line2 ? (
          <>
            <span>{line1}</span>
            <em className="italic block text-lavender">{line2}</em>
          </>
        ) : (
          <span>{line1}</span>
        )}
      </h1>

      {heroSubtitle ? (
        <p className="font-display italic text-lg text-text-secondary max-w-[500px] leading-relaxed mb-12 opacity-0 animate-fade-up [animation-delay:0.6s]">
          {heroSubtitle}
        </p>
      ) : null}

      <div
        className="w-20 h-px mb-12 opacity-0 animate-fade-up [animation-delay:0.8s]"
        style={{
          background: `linear-gradient(to right, transparent, ${primary}, ${secondary}, transparent)`,
        }}
      />

      <a
        href="#menu"
        className="font-body inline-flex items-center gap-3 text-white text-sm tracking-[0.2em] uppercase no-underline py-4 px-10 rounded-[3px] cursor-pointer transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.97] opacity-0 animate-fade-up [animation-delay:1s]"
        style={{
          background: `linear-gradient(to bottom right, ${primary}, ${secondary})`,
          boxShadow: `0 0 30px ${primary}4d`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = `0 0 50px ${primary}80, 0 0 20px ${secondary}4d`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = `0 0 30px ${primary}4d`;
        }}
      >
        <span>{locale === "ar" ? "استكشف القائمة" : "Explore Menu"}</span>
        <NoirChevronRight size={16} />
      </a>
    </section>
  );
}
