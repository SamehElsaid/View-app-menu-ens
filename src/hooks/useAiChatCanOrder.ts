"use client";

import { useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { isFreeMenuPlan, isPaidMenuPlan } from "@/lib/menuPlan";
import { hasTableSessionInSearch } from "@/lib/menuTable";

/**
 * AI chat ordering (ai-order webhook, cart, suggestion Add, checkout)
 * only when the menu is paid AND the URL has ?table=.
 * Free menus and paid menus without table are browse-only in the UI (cards read-only; no Add/checkout).
 * Paid menus always use the ai-order webhook; only free menus use the discovery webhook.
 */
export function useAiChatCanOrder(): boolean {
  const ownerPlanType = useAppSelector((s) => s.menu.menuInfo?.ownerPlanType);
  const searchParams = useSearchParams();
  const hasTable = hasTableSessionInSearch(searchParams);

  if (isFreeMenuPlan(ownerPlanType)) return false;
  return isPaidMenuPlan(ownerPlanType) && hasTable;
}

export function useAiChatHasTable(): boolean {
  const searchParams = useSearchParams();
  return hasTableSessionInSearch(searchParams);
}
