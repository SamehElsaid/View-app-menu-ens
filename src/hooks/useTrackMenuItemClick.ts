"use client";

import { useCallback } from "react";
import { useAppSelector } from "@/store/hooks";
import { trackMenuItemClick } from "@/lib/trackMenuItemClick";
import type { MenuItem } from "@/types/menu";

/** Tracks product card clicks, then runs the template open handler. */
export function useTrackMenuItemClick() {
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);

  const trackItem = useCallback(
    (itemId: number) => {
      if (menuInfo?.slug) {
        trackMenuItemClick(menuInfo.slug, itemId);
      }
    },
    [menuInfo],
  );

  const openItem = useCallback(
    (item: MenuItem, open: (item: MenuItem) => void) => {
      trackItem(item.id);
      open(item);
    },
    [trackItem],
  );

  return { trackItem, openItem, menuSlug: menuInfo?.slug ?? null };
}
