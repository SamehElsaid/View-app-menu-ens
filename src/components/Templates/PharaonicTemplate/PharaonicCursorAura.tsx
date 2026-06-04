"use client";

import { useEffect, useRef } from "react";
import { usePharaonicTheme, hexToRgba } from "./PharaonicThemeContext";
import { prefersReducedMotion } from "./pharaonicMystery";

export default function PharaonicCursorAura() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { primary, secondary } = usePharaonicTheme();

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const root = rootRef.current?.closest(".pharaonic-root") as HTMLElement | null;
    if (!root) return;

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (!finePointer) return;

    const onMove = (e: MouseEvent) => {
      const rect = root.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      root.style.setProperty("--ph-cursor-x", `${x}%`);
      root.style.setProperty("--ph-cursor-y", `${y}%`);
      root.style.setProperty("--ph-cursor-opacity", "1");
    };

    const onLeave = () => {
      root.style.setProperty("--ph-cursor-opacity", "0");
    };

    root.addEventListener("mousemove", onMove, { passive: true });
    root.addEventListener("mouseleave", onLeave);
    return () => {
      root.removeEventListener("mousemove", onMove);
      root.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed inset-0 z-[1] ph-cursor-aura motion-reduce:hidden"
      aria-hidden
      style={{
        background: `radial-gradient(520px circle at var(--ph-cursor-x, 50%) var(--ph-cursor-y, 40%), ${hexToRgba(primary, 0.14)}, ${hexToRgba(secondary, 0.06)} 35%, transparent 65%)`,
        opacity: "var(--ph-cursor-opacity, 0)",
        transition: "opacity 0.6s ease",
      }}
    />
  );
}
