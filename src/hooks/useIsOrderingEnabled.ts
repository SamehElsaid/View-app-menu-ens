"use client";

import { useTableCartAllowed } from "./useTableCartAllowed";
import { useMenuTableParam } from "./useMenuTableParam";
import { useAppSelector } from "@/store/hooks";
import { isValidTableParam } from "@/lib/menuTable";

/**
 * Ordering is enabled in table mode (?table=) or delivery mode
 * (in-memory delivery context from geolocation / user selection).
 *
 * Table QR mode takes precedence: a valid table disables delivery ordering
 * even if a delivery session is still in memory.
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
  deliveryAreaNameAr: string | null;
  deliveryAreaNameEn: string | null;
} {
  const tableCartAllowed = useTableCartAllowed();
  const delivery = useAppSelector((s) => s.menu.delivery);
  const menuInfo = useAppSelector((s) => s.menu.menuInfo);
  const deliveryContext = useAppSelector((s) => s.menu.deliveryContext);

  const tableNumber = useMenuTableParam();
  const tableValidity = tableNumber
    ? isValidTableParam(menuInfo, tableNumber)
    : null;

  const isTableOrder =
    Boolean(tableNumber) &&
    tableCartAllowed &&
    tableValidity !== false;

  const { distance, governorateId } = deliveryContext;

  const isDistanceDelivery =
    !isTableOrder &&
    distance != null &&
    Boolean(delivery?.deliveryOn);

  const isGovernorateDelivery =
    !isTableOrder &&
    governorateId != null &&
    Boolean(delivery?.deliveryOn);

  const isDeliveryOrder = isDistanceDelivery || isGovernorateDelivery;

  const areaAr = distance?.areaNameAr?.trim() || "";
  const areaEn = distance?.areaNameEn?.trim() || "";

  return {
    isOrderingEnabled: isTableOrder || isDeliveryOrder,
    isDeliveryOrder,
    isDistanceDelivery,
    tableNumber,
    governorateId: isGovernorateDelivery ? governorateId : null,
    deliveryBranchId: isDistanceDelivery ? distance?.branchId ?? null : null,
    deliveryLat: isDistanceDelivery ? distance?.lat ?? null : null,
    deliveryLng: isDistanceDelivery ? distance?.lng ?? null : null,
    deliveryAreaNameAr: isDistanceDelivery && areaAr ? areaAr : null,
    deliveryAreaNameEn: isDistanceDelivery && areaEn ? areaEn : null,
  };
}
