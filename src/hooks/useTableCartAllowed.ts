"use client";

import { useAppSelector } from "@/store/hooks";

/**
 * Table cart, add-to-cart on cards, and RequestStaffButton are Pro (paid) features.
 * Free-plan menus hide these UIs.
 */
export function useTableCartAllowed(): boolean {
  const plan = useAppSelector((s) => s.menu.menuInfo?.ownerPlanType);
  return Boolean(plan && plan !== "free");
}
