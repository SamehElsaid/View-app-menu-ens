"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

/** Original Emerald template palette (burgundy / rose) */
export const EMERALD_DEFAULT_PRIMARY = "#4c1121";
export const EMERALD_DEFAULT_SECONDARY = "#9b2545";

type EmeraldThemeValue = {
  primary: string;
  secondary: string;
};

const EmeraldThemeContext = createContext<EmeraldThemeValue>({
  primary: EMERALD_DEFAULT_PRIMARY,
  secondary: EMERALD_DEFAULT_SECONDARY,
});

export function EmeraldThemeProvider({
  children,
  primary,
  secondary,
}: {
  children: ReactNode;
  primary: string;
  secondary: string;
}) {
  return (
    <EmeraldThemeContext.Provider value={{ primary, secondary }}>
      {children}
    </EmeraldThemeContext.Provider>
  );
}

export function useEmeraldTheme() {
  return useContext(EmeraldThemeContext);
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
