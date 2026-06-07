"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { usePharaonicTheme } from "./PharaonicThemeContext";
import { usePharaonicTouchDevice, pharaonicHaptic } from "./usePharaonicTouchDevice";

export default function PharaonicScrollCue() {
  const locale = useLocale();
  const { primary } = usePharaonicTheme();
  const isTouch = usePharaonicTouchDevice();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 48) setHidden(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (hidden) return null;

  const label = isTouch
    ? locale === "ar"
      ? "اسحب للأعلى للكشف"
      : "Swipe up to unveil"
    : locale === "ar"
      ? "مرّر للكشف"
      : "Scroll to unveil";

  return (
    <a
      href="#menu"
      className={`absolute left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 no-underline opacity-0 animate-fade-up motion-reduce:opacity-100 ${
        isTouch
          ? "bottom-14 min-h-[56px] min-w-[140px] justify-center rounded-full px-4 ph-mobile-scroll-cue [animation-delay:1.2s]"
          : "bottom-10 [animation-delay:1.2s]"
      }`}
      aria-label={locale === "ar" ? "انتقل لكشف القائمة" : "Go to unveil the menu"}
      onClick={() => {
        if (isTouch) pharaonicHaptic(12);
      }}
    >
      <span
        className={`uppercase tracking-[0.35em] ${isTouch ? "text-xs" : "text-[10px]"}`}
        style={{ color: `${primary}99` }}
      >
        {label}
      </span>
      <span
        className={`flex items-start justify-center rounded-full border ph-scroll-cue-ring ${
          isTouch ? "h-11 w-6 pt-2" : "h-9 w-5 pt-1.5"
        }`}
        style={{ borderColor: `${primary}55` }}
      >
        <span
          className={`rounded-full ph-scroll-cue-dot ${isTouch ? "h-2 w-2" : "h-1.5 w-1"}`}
          style={{ background: primary }}
        />
      </span>
    </a>
  );
}
