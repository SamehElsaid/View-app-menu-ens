"use client";

import { useCallback } from "react";
import { useAppSelector } from "@/store/hooks";
import { isFreeMenuPlan } from "@/lib/menuPlan";
import { trackFreeBannerEvent } from "@/lib/trackFreeBannerEvent";

/** Click tracking for the ENSmenu link in the footer (secondary branding strip). */
export function useEnsmenuBrandingTracking() {
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);
  const slug = menuInfo?.slug?.trim() ?? "";
  const isFree = isFreeMenuPlan(menuInfo?.ownerPlanType);

  const onBrandingPointerDown = useCallback(() => {
    if (isFree && slug) {
      trackFreeBannerEvent(slug, "click");
    }
  }, [isFree, slug]);

  return { onBrandingPointerDown };
}
