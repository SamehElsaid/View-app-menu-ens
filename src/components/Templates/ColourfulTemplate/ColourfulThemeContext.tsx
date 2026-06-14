"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

/** Colourful template palette (burgundy / rose — same base as Emerald) */
export const COLOURFUL_DEFAULT_PRIMARY = "#4c1121";
export const COLOURFUL_DEFAULT_SECONDARY = "#9b2545";

type ColourfulThemeValue = {
  primary: string;
  secondary: string;
};

const ColourfulThemeContext = createContext<ColourfulThemeValue>({
  primary: COLOURFUL_DEFAULT_PRIMARY,
  secondary: COLOURFUL_DEFAULT_SECONDARY,
});

export function ColourfulThemeProvider({
  children,
  primary,
  secondary,
}: {
  children: ReactNode;
  primary: string;
  secondary: string;
}) {
  return (
    <ColourfulThemeContext.Provider value={{ primary, secondary }}>
      {children}
    </ColourfulThemeContext.Provider>
  );
}

export function useColourfulTheme() {
  return useContext(ColourfulThemeContext);
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
