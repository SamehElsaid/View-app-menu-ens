import type { CSSProperties } from "react";

import { resolveMenuItemImageSrc } from "@/lib/menuItemImage";
import type { Category, MenuItem } from "@/types/menu";



/** Arcane palette — Zaun indigo, Hextech cyan, Piltover brass & shimmer pink */

export const MUSIC_BRAND = {

  honeydew: "#F8FAFF",

  peach: "#6366F1",

  coral: "#EC4899",

  tomato: "#4338CA",

  sky: "#06B6D4",

  darkBg: "#0F172A",

  darkCard: "#1E1B4B",

} as const;



/** Brand mood keys — each maps to an Arcane energy in the UI */

export type MoodKey = "tomato" | "sky" | "peach" | "coral";



export const MOOD_CYCLE: MoodKey[] = ["tomato", "sky", "peach", "coral"];



const MOOD_VARS: Record<

  MoodKey,

  {

    accent: string;

    accentSoft: string;

    bgA: string;

    bgB: string;

    bgC: string;

    pulseMs: string;

  }

> = {

  tomato: {

    accent: MUSIC_BRAND.tomato,

    accentSoft: "color-mix(in srgb, var(--color-brand-tomato) 28%, transparent)",

    bgA: "color-mix(in srgb, var(--color-brand-tomato) 18%, transparent)",

    bgB: "color-mix(in srgb, var(--color-brand-peach) 38%, transparent)",

    bgC: "color-mix(in srgb, var(--color-brand-coral) 12%, transparent)",

    pulseMs: "2600ms",

  },

  sky: {

    accent: MUSIC_BRAND.sky,

    accentSoft: "color-mix(in srgb, var(--color-brand-sky) 32%, transparent)",

    bgA: "color-mix(in srgb, var(--color-brand-sky) 24%, transparent)",

    bgB: "color-mix(in srgb, var(--color-brand-honeydew) 60%, transparent)",

    bgC: "color-mix(in srgb, var(--color-brand-tomato) 10%, transparent)",

    pulseMs: "3200ms",

  },

  peach: {

    accent: MUSIC_BRAND.peach,

    accentSoft: "color-mix(in srgb, var(--color-brand-peach) 48%, transparent)",

    bgA: "color-mix(in srgb, var(--color-brand-peach) 40%, transparent)",

    bgB: "color-mix(in srgb, var(--color-brand-honeydew) 65%, transparent)",

    bgC: "color-mix(in srgb, var(--color-brand-sky) 12%, transparent)",

    pulseMs: "3800ms",

  },

  coral: {

    accent: MUSIC_BRAND.coral,

    accentSoft: "color-mix(in srgb, var(--color-brand-coral) 30%, transparent)",

    bgA: "color-mix(in srgb, var(--color-brand-coral) 22%, transparent)",

    bgB: "color-mix(in srgb, var(--color-brand-peach) 35%, transparent)",

    bgC: "color-mix(in srgb, var(--color-brand-tomato) 10%, transparent)",

    pulseMs: "2900ms",

  },

};



export const MOOD_GLOW_HEX: Record<MoodKey, string> = {

  tomato: MUSIC_BRAND.tomato,

  sky: MUSIC_BRAND.sky,

  peach: MUSIC_BRAND.peach,

  coral: MUSIC_BRAND.coral,

};



/** Per-product showcase theme — accent, glow, and ambient tint */

export type ProductTheme = {

  accentColor: string;

  glowColor: string;

  backgroundTint: string;

};



export const PRODUCT_THEME: Record<MoodKey, ProductTheme> = {

  tomato: {

    accentColor: MUSIC_BRAND.tomato,

    glowColor: "color-mix(in srgb, var(--color-brand-tomato) 42%, transparent)",

    backgroundTint:

      "color-mix(in srgb, var(--color-brand-tomato) 14%, var(--color-brand-honeydew))",

  },

  sky: {

    accentColor: MUSIC_BRAND.sky,

    glowColor: "color-mix(in srgb, var(--color-brand-sky) 48%, transparent)",

    backgroundTint:

      "color-mix(in srgb, var(--color-brand-sky) 18%, var(--color-brand-honeydew))",

  },

  peach: {

    accentColor: MUSIC_BRAND.peach,

    glowColor: "color-mix(in srgb, var(--color-brand-peach) 55%, transparent)",

    backgroundTint:

      "color-mix(in srgb, var(--color-brand-peach) 28%, var(--color-brand-honeydew))",

  },

  coral: {

    accentColor: MUSIC_BRAND.coral,

    glowColor: "color-mix(in srgb, var(--color-brand-coral) 45%, transparent)",

    backgroundTint:

      "color-mix(in srgb, var(--color-brand-coral) 16%, var(--color-brand-honeydew))",

  },

};



