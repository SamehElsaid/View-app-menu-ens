"use client";

import { useIsOrderingEnabled } from "@/hooks/useIsOrderingEnabled";
import { useAppSelector } from "@/store/hooks";

/**
 * True when the ordering dock should host rate + cart
 * (table QR session or confirmed delivery order).
 *
 * When false, MenuCornerFabs shows a lone rate FAB in the cart corner.
 * Table-only services (waiter / bill / wifi) stay gated by
 * `useIsTableServicesSession` — delivery docks show rate + cart only.
 */
export function useIsMenuCornerDockSession(): boolean {
  const menuInfo = useAppSelector((s) => s.menu.menuInfo);
  const { isOrderingEnabled } = useIsOrderingEnabled();

  return (
    Boolean(menuInfo?.id) &&
    menuInfo?.isActive !== false &&
    isOrderingEnabled
  );
}
