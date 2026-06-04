"use client";

import { useLocale } from "next-intl";
import { usePharaonicTheme, PharaonicChevron, shadowGlow } from "./PharaonicThemeContext";
import { usePharaonicTouchDevice, pharaonicHaptic } from "./usePharaonicTouchDevice";

type PharaonicMenuCtaProps = {
  variant?: "nav" | "hero";
  className?: string;
};

export default function PharaonicMenuCta({
  variant = "nav",
  className = "",
}: PharaonicMenuCtaProps) {
  const locale = useLocale();
  const { primary, secondary } = usePharaonicTheme();
  const isTouch = usePharaonicTouchDevice();

  const label =
    locale === "ar" ? "اختر من المنيو" : "Choose from menu";

  const isHero = variant === "hero";

  return (
    <a
      href="#menu"
      className={
        isHero
          ? `mt-10 inline-flex items-center justify-center gap-3 rounded-sm text-sm font-medium uppercase tracking-[0.22em] text-[#0c0a08] no-underline transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] opacity-0 animate-fade-up [animation-delay:0.9s] motion-reduce:opacity-100 ${
              isTouch ? "min-h-[52px] w-full max-w-xs px-8 py-4" : "px-10 py-4"
            } ${className}`
          : `inline-flex shrink-0 items-center justify-center gap-1.5 rounded-sm px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#0c0a08] no-underline transition-all active:scale-95 hover:opacity-95 sm:gap-2 sm:px-4 sm:text-xs ${className}`
      }
      style={{
        background: `linear-gradient(135deg, ${primary}, ${secondary})`,
        boxShadow: isHero
          ? `0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.25)`
          : shadowGlow(primary, 14, 0.3),
      }}
      onClick={() => {
        if (isTouch) pharaonicHaptic(isHero ? [8, 24, 8] : 10);
      }}
    >
      <span className="text-sm leading-none opacity-90" aria-hidden>
        𓇳
      </span>
      <span className={isHero ? "" : "max-w-[7.5rem] truncate sm:max-w-none"}>
        {label}
      </span>
      <PharaonicChevron size={isHero ? 16 : 12} />
    </a>
  );
}
