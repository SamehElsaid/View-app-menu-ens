"use client";

import { useAppSelector } from "@/store/hooks";
import { isPaidMenuPlan } from "@/lib/menuPlan";

/**
 * Table ordering (QR / ?table=) is a Pro (paid) feature.
 * Delivery ordering on Free is handled separately in useIsOrderingEnabled.
 */
export function useTableCartAllowed(): boolean {
  const plan = useAppSelector((s) => s.menu.menuInfo?.ownerPlanType);
  return isPaidMenuPlan(plan);
}
