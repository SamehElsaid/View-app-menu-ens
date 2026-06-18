"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useAppSelector } from "@/store/hooks";

export const ONECARD_DEFAULT_PRIMARY = "#9333EA";
export const ONECARD_DEFAULT_SECONDARY = "#7C3AED";

type OneCardThemeValue = {
  primary: string;
  secondary: string;
};

const OneCardThemeContext = createContext<OneCardThemeValue>({
  primary: ONECARD_DEFAULT_PRIMARY,
  secondary: ONECARD_DEFAULT_SECONDARY,
});

export function OneCardThemeProvider({
  children,
  primary,
  secondary,
}: {
  children: ReactNode;
  primary: string;
  secondary: string;
}) {
  return (
    <OneCardThemeContext.Provider value={{ primary, secondary }}>
      {children}
    </OneCardThemeContext.Provider>
  );
}

export function useOneCardTheme() {
  return useContext(OneCardThemeContext);
}

export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "").trim();
  if (h.length !== 6 || Number.isNaN(parseInt(h, 16))) {
    return `rgba(147, 51, 234, ${alpha})`;
  }
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function useOneCardThemeFromStore() {
  const menuCustomizations = useAppSelector(
    (state) => state.menu.menuCustomizations,
  );
  const primary =
    menuCustomizations?.primaryColor?.trim() || ONECARD_DEFAULT_PRIMARY;
  const secondary =
    menuCustomizations?.secondaryColor?.trim() || ONECARD_DEFAULT_SECONDARY;
  return { primary, secondary };
}
