"use client";

import { createContext, useContext, type ReactNode } from "react";

/** Noir template palette (violet / cyan) */
export const NOIR_DEFAULT_PRIMARY = "#7c3aed";
export const NOIR_DEFAULT_SECONDARY = "#06b6d4";

type NoirThemeValue = {
  primary: string;
  secondary: string;
};

const NoirThemeContext = createContext<NoirThemeValue>({
  primary: NOIR_DEFAULT_PRIMARY,
  secondary: NOIR_DEFAULT_SECONDARY,
});

export function NoirThemeProvider({
  children,
  primary,
  secondary,
}: {
  children: ReactNode;
  primary: string;
  secondary: string;
}) {
  return (
    <NoirThemeContext.Provider value={{ primary, secondary }}>
      {children}
    </NoirThemeContext.Provider>
  );
}

export function useNoirTheme() {
  return useContext(NoirThemeContext);
}

/** Parse #RGB / #RRGGBB for inline rgba() backgrounds */
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
  if (!rgb) return `rgba(124, 58, 237, ${alpha})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/** `0 0 {blurPx}px rgba(...)` — for glows that track theme primary */
export function shadowGlow(hex: string, blurPx: number, alpha: number): string {
  return `0 0 ${blurPx}px ${hexToRgba(hex, alpha)}`;
}

export const NOIR_EASE = [0.25, 0.1, 0.25, 1] as const;

/** Tailwind arbitrary ease (matches {@link NOIR_EASE}) */
export const NOIR_EASE_TW_CLASS =
  "ease-[cubic-bezier(0.25,0.1,0.25,1)]";

type NoirChevronProps = {
  size?: number;
  className?: string;
};

/** Arrow for CTAs; flips in RTL via `rtl:rotate-180` */
export function NoirChevronRight({
  size = 16,
  className = "",
}: NoirChevronProps) {
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
