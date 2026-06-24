"use client";

import { useAppSelector } from "@/store/hooks";

export function useIsMenuCatalogComplete(): boolean {
  const catalog = useAppSelector((state) => state.menu.catalog);
  const itemCount = useAppSelector((state) => state.menu.menu?.length ?? 0);

  if (!catalog) {
    return true;
  }

  if (typeof catalog.total === "number" && itemCount >= catalog.total) {
    return true;
  }

  return catalog.hasMore === false;
}
