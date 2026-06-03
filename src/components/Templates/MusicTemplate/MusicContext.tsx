"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { MenuItem } from "@/types/menu";

type MusicContextValue = {
  activeCategoryId: number | null;
  setActiveCategoryId: (id: number | null) => void;
  activeItem: MenuItem | null;
  activateItem: (item: MenuItem) => void;
  setActiveItemForce: (item: MenuItem) => void;
};

const MusicContext = createContext<MusicContextValue | null>(null);

export function MusicProvider({ children }: { children: ReactNode }) {
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);

  const activateItem = useCallback((item: MenuItem) => {
    setActiveItem((current) => {
      if (current?.id === item.id) return current;
      return item;
    });
  }, []);

  const setActiveItemForce = useCallback((item: MenuItem) => {
    setActiveItem(item);
  }, []);

  const value = useMemo(
    () => ({
      activeCategoryId,
      setActiveCategoryId,
      activeItem,
      activateItem,
      setActiveItemForce,
    }),
    [activeCategoryId, activeItem, activateItem, setActiveItemForce],
  );

  return (
    <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
  );
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) {
    throw new Error("useMusic must be used within MusicProvider");
  }
  return ctx;
}
