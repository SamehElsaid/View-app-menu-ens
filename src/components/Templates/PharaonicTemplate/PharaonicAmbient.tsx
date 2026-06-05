"use client";

import { useMemo } from "react";
import { usePharaonicTheme, hexToRgba } from "./PharaonicThemeContext";
import { usePharaonicTouchDevice } from "./usePharaonicTouchDevice";

const DUST_COUNT_DESKTOP = 28;
const DUST_COUNT_MOBILE = 14;

export default function PharaonicAmbient() {
  const { primary, secondary } = usePharaonicTheme();
  const isTouch = usePharaonicTouchDevice();
  const dustCount = isTouch ? DUST_COUNT_MOBILE : DUST_COUNT_DESKTOP;

  const dust = useMemo(
    () =>
      Array.from({ length: dustCount }, (_, i) => ({
        id: i,
        left: `${(i * 37 + 11) % 100}%`,
        top: `${(i * 53 + 7) % 100}%`,
        size: 1 + (i % 3),
        delay: `${(i % 12) * 0.65}s`,
        duration: `${14 + (i % 9)}s`,
      })),
    [dustCount],
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0 ph-mist-layer"
        style={{
          background: `
            radial-gradient(ellipse 90% 60% at 50% 100%, ${hexToRgba(secondary, 0.22)}, transparent 70%),
            radial-gradient(circle at 20% 20%, ${hexToRgba(primary, 0.08)}, transparent 45%),
            radial-gradient(circle at 80% 30%, ${hexToRgba(secondary, 0.06)}, transparent 40%)
          `,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 50%, transparent 35%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      {dust.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full ph-dust-particle"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: hexToRgba(primary, 0.35),
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
}
