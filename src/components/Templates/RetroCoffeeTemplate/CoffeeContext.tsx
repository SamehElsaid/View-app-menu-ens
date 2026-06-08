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

type CoffeeContextValue = {
  activeCategoryId: number | null;
  setActiveCategoryId: (id: number | null) => void;
  modalItem: MenuItem | null;
  openProductModal: (item: MenuItem) => void;
  closeProductModal: () => void;
};

const CoffeeContext = createContext<CoffeeContextValue | null>(null);

export function CoffeeProvider({ children }: { children: ReactNode }) {
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [modalItem, setModalItem] = useState<MenuItem | null>(null);

  const openProductModal = useCallback((item: MenuItem) => {
    setModalItem(item);
  }, []);

  const closeProductModal = useCallback(() => {
    setModalItem(null);
  }, []);

  const value = useMemo(
    () => ({
      activeCategoryId,
      setActiveCategoryId,
      modalItem,
      openProductModal,
      closeProductModal,
    }),
    [
      activeCategoryId,
      modalItem,
      openProductModal,
      closeProductModal,
    ],
  );

  return (
    <CoffeeContext.Provider value={value}>{children}</CoffeeContext.Provider>
  );
}

export function useCoffee() {
  const ctx = useContext(CoffeeContext);
  if (!ctx) {
    throw new Error("useCoffee must be used within CoffeeProvider");
  }
  return ctx;
}
