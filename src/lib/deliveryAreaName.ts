import type { DeliveryGovernorate } from "@/types/menu";
import { haversineKm } from "@/lib/geoDistance";

const MAX_GOV_RADIUS_KM = 120;
const NOMINATIM_USER_AGENT = "ENSmenu-delivery/1.0";

export type DeliveryAreaNames = {
  nameAr: string;
  nameEn: string;
};

function uniqueParts(parts: (string | undefined)[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of parts) {
    const part = raw?.trim();
    if (!part) continue;
    const key = part.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(part);
  }

  return result;
}

/** Build a precise label: street → neighbourhood → district → city → governorate. */
function buildDetailedAreaLabel(
  address: Record<string, string | undefined>,
  separator: string,
): string {
  const road = address.road?.trim();
  const neighbourhood =
    address.neighbourhood?.trim() ||
    address.suburb?.trim() ||
    address.residential?.trim();
  const district =
    address.city_district?.trim() ||
    address.district?.trim() ||
    address.quarter?.trim() ||
    address.borough?.trim();
  const city =
    address.city?.trim() ||
    address.town?.trim() ||
    address.municipality?.trim() ||
    address.village?.trim();
  const state = address.state?.trim();

  const local = uniqueParts([road, neighbourhood, district]);
  const withCity = uniqueParts([...local, city]);

  if (withCity.length >= 2) {
    return withCity.join(separator);
  }

  if (withCity.length === 1 && state) {
    const only = withCity[0]!;
    if (only.toLowerCase() !== state.toLowerCase()) {
      return [only, state].join(separator);
    }
  }

  return withCity.join(separator);
}

function displayNameToShortLabel(
  displayName: string | undefined,
  separator: string,
  maxParts = 4,
): string {
  if (!displayName?.trim()) return "";
  return uniqueParts(displayName.split(",").map((part) => part.trim()))
    .slice(0, maxParts)
    .join(separator);
}

export function findNearestDeliveryGovernorate(
  lat: number,
  lng: number,
  governorates: DeliveryGovernorate[],
): DeliveryGovernorate | null {
  let nearest: DeliveryGovernorate | null = null;
  let minDist = Infinity;

  for (const gov of governorates) {
    const govLat = Number(gov.lat);
    const govLng = Number(gov.lan);
    if (!Number.isFinite(govLat) || !Number.isFinite(govLng)) continue;
    const dist = haversineKm(lat, lng, govLat, govLng);
    if (dist < minDist) {
      minDist = dist;
      nearest = gov;
    }
  }

  if (!nearest || minDist > MAX_GOV_RADIUS_KM) return null;
  return nearest;
}

async function fetchReverseGeocodeLabel(
  lat: number,
  lng: number,
  language: "ar" | "en",
): Promise<string> {
  const separator = language === "ar" ? "، " : ", ";

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lng))}&format=json&addressdetails=1&zoom=18`,
      {
        headers: {
          "Accept-Language": language === "ar" ? "ar" : "en",
          "User-Agent": NOMINATIM_USER_AGENT,
        },
      },
    );
    if (!res.ok) return "";

    const data = (await res.json()) as {
      address?: Record<string, string | undefined>;
      display_name?: string;
    };

    const fromAddress = buildDetailedAreaLabel(data.address ?? {}, separator);
    if (fromAddress) return fromAddress;

    return displayNameToShortLabel(data.display_name, separator);
  } catch {
    return "";
  }
}

/** Resolve a precise delivery area from GPS (street/neighbourhood/city), then nearest zone. */
export async function resolveDeliveryAreaNames(
  lat: number,
  lng: number,
  governorates: DeliveryGovernorate[],
): Promise<DeliveryAreaNames> {
  const [nameAr, nameEn] = await Promise.all([
    fetchReverseGeocodeLabel(lat, lng, "ar"),
    fetchReverseGeocodeLabel(lat, lng, "en"),
  ]);

  if (nameAr || nameEn) {
    return {
      nameAr: nameAr || nameEn,
      nameEn: nameEn || nameAr,
    };
  }

  const nearest = findNearestDeliveryGovernorate(lat, lng, governorates);
  if (nearest) {
    return { nameAr: nearest.nameAr, nameEn: nearest.nameEn };
  }

  return { nameAr: "", nameEn: "" };
}

export function isGenericDeliveryAreaLabel(label: string | undefined): boolean {
  const trimmed = label?.trim();
  if (!trimmed) return true;
  return !trimmed.includes("،") && !trimmed.includes(",");
}

export function pickDeliveryAreaLabel(
  isArabic: boolean,
  names: DeliveryAreaNames | null | undefined,
  fallbackGovernorate: DeliveryGovernorate | null,
): string {
  if (fallbackGovernorate) {
    return isArabic
      ? fallbackGovernorate.nameAr
      : fallbackGovernorate.nameEn;
  }
  if (!names) return "";
  const primary = isArabic ? names.nameAr : names.nameEn;
  if (primary?.trim()) return primary.trim();
  return (names.nameAr || names.nameEn || "").trim();
}

export function resolveDeliveryAreaLabelSync(
  isArabic: boolean,
  lat: number | null,
  lng: number | null,
  storedNames: DeliveryAreaNames | null | undefined,
  governorates: DeliveryGovernorate[],
): string {
  const fromStore = pickDeliveryAreaLabel(isArabic, storedNames, null);
  if (fromStore) return fromStore;

  if (lat != null && lng != null && governorates.length > 0) {
    const nearest = findNearestDeliveryGovernorate(lat, lng, governorates);
    if (nearest) {
      return isArabic ? nearest.nameAr : nearest.nameEn;
    }
  }

  return "";
}
