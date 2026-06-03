"use client";

import { useAppSelector } from "@/store/hooks";
import { isPaidMenuPlan } from "@/lib/menuPlan";

/**
 * Table cart, add-to-cart on cards, and RequestStaffButton are Pro (paid) features.
 * Free-plan menus hide these UIs.
 */
export function useTableCartAllowed(): boolean {
  const plan = useAppSelector((s) => s.menu.menuInfo?.ownerPlanType);
  return isPaidMenuPlan(plan);
}
