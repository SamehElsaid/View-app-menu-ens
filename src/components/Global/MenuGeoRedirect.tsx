"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { tryRedirectToNearestBranch } from "@/lib/nearbyBranchRedirect";
import { hasTableSessionInSearch } from "@/lib/menuTable";

/**
 * On load, silently redirect to a closer group branch when needed.
 * Delivery location + pricing confirmation is handled by DeliveryLocationModal.
 * Never runs during a table QR / dine-in session.
 */
export default function MenuGeoRedirect() {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const menuSlug = useAppSelector((s) => s.menu.menuInfo?.slug);
  const delivery = useAppSelector((s) => s.menu.delivery);
  const startedForSlugRef = useRef<string | null>(null);

  useEffect(() => {
    if (!menuSlug) return;
    if (hasTableSessionInSearch(searchParams)) return;
    /** Modal runs resolveDeliveryLocation (includes branch redirect + user confirm). */
    if (delivery?.deliveryOn) return;

    if (typeof window === "undefined") return;
    if (!navigator.geolocation) return;

    if (startedForSlugRef.current === menuSlug) return;
    startedForSlugRef.current = menuSlug;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const nextParams = new URLSearchParams(searchParams.toString());

        await tryRedirectToNearestBranch({
          menuSlug,
          lat: latitude,
          lng: longitude,
          locale,
          pathname,
          search: nextParams.toString(),
        });
      },
      () => {
        startedForSlugRef.current = null;
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 60_000 },
    );
  }, [delivery?.deliveryOn, locale, menuSlug, pathname, searchParams]);

  return null;
}
