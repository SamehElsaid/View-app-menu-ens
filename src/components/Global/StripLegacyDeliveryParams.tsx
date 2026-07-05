"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  clearDistanceDeliveryParams,
  DELIVERY_ZONE_PARAM,
} from "@/lib/deliveryParams";

/** Remove legacy delivery query params so refresh always restarts location scan. */
export default function StripLegacyDeliveryParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const strippedRef = useRef(false);

  useEffect(() => {
    if (strippedRef.current) return;

    const params = new URLSearchParams(searchParams.toString());
    const hasLegacy =
      params.has("deliveryBranch") ||
      params.has("deliveryLat") ||
      params.has("deliveryLng") ||
      params.has(DELIVERY_ZONE_PARAM);

    if (!hasLegacy) return;

    strippedRef.current = true;
    clearDistanceDeliveryParams(params);
    params.delete(DELIVERY_ZONE_PARAM);

    const path = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;
    router.replace(path, { scroll: false });
  }, [pathname, router, searchParams]);

  return null;
}
