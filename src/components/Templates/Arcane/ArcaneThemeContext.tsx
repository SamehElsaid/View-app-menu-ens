"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

/** Arcane template — bold red & white cafe corporate palette */
export const ARCANE_RED = "#D1282A";
export const ARCANE_WHITE = "#FFFFFF";

export const ARCANE_DEFAULT_PRIMARY = ARCANE_RED;
/** Darker red for gradients and accents on white surfaces */
export const ARCANE_DEFAULT_SECONDARY = "#991B1B";

type ArcaneThemeValue = {
  primary: string;
  secondary: string;
};

const ArcaneThemeContext = createContext<ArcaneThemeValue>({
  primary: ARCANE_DEFAULT_PRIMARY,
  secondary: ARCANE_DEFAULT_SECONDARY,
});

export function ArcaneThemeProvider({
  children,
  primary,
  secondary,
}: {
  children: ReactNode;
  primary: string;
  secondary: string;
}) {
  return (
    <ArcaneThemeContext.Provider value={{ primary, secondary }}>
      {children}
    </ArcaneThemeContext.Provider>
  );
}

export function useArcaneTheme() {
  return useContext(ArcaneThemeContext);
}

/** Parse #RRGGBB to rgba() for shadows and overlays */
export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "").trim();
  if (h.length !== 6 || Number.isNaN(parseInt(h, 16))) {
    return `rgba(209, 40, 42, ${alpha})`;
  }
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
