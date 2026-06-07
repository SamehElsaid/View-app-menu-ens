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
  modalItem: MenuItem | null;
  openProductModal: (item: MenuItem) => void;
  closeProductModal: () => void;
  /** @deprecated use openProductModal */
  activateItem: (item: MenuItem) => void;
  setActiveItemForce: (item: MenuItem | null) => void;
};

const MusicContext = createContext<MusicContextValue | null>(null);

export function MusicProvider({ children }: { children: ReactNode }) {
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);
  const [modalItem, setModalItem] = useState<MenuItem | null>(null);

  const openProductModal = useCallback((item: MenuItem) => {
    setModalItem(item);
    setActiveItem(item);
  }, []);

  const closeProductModal = useCallback(() => {
    setModalItem(null);
    setActiveItem(null);
  }, []);

  const activateItem = openProductModal;

  const setActiveItemForce = useCallback((item: MenuItem | null) => {
    setModalItem(item);
    setActiveItem(item);
  }, []);

  const value = useMemo(
    () => ({
      activeCategoryId,
      setActiveCategoryId,
      activeItem,
      modalItem,
      openProductModal,
      closeProductModal,
      activateItem,
      setActiveItemForce,
    }),
    [
      activeCategoryId,
      activeItem,
      modalItem,
      openProductModal,
      closeProductModal,
      activateItem,
      setActiveItemForce,
    ],
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
