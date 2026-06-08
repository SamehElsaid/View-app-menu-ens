"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

export const RETRO_PRIMARY = "#C67115";
export const RETRO_CREAM = "#E4DCCD";
export const RETRO_BROWN = "#84623E";
export const RETRO_SURFACE = "#f4ebd9";
export const RETRO_SURFACE_BORDER = "#e6d9be";

export const COFFEE_DEFAULT_PRIMARY = RETRO_PRIMARY;
export const COFFEE_DEFAULT_SECONDARY = RETRO_BROWN;

export type CoffeePalette = {
  bg: string;
  bgMid: string;
  bgDeep: string;
  text: string;
  textMuted: string;
  border: string;
};

function buildRetroPalette(primary: string, secondary: string): CoffeePalette {
  const creamRgb = hexToRgb(RETRO_CREAM);
  const cream = creamRgb
    ? `${creamRgb.r}, ${creamRgb.g}, ${creamRgb.b}`
    : "228, 220, 205";

  return {
    bg: `rgba(${cream}, 0.94)`,
    bgMid: `rgba(${cream}, 0.68)`,
    bgDeep: `rgba(${cream}, 0.42)`,
    text: secondary,
    textMuted: hexToRgba(secondary, 0.78),
    border: hexToRgba(primary, 0.24),
  };
}

function buildRetroGradients(primary: string, secondary: string) {
  const creamRgb = hexToRgb(RETRO_CREAM);
  const cream = creamRgb
    ? `${creamRgb.r}, ${creamRgb.g}, ${creamRgb.b}`
    : "228, 220, 205";

  return {
    warm: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
    cream: `linear-gradient(180deg, rgba(${cream}, 0.82) 0%, rgba(${cream}, 0.48) 100%)`,
    overlay: `linear-gradient(to top, ${hexToRgba(secondary, 0.9)} 0%, ${hexToRgba(primary, 0.32)} 42%, transparent 78%)`,
  };
}

type CoffeeThemeValue = {
  primary: string;
  secondary: string;
  cream: string;
  colors: CoffeePalette;
  gradients: ReturnType<typeof buildRetroGradients>;
};

const CoffeeThemeContext = createContext<CoffeeThemeValue | null>(null);

export function CoffeeThemeProvider({
  children,
  primary = COFFEE_DEFAULT_PRIMARY,
  secondary = COFFEE_DEFAULT_SECONDARY,
}: {
  children: ReactNode;
  primary?: string;
  secondary?: string;
}) {
  const value = useMemo(
    () => ({
      primary,
      secondary,
      cream: RETRO_CREAM,
      colors: buildRetroPalette(primary, secondary),
      gradients: buildRetroGradients(primary, secondary),
    }),
    [primary, secondary],
  );

  return (
    <CoffeeThemeContext.Provider value={value}>
      {children}
    </CoffeeThemeContext.Provider>
  );
}

export function useCoffeeTheme() {
  const ctx = useContext(CoffeeThemeContext);
  if (!ctx) {
    throw new Error("useCoffeeTheme must be used within CoffeeThemeProvider");
  }
  return ctx;
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
  if (!rgb) return `rgba(198, 113, 21, ${alpha})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}
