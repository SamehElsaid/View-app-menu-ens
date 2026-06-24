"use client";

import { useSearchParams } from "next/navigation";
import { useTableCartAllowed } from "./useTableCartAllowed";
import { useAppSelector } from "@/store/hooks";
import { isValidTableParam } from "@/lib/menuTable";

export const DELIVERY_ZONE_PARAM = "deliveryZone";

/**
 * Returns whether ordering (add-to-cart + cart button) is currently active.
 * Ordering is enabled in two modes:
 *  - Table mode:    URL has `?table=<number>` and the plan is paid.
 *  - Delivery mode: URL has `?deliveryZone=<id>` (set after location confirmed)
 *                   and delivery is turned on in the menu config.
 *                   Delivery is available on all plan types.
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
  const menuInfo = useAppSelector((s) => s.menu.menuInfo);

  const deliveryZoneParam = searchParams.get(DELIVERY_ZONE_PARAM)?.trim() ?? "";
  const tableNumber = searchParams.get("table")?.trim() ?? "";
  const tableValidity = tableNumber
    ? isValidTableParam(menuInfo, tableNumber)
    : null;

  const isDeliveryOrder =
    Boolean(deliveryZoneParam) && Boolean(delivery?.deliveryOn);

  const isTableOrder =
    Boolean(tableNumber) &&
    !isDeliveryOrder &&
    tableCartAllowed &&
    tableValidity !== false;

  return {
    isOrderingEnabled: isTableOrder || isDeliveryOrder,
    isDeliveryOrder,
    tableNumber,
    governorateId: deliveryZoneParam ? parseInt(deliveryZoneParam, 10) : null,
  };
}
