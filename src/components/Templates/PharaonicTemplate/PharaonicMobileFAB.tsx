"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { usePharaonicTheme, PharaonicChevron } from "./PharaonicThemeContext";
import { useIsOrderingEnabled } from "@/hooks/useIsOrderingEnabled";
import { usePharaonicTouchDevice, pharaonicHaptic } from "./usePharaonicTouchDevice";

export default function PharaonicMobileFAB() {
  const locale = useLocale();
  const { isOrderingEnabled: isTableOrder } = useIsOrderingEnabled();
  const isTouch = usePharaonicTouchDevice();
  const { primary, secondary } = usePharaonicTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isTouch) return;

    const update = () => {
      const menu = document.getElementById("menu");
      const menuTop = menu?.getBoundingClientRect().top ?? Infinity;
      const y = window.scrollY;
      setVisible(y > 120 && menuTop > window.innerHeight * 0.35);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [isTouch]);

  if (!isTouch || !visible || isTableOrder) return null;

  const label = locale === "ar" ? "اختر من المنيو" : "Choose menu";

  return (
    <a
      href="#menu"
      className="ph-mobile-fab fixed z-[90] flex min-h-[48px] items-center justify-center gap-2 rounded-full px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#0c0a08] no-underline shadow-lg transition-transform active:scale-[0.96] md:hidden"
      style={{
        background: `linear-gradient(135deg, ${primary}, ${secondary})`,
        bottom: "max(1rem, env(safe-area-inset-bottom, 0px))",
        left: "50%",
        transform: "translateX(-50%)",
        boxShadow: `0 8px 28px ${primary}66`,
      }}
      onClick={() => pharaonicHaptic([10, 30, 10])}
      aria-label={label}
    >
      <span className="text-base leading-none" aria-hidden>
        𓂀
      </span>
      <span>{label}</span>
      <PharaonicChevron size={14} />
    </a>
  );
}