export function getProductTheme(mood: MoodKey): ProductTheme {

  return PRODUCT_THEME[mood];

}



export function moodForIndex(index: number): MoodKey {

  const i =

    ((index % MOOD_CYCLE.length) + MOOD_CYCLE.length) % MOOD_CYCLE.length;

  return MOOD_CYCLE[i];

}



export function getCategoryMood(

  categoryId: number | null,

  categories: Category[],

): MoodKey {

  if (categoryId === null) return "tomato";

  const idx = categories.findIndex((c) => c.id === categoryId);

  return moodForIndex(idx >= 0 ? idx + 1 : 0);

}



export function getProductMood(item: MenuItem | null, items: MenuItem[]): MoodKey {

  if (!item) return "peach";

  const idx = items.findIndex((i) => i.id === item.id);

  return moodForIndex(idx >= 0 ? idx : 0);

}



export function moodToStyle(mood: MoodKey): CSSProperties {

  const v = MOOD_VARS[mood];

  return {

    "--mood-accent": v.accent,

    "--mood-accent-soft": v.accentSoft,

    "--mood-bg-a": v.bgA,

    "--mood-bg-b": v.bgB,

    "--mood-bg-c": v.bgC,

    "--mood-pulse-duration": v.pulseMs,

  } as CSSProperties;

}



export type MusicMoodState = {

  categoryMood: MoodKey;

  productMood: MoodKey;

  atmosphereMood: MoodKey;

  style: CSSProperties;

};



export function resolveMusicMood(

  activeCategoryId: number | null,

  categories: Category[],

  activeItem: MenuItem | null,

  items: MenuItem[],

): MusicMoodState {

  const categoryMood = getCategoryMood(activeCategoryId, categories);

  const productMood = getProductMood(activeItem, items);

  const atmosphereMood = activeItem ? productMood : categoryMood;

  return {

    categoryMood,

    productMood,

    atmosphereMood,

    style: moodToStyle(atmosphereMood),

  };

}



export type ShowcaseProduct = {

  id: number;

  name: string;

  description: string;

  image: string;

  mood: MoodKey;

};



export function pickItemName(item: MenuItem, locale: "ar" | "en"): string {

  if (locale === "ar") {

    return item.nameAr?.trim() || item.name;

  }

  return item.nameEn?.trim() || item.name;

}



export function pickItemDescription(item: MenuItem, locale: "ar" | "en"): string {

  if (locale === "ar") {

    return (

      item.descriptionAr?.trim() ||

      item.description?.trim() ||

      "منتج مختار بعناية من قائمتنا."

    );

  }

  return (

    item.descriptionEn?.trim() ||

    item.description?.trim() ||

    "A carefully selected item from our menu."

  );

}



/** Latest menu items first (highest id), mapped for the hero showcase. */

function hasMenuItemImage(item: MenuItem): boolean {
  return Boolean(item.image?.trim());
}

export function mapMenuItemsToShowcase(

  items: MenuItem[],

  options: { limit?: number; locale?: "ar" | "en" } = {},

): ShowcaseProduct[] {

  const { limit = 5, locale = "en" } = options;

  return [...items]

    .filter((item) => item.available !== false && hasMenuItemImage(item))

    .sort((a, b) => b.id - a.id)

    .slice(0, limit)

    .map((item, index) => ({

      id: item.id,

      name: pickItemName(item, locale),

      description: pickItemDescription(item, locale),

      image: resolveMenuItemImageSrc(item.image),

      mood: moodForIndex(index + 1),

    }));

}

