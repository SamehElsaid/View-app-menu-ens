"use client";

import { createContext, useContext, type ReactNode } from "react";

/** Lapis lazuli + Egyptian gold */
export const PHARAONIC_DEFAULT_PRIMARY = "#C9A227";
export const PHARAONIC_DEFAULT_SECONDARY = "#0E7C86";

type PharaonicThemeValue = {
  primary: string;
  secondary: string;
};

const PharaonicThemeContext = createContext<PharaonicThemeValue>({
  primary: PHARAONIC_DEFAULT_PRIMARY,
  secondary: PHARAONIC_DEFAULT_SECONDARY,
});

export function PharaonicThemeProvider({
  children,
  primary,
  secondary,
}: {
  children: ReactNode;
  primary: string;
  secondary: string;
}) {
  return (
    <PharaonicThemeContext.Provider value={{ primary, secondary }}>
      {children}
    </PharaonicThemeContext.Provider>
  );
}

export function usePharaonicTheme() {
  return useContext(PharaonicThemeContext);
}

export function hexToRgb(
  hex: string,
): { r: number; g: number; b: number } | null {
  const h = hex.trim().replace(/^#/, "");
  if (h.length === 3) {
    return {
      r: parseInt(h[0] + h[0], 16),
      g: parseInt(h[1] + h[1], 16),
      b: parseInt(h[2] + h[2], 16),
    };
  }
  if (h.length === 6) {
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }
  return null;
}

export function hexToRgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return `rgba(201, 162, 39, ${alpha})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

export function shadowGlow(hex: string, blurPx: number, alpha: number): string {
  return `0 0 ${blurPx}px ${hexToRgba(hex, alpha)}`;
}

export function PharaonicChevron({
  size = 16,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      className={`shrink-0 rtl:rotate-180 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
