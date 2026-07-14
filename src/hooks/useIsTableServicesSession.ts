"use client";

import { useIsOrderingEnabled } from "@/hooks/useIsOrderingEnabled";
import { useAppSelector } from "@/store/hooks";

/**
 * True when the guest is on a valid table QR session (Pro + ?table=).
 * Used to show the global services FAB and hide duplicate navbar controls.
 */
export function useIsTableServicesSession(): {
  isTableServicesSession: boolean;
  tableNumber: string;
} {
  const menuInfo = useAppSelector((s) => s.menu.menuInfo);
  const { isOrderingEnabled, isDeliveryOrder, tableNumber } =
    useIsOrderingEnabled();

  const isTableServicesSession =
    Boolean(menuInfo?.id) &&
    menuInfo?.isActive !== false &&
    isOrderingEnabled &&
    !isDeliveryOrder &&
    Boolean(tableNumber);

  return { isTableServicesSession, tableNumber };
}
