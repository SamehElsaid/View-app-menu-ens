"use client";

import { useSearchParams } from "next/navigation";
import { useSyncExternalStore } from "react";
import {
  readTableParam,
  readTableParamFromWindow,
} from "@/lib/menuTableParam";

/**
 * Table QR query param for the current URL.
 * Prefers next/navigation searchParams, falls back to window.location so
 * hydration / locale rewrites cannot briefly miss `?table=` and start delivery.
 */
export function useMenuTableParam(): string {
  const searchParams = useSearchParams();
  const fromNext = readTableParam(searchParams);
  const fromWindow = useSyncExternalStore(
    () => () => {},
    readTableParamFromWindow,
    () => "",
  );

  return fromNext || fromWindow;
}
