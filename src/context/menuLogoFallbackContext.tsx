"use client";

import { createContext, useContext, type ReactNode } from "react";
import { resolveMenuItemImageSrc } from "@/lib/menuItemImage";

const MenuLogoFallbackContext = createContext<string | null>(null);

export function MenuLogoFallbackProvider({
  logo,
  children,
}: {
  logo?: string | null;
  children: ReactNode;
}) {
  const value = logo?.trim() || null;
  return (
    <MenuLogoFallbackContext.Provider value={value}>
      {children}
    </MenuLogoFallbackContext.Provider>
  );
}

export function useMenuLogoFallback(): string | null {
  return useContext(MenuLogoFallbackContext);
}

/** Menu item image URL; uses menu logo when the item has no image (inside provider). */
export function useMenuItemImageSrc(src: string | undefined | null): string {
  const logo = useMenuLogoFallback();
  return resolveMenuItemImageSrc(src, logo);
}
