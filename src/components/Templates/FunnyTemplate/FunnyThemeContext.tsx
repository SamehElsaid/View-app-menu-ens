"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

/** Funny template palette (same defaults as Emerald) */
export const FUNNY_DEFAULT_PRIMARY = "#4c1121";
export const FUNNY_DEFAULT_SECONDARY = "#9b2545";

type FunnyThemeValue = {
  primary: string;
  secondary: string;
};

const FunnyThemeContext = createContext<FunnyThemeValue>({
  primary: FUNNY_DEFAULT_PRIMARY,
  secondary: FUNNY_DEFAULT_SECONDARY,
});

export function FunnyThemeProvider({
  children,
  primary,
  secondary,
}: {
  children: ReactNode;
  primary: string;
  secondary: string;
}) {
  return (
    <FunnyThemeContext.Provider value={{ primary, secondary }}>
      {children}
    </FunnyThemeContext.Provider>
  );
}

export function useFunnyTheme() {
  return useContext(FunnyThemeContext);
}

/** Parse #RRGGBB to rgba() for shadows and overlays */
export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "").trim();
  if (h.length !== 6 || Number.isNaN(parseInt(h, 16))) {
    return `rgba(76, 17, 33, ${alpha})`;
  }
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
