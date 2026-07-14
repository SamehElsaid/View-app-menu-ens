"use client";

import { useSearchParams } from "next/navigation";
import { useTableCartAllowed } from "./useTableCartAllowed";
import { useAppSelector } from "@/store/hooks";
import { isValidTableParam, readTableSessionParam } from "@/lib/menuTable";

/**
 * Ordering is enabled in table mode (?table=) or delivery mode
 * (in-memory delivery context from geolocation / user selection).
 * Table sessions always win over delivery context so dine-in is never treated as delivery.
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

  const tableNumber = readTableSessionParam(searchParams);
  const tableValidity = tableNumber
    ? isValidTableParam(menuInfo, tableNumber)
    : null;
  const hasTableSession =
    Boolean(tableNumber) && tableCartAllowed && tableValidity !== false;

  const { distance, governorateId } = deliveryContext;

  const isDistanceDelivery =
    !hasTableSession &&
    distance != null &&
    Boolean(delivery?.deliveryOn);

  const isGovernorateDelivery =
    !hasTableSession &&
    governorateId != null &&
    Boolean(delivery?.deliveryOn);

  const isDeliveryOrder = isDistanceDelivery || isGovernorateDelivery;

  const isTableOrder = hasTableSession;

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
