"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useIsOrderingEnabled } from "@/hooks/useIsOrderingEnabled";
import { useLocale } from "next-intl";
import { toast } from "react-toastify";
import type { MenuItem } from "@/types/menu";
import {
  readSkyCartFromCookie,
  subscribeSkyCartUpdated,
  upsertSkyCartQuantityFromMenuItem,
  type SkyCartItem,
} from "@/lib/skyTemplateCart";

type CoffeeContextValue = {
  activeCategoryId: number | null;
  setActiveCategoryId: (id: number | null) => void;
  modalItem: MenuItem | null;
  openProductModal: (item: MenuItem) => void;
  closeProductModal: () => void;
  isTableOrder: boolean;
  cartById: Record<number, SkyCartItem>;
  addToCart: (item: MenuItem, quantity: number) => void;
};

const CoffeeContext = createContext<CoffeeContextValue | null>(null);

export function CoffeeProvider({ children }: { children: ReactNode }) {
  const locale = useLocale() as "ar" | "en";
  const { isOrderingEnabled: isTableOrder } = useIsOrderingEnabled();

  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [modalItem, setModalItem] = useState<MenuItem | null>(null);
  const [cartById, setCartById] = useState<Record<number, SkyCartItem>>({});

  useEffect(() => {
    const sync = () => setCartById(readSkyCartFromCookie());
    sync();
    return subscribeSkyCartUpdated(sync);
  }, []);

  const addToCart = useCallback(
    (item: MenuItem, quantity: number) => {
      upsertSkyCartQuantityFromMenuItem(item, quantity);
      setCartById(readSkyCartFromCookie());
      toast.success(
        locale === "ar"
          ? `تمت إضافة ${quantity} إلى السلة`
          : `Added ${quantity} to cart`,
      );
    },
    [locale],
  );

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
      isTableOrder,
      cartById,
      addToCart,
    }),
    [
      activeCategoryId,
      modalItem,
      openProductModal,
      closeProductModal,
      isTableOrder,
      cartById,
      addToCart,
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
