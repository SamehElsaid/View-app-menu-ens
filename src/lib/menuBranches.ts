import { haversineKm, parseCoord } from "@/lib/geoDistance";
import type { MenuBranch } from "@/types/menu";

export function findNearestMenuBranch(
  branches: MenuBranch[],
  userLat: number,
  userLng: number,
): { branch: MenuBranch; distanceKm: number } | null {
  let nearest: MenuBranch | null = null;
  let minDist = Infinity;

  for (const branch of branches) {
    const lat = parseCoord(branch.latitude);
    const lng = parseCoord(branch.longitude);
    if (lat == null || lng == null) continue;

    const distanceKm = haversineKm(userLat, userLng, lat, lng);
    if (distanceKm < minDist) {
      minDist = distanceKm;
      nearest = branch;
    }
  }

  if (!nearest || !Number.isFinite(minDist)) return null;
  return { branch: nearest, distanceKm: minDist };
}
