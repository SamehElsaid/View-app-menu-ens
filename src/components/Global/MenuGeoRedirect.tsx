"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { DELIVERY_ZONE_PARAM } from "@/hooks/useIsOrderingEnabled";
import { setDistanceDeliveryParams } from "@/lib/deliveryParams";
import { resolveDeliveryLocation } from "@/lib/resolveDeliveryLocation";

const branchRedirectCheckedKey = (slug: string) =>
  `ens_menu_branch_geo_checked_${slug}`;

/**
 * On load, silently resolve group redirect + delivery pricing from geolocation.
 */
export default function MenuGeoRedirect() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const menuSlug = useAppSelector((s) => s.menu.menuInfo?.slug);
  const menuInfo = useAppSelector((s) => s.menu.menuInfo);
  const delivery = useAppSelector((s) => s.menu.delivery);
  const branches = useAppSelector((s) => s.menu.branches);
  const startedForSlugRef = useRef<string | null>(null);

  useEffect(() => {
    if (!menuSlug || !menuInfo?.slug) return;
    if (searchParams.get(DELIVERY_ZONE_PARAM)?.trim() === "0") return;
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
        nextParams.delete("deliveryBranch");
        nextParams.delete("deliveryLat");
        nextParams.delete("deliveryLng");

        const result = await resolveDeliveryLocation({
          menuSlug,
          lat: latitude,
          lng: longitude,
          locale,
          pathname,
          search: nextParams.toString(),
          deliveryMode: delivery?.deliveryMode,
          branches,
          governorates: delivery?.governorates ?? [],
          branchDisplayName: (branch) =>
            branch.name?.trim() || menuInfo.name,
        });

        if (result.kind === "redirecting") return;

        if (result.kind === "out_of_range") {
          startedForSlugRef.current = null;
          return;
        }

        if (result.kind === "distance") {
          setDistanceDeliveryParams(
            nextParams,
            result.branchId,
            result.lat,
            result.lng,
          );
          const path = nextParams.toString()
            ? `${pathname}?${nextParams.toString()}`
            : pathname;
          router.replace(path, { scroll: false });
        } else if (result.kind === "governorate") {
          nextParams.set(DELIVERY_ZONE_PARAM, String(result.governorate.id));
          const path = nextParams.toString()
            ? `${pathname}?${nextParams.toString()}`
            : pathname;
          router.replace(path, { scroll: false });
        }

        sessionStorage.setItem(branchRedirectCheckedKey(menuSlug), "1");
      },
      () => {
        sessionStorage.setItem(branchRedirectCheckedKey(menuSlug), "1");
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 60_000 },
    );
  }, [
    branches,
    delivery?.deliveryMode,
    delivery?.governorates,
    locale,
    menuInfo?.name,
    menuInfo?.slug,
    menuSlug,
    pathname,
    router,
    searchParams,
  ]);

  return null;
}
