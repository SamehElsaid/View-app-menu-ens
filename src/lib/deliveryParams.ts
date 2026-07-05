export const DELIVERY_BRANCH_PARAM = "deliveryBranch";
export const DELIVERY_LAT_PARAM = "deliveryLat";
export const DELIVERY_LNG_PARAM = "deliveryLng";

export function readDeliveryBranchFromParams(
  searchParams: URLSearchParams,
): {
  branchId: number | null;
  lat: number | null;
  lng: number | null;
} {
  const branchRaw = searchParams.get(DELIVERY_BRANCH_PARAM)?.trim();
  const branchId = branchRaw ? parseInt(branchRaw, 10) : NaN;
  return {
    branchId: Number.isFinite(branchId) && branchId > 0 ? branchId : null,
    lat: parseCoordParam(searchParams.get(DELIVERY_LAT_PARAM)),
    lng: parseCoordParam(searchParams.get(DELIVERY_LNG_PARAM)),
  };
}

function parseCoordParam(raw: string | null): number | null {
  if (!raw?.trim()) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function clearDistanceDeliveryParams(params: URLSearchParams): void {
  params.delete(DELIVERY_BRANCH_PARAM);
  params.delete(DELIVERY_LAT_PARAM);
  params.delete(DELIVERY_LNG_PARAM);
}

export function setDistanceDeliveryParams(
  params: URLSearchParams,
  branchId: number,
  lat: number,
  lng: number,
): void {
  params.delete("deliveryZone");
  params.set(DELIVERY_BRANCH_PARAM, String(branchId));
  params.set(DELIVERY_LAT_PARAM, String(lat));
  params.set(DELIVERY_LNG_PARAM, String(lng));
}
