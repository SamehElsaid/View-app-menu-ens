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
