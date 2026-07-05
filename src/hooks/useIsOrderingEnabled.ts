"use client";

import { useSearchParams } from "next/navigation";
import { useTableCartAllowed } from "./useTableCartAllowed";
import { useAppSelector } from "@/store/hooks";
import { isValidTableParam } from "@/lib/menuTable";
import { readDeliveryBranchFromParams } from "@/lib/deliveryParams";

export const DELIVERY_ZONE_PARAM = "deliveryZone";

/**
 * Ordering is enabled in table mode (?table=) or delivery mode
 * (?deliveryZone= for governorates, ?deliveryBranch= for distance pricing).
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

  const deliveryZoneParam = searchParams.get(DELIVERY_ZONE_PARAM)?.trim() ?? "";
  const { branchId, lat, lng } = readDeliveryBranchFromParams(searchParams);
  const tableNumber = searchParams.get("table")?.trim() ?? "";
  const tableValidity = tableNumber
    ? isValidTableParam(menuInfo, tableNumber)
    : null;

  const isDistanceDelivery =
    branchId != null &&
    lat != null &&
    lng != null &&
    Boolean(delivery?.deliveryOn);

  const isGovernorateDelivery =
    Boolean(deliveryZoneParam) &&
    deliveryZoneParam !== "0" &&
    Boolean(delivery?.deliveryOn);

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
    governorateId:
      isGovernorateDelivery && deliveryZoneParam
        ? parseInt(deliveryZoneParam, 10)
        : null,
    deliveryBranchId: branchId,
    deliveryLat: lat,
    deliveryLng: lng,
  };
}
