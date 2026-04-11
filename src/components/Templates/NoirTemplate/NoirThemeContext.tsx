"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

/** Original Emerald template palette (burgundy / rose) */
export const NOIR_DEFAULT_PRIMARY = "#4c1121";
export const NOIR_DEFAULT_SECONDARY = "#9b2545";

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
