"use client";

import { useSearchParams } from "next/navigation";
import { useTableCartAllowed } from "./useTableCartAllowed";
import { useAppSelector } from "@/store/hooks";
import { isValidTableParam } from "@/lib/menuTable";

/**
 * Ordering is enabled in table mode (?table=) or delivery mode
 * (in-memory delivery context from geolocation / user selection).
 */
export function useIsOrderingEnabled(): {
  isOrderingEnabled: boolean;
  isDeliveryOrder: boolean;
  isDistanceDelivery: boolean;
  tableNumber: string;
  governorateId: number | null;
  deliveryBranchId: number | null;
  deliveryLat: number | null;
  deliveryLng: number | null;
} {
  const searchParams = useSearchParams();
  const tableCartAllowed = useTableCartAllowed();
  const delivery = useAppSelector((s) => s.menu.delivery);
  const menuInfo = useAppSelector((s) => s.menu.menuInfo);
  const deliveryContext = useAppSelector((s) => s.menu.deliveryContext);

  const tableNumber = searchParams.get("table")?.trim() ?? "";
  const tableValidity = tableNumber
    ? isValidTableParam(menuInfo, tableNumber)
    : null;

  const { distance, governorateId } = deliveryContext;

  const isDistanceDelivery =
    distance != null && Boolean(delivery?.deliveryOn);

  const isGovernorateDelivery =
    governorateId != null && Boolean(delivery?.deliveryOn);

  const isDeliveryOrder = isDistanceDelivery || isGovernorateDelivery;

  const isTableOrder =
    Boolean(tableNumber) &&
    !isDeliveryOrder &&
    tableCartAllowed &&
    tableValidity !== false;

  return {
    isOrderingEnabled: isTableOrder || isDeliveryOrder,
    isDeliveryOrder,
    isDistanceDelivery,
    tableNumber,
    governorateId: isGovernorateDelivery ? governorateId : null,
    deliveryBranchId: distance?.branchId ?? null,
    deliveryLat: distance?.lat ?? null,
    deliveryLng: distance?.lng ?? null,
  };
}
