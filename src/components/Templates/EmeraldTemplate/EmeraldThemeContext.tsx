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
