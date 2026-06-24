"use client";

import {
  createContext,
  useContext,
  useMemo,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useAppSelector } from "@/store/hooks";

const DEFAULT_PRIMARY = "#7000B5";
const DEFAULT_SECONDARY = "#9B30FF";

type OneCardTheme = {
  primary: string;
  secondary: string;
};

const OneCardThemeContext = createContext<OneCardTheme>({
  primary: DEFAULT_PRIMARY,
  secondary: DEFAULT_SECONDARY,
});

function resolveColor(value: string | undefined | null, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed || fallback;
}

export { hexToRgba } from "@/lib/colorUtils";

export function useOneCardThemeFromStore(): OneCardTheme {
  const customizations = useAppSelector((state) => state.menu.menuCustomizations);

  return useMemo(
    () => ({
      primary: resolveColor(customizations?.primaryColor, DEFAULT_PRIMARY),
      secondary: resolveColor(customizations?.secondaryColor, DEFAULT_SECONDARY),
    }),
    [customizations?.primaryColor, customizations?.secondaryColor],
  );
}

export function OneCardThemeProvider({
  primary,
  secondary,
  children,
}: OneCardTheme & { children: ReactNode }) {
  const value = useMemo(() => ({ primary, secondary }), [primary, secondary]);

  return (
    <OneCardThemeContext.Provider value={value}>
      <div
        style={
          {
            "--onecard-primary": primary,
            "--onecard-secondary": secondary,
          } as CSSProperties
        }
      >
        {children}
      </div>
    </OneCardThemeContext.Provider>
  );
}

export function useOneCardTheme(): OneCardTheme {
  return useContext(OneCardThemeContext);
}
