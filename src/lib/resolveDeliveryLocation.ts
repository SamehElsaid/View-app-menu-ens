import type { DeliveryGovernorate, MenuBranch } from "@/types/menu";
import { haversineKm } from "@/lib/geoDistance";
import { fetchBranchDeliveryQuote } from "@/lib/fetchDeliveryQuote";
import { findNearestMenuBranch } from "@/lib/menuBranches";
import {
  tryRedirectToNearestBranch,
  type BranchRedirectOutcome,
} from "@/lib/nearbyBranchRedirect";

const MAX_GOV_RADIUS_KM = 120;

export type ResolvedDistanceDelivery = {
  kind: "distance";
  branchId: number;
  branchName: string;
  lat: number;
  lng: number;
  quote: NonNullable<Awaited<ReturnType<typeof fetchBranchDeliveryQuote>>>;
};

export type ResolvedGovernorateDelivery = {
  kind: "governorate";
  governorate: DeliveryGovernorate;
  distanceKm: number;
};

export type ResolveDeliveryLocationResult =
  | { kind: "redirecting" }
  | ResolvedDistanceDelivery
  | ResolvedGovernorateDelivery
  | { kind: "out_of_range" }
  | { kind: "redirect_failed"; reason: BranchRedirectOutcome };

function findNearestGovernorate(
  lat: number,
  lng: number,
  governorates: DeliveryGovernorate[],
): { governorate: DeliveryGovernorate; distanceKm: number } | null {
  let nearest: DeliveryGovernorate | null = null;
  let minDist = Infinity;

  for (const gov of governorates) {
    const dist = haversineKm(lat, lng, gov.lat, gov.lan);
    if (dist < minDist) {
      minDist = dist;
      nearest = gov;
    }
  }

  if (!nearest || minDist > MAX_GOV_RADIUS_KM) return null;
  return { governorate: nearest, distanceKm: minDist };
}

function isDistanceDeliveryMode(
  deliveryMode: string | undefined,
  branches: MenuBranch[],
): boolean {
  return deliveryMode === "distance" && branches.length > 0;
}

/** Group redirect first, then distance quote or nearest governorate on this menu. */
export async function resolveDeliveryLocation(options: {
  menuSlug: string;
  lat: number;
  lng: number;
  locale: string;
  pathname: string;
  search: string;
  deliveryMode?: string;
  branches: MenuBranch[];
  governorates: DeliveryGovernorate[];
  branchDisplayName?: (branch: MenuBranch) => string;
}): Promise<ResolveDeliveryLocationResult> {
  const {
    menuSlug,
    lat,
    lng,
    locale,
    pathname,
    search,
    deliveryMode,
    branches,
    governorates,
    branchDisplayName,
  } = options;

  const branchOutcome = await tryRedirectToNearestBranch({
    menuSlug,
    lat,
    lng,
    locale,
    pathname,
    search,
  });

  if (branchOutcome === "redirecting") {
    return { kind: "redirecting" };
  }

  if (isDistanceDeliveryMode(deliveryMode, branches)) {
    const nearest = findNearestMenuBranch(branches, lat, lng);
    if (!nearest) return { kind: "out_of_range" };

    const quote = await fetchBranchDeliveryQuote(
      menuSlug,
      nearest.branch.id,
      lat,
      lng,
      locale,
    );
    if (!quote || !quote.inRange || quote.deliveryFee == null) {
      return { kind: "out_of_range" };
    }

    const name =
      branchDisplayName?.(nearest.branch) ??
      nearest.branch.name?.trim() ??
      `#${nearest.branch.id}`;

    return {
      kind: "distance",
      branchId: nearest.branch.id,
      branchName: name,
      lat,
      lng,
      quote,
    };
  }

  const govResult = findNearestGovernorate(lat, lng, governorates);
  if (govResult) {
    return {
      kind: "governorate",
      governorate: govResult.governorate,
      distanceKm: govResult.distanceKm,
    };
  }

  if (branchOutcome === "failed") {
    return { kind: "redirect_failed", reason: branchOutcome };
  }

  return { kind: "out_of_range" };
}
