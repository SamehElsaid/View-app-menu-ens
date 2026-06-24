"use client";

import { useMemo, type CSSProperties } from "react";
import { useAppSelector } from "@/store/hooks";
import {
  buildMusicBrandStyle,
  MUSIC_DEFAULT_PRIMARY,
  MUSIC_DEFAULT_SECONDARY,
} from "./moodEnergy";

export function useMusicBrandStyle(): CSSProperties {
  const menuCustomizations = useAppSelector(
    (state) => state.menu.menuCustomizations,
  );

  return useMemo(() => {
    const primary =
      menuCustomizations?.primaryColor?.trim() || MUSIC_DEFAULT_PRIMARY;
    const secondary =
      menuCustomizations?.secondaryColor?.trim() || MUSIC_DEFAULT_SECONDARY;
    return buildMusicBrandStyle(primary, secondary);
  }, [menuCustomizations?.primaryColor, menuCustomizations?.secondaryColor]);
}

export function applyMusicBrandVars(
  element: HTMLElement,
  vars: CSSProperties,
): () => void {
  const keys = Object.keys(vars);

  for (const key of keys) {
    const value = vars[key as keyof CSSProperties];
    if (value != null) {
      element.style.setProperty(key, String(value));
    }
  }

  return () => {
    for (const key of keys) {
      element.style.removeProperty(key);
    }
  };
}
