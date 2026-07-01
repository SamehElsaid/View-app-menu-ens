"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { DELIVERY_ZONE_PARAM } from "@/hooks/useIsOrderingEnabled";
import { tryRedirectToNearestBranch } from "@/lib/nearbyBranchRedirect";

const branchRedirectCheckedKey = (slug: string) =>
  `ens_menu_branch_geo_checked_${slug}`;

/**
 * On load, silently try geo-based branch redirect before the delivery modal.
 * Explicit "Share location" in DeliveryLocationModal also calls the same API.
 */
export default function MenuGeoRedirect() {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const menuSlug = useAppSelector((s) => s.menu.menuInfo?.slug);
  const startedForSlugRef = useRef<string | null>(null);

  useEffect(() => {
    if (!menuSlug) return;
    if (searchParams.get(DELIVERY_ZONE_PARAM)?.trim()) return;
    if (searchParams.get("table")?.trim()) return;

    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(branchRedirectCheckedKey(menuSlug))) return;

    if (!navigator.geolocation) return;

    if (startedForSlugRef.current === menuSlug) return;
    startedForSlugRef.current = menuSlug;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const nextParams = new URLSearchParams(searchParams.toString());
        nextParams.delete(DELIVERY_ZONE_PARAM);

        const outcome = await tryRedirectToNearestBranch({
          menuSlug,
          lat: latitude,
          lng: longitude,
          locale,
          pathname,
          search: nextParams.toString(),
        });

        if (outcome !== "redirecting") {
          sessionStorage.setItem(branchRedirectCheckedKey(menuSlug), "1");
        }
      },
      () => {
        sessionStorage.setItem(branchRedirectCheckedKey(menuSlug), "1");
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 60_000 },
    );
  }, [locale, menuSlug, pathname, searchParams]);

  return null;
}
