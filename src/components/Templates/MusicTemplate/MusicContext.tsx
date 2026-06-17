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
  isTableOrder: boolean;
  cartById: Record<number, SkyCartItem>;
  addToCart: (item: MenuItem, quantity: number) => void;
};

const MusicContext = createContext<MusicContextValue | null>(null);

export function MusicProvider({ children }: { children: ReactNode }) {
  const locale = useLocale() as "ar" | "en";
  const { isOrderingEnabled: isTableOrder } = useIsOrderingEnabled();

  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);
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
      isTableOrder,
      cartById,
      addToCart,
    }),
    [
      activeCategoryId,
      activeItem,
      modalItem,
      openProductModal,
      closeProductModal,
      activateItem,
      setActiveItemForce,
      isTableOrder,
      cartById,
      addToCart,
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
