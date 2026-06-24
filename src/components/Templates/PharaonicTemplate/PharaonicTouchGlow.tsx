"use client";

import { useEffect } from "react";
import { usePharaonicTheme, hexToRgba } from "./PharaonicThemeContext";
import { usePharaonicTouchDevice } from "./usePharaonicTouchDevice";
import { prefersReducedMotion } from "./pharaonicMystery";

/** Mobile/tablet: soft golden glow follows the finger (replaces desktop cursor aura) */
export default function PharaonicTouchGlow() {
  const isTouch = usePharaonicTouchDevice();
  const { primary, secondary } = usePharaonicTheme();

  useEffect(() => {
    if (!isTouch || prefersReducedMotion()) return;

    const root = document.querySelector(".pharaonic-root") as HTMLElement | null;
    if (!root) return;

    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      const rect = root.getBoundingClientRect();
      const x = ((t.clientX - rect.left) / rect.width) * 100;
      const y = ((t.clientY - rect.top) / rect.height) * 100;
      root.style.setProperty("--ph-touch-x", `${x}%`);
      root.style.setProperty("--ph-touch-y", `${y}%`);
      root.style.setProperty("--ph-touch-opacity", "0.85");
    };

    const onEnd = () => {
      root.style.setProperty("--ph-touch-opacity", "0");
    };

    root.addEventListener("touchstart", onTouch, { passive: true });
    root.addEventListener("touchmove", onTouch, { passive: true });
    root.addEventListener("touchend", onEnd, { passive: true });
    root.addEventListener("touchcancel", onEnd, { passive: true });

    return () => {
      root.removeEventListener("touchstart", onTouch);
      root.removeEventListener("touchmove", onTouch);
      root.removeEventListener("touchend", onEnd);
      root.removeEventListener("touchcancel", onEnd);
    };
  }, [isTouch]);

  if (!isTouch) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1] ph-touch-glow md:hidden"
      aria-hidden
      style={{
        background: `radial-gradient(380px circle at var(--ph-touch-x, 50%) var(--ph-touch-y, 50%), ${hexToRgba(primary, 0.2)}, ${hexToRgba(secondary, 0.08)} 40%, transparent 68%)`,
        opacity: "var(--ph-touch-opacity, 0)",
        transition: "opacity 0.35s ease",
      }}
    />
  );
}
