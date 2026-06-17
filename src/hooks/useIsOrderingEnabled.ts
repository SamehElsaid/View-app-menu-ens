"use client";

import { useSearchParams } from "next/navigation";
import { useTableCartAllowed } from "./useTableCartAllowed";
import { useAppSelector } from "@/store/hooks";

export const DELIVERY_ZONE_PARAM = "deliveryZone";

/**
 * Returns whether ordering (add-to-cart + cart button) is currently active.
 * Ordering is enabled in two modes:
 *  - Table mode:    URL has `?table=<number>` and the plan is paid.
 *  - Delivery mode: URL has `?deliveryZone=<id>` (set after location confirmed),
 *                   delivery is turned on in the menu config, and plan is paid.
 */
export function useIsOrderingEnabled(): {
  isOrderingEnabled: boolean;
  isDeliveryOrder: boolean;
  tableNumber: string;
  governorateId: number | null;
} {
  const searchParams = useSearchParams();
  const tableCartAllowed = useTableCartAllowed();
  const delivery = useAppSelector((s) => s.menu.delivery);

  const tableNumber = searchParams.get("table")?.trim() ?? "";
  const deliveryZoneParam = searchParams.get(DELIVERY_ZONE_PARAM)?.trim() ?? "";

  const isTableOrder = Boolean(tableNumber) && tableCartAllowed;
  const isDeliveryOrder =
    !tableNumber &&
    Boolean(delivery?.deliveryOn) &&
    Boolean(deliveryZoneParam) &&
    tableCartAllowed;

  return {
    isOrderingEnabled: isTableOrder || isDeliveryOrder,
    isDeliveryOrder,
    tableNumber,
    governorateId: deliveryZoneParam ? parseInt(deliveryZoneParam, 10) : null,
  };
}
