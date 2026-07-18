"use client";

import { useSearchParams } from "next/navigation";
import { useIsOrderingEnabled } from "@/hooks/useIsOrderingEnabled";
import { hasTableSessionInSearch } from "@/lib/menuTable";

/**
 * AI chat cart / Add / checkout when ordering is enabled the same way as the
 * floating cart: valid paid table (?table=) **or** an active delivery session.
 * Free discovery UI stays browse-only until delivery/table unlocks ordering.
 */
export function useAiChatCanOrder(): boolean {
  const { isOrderingEnabled } = useIsOrderingEnabled();
  return isOrderingEnabled;
}

export function useAiChatHasTable(): boolean {
  const searchParams = useSearchParams();
  return hasTableSessionInSearch(searchParams);
}
