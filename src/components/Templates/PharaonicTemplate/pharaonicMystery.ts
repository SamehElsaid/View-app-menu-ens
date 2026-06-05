export const MYSTERY_WHISPERS = {
  ar: [
    "ما خُفِيَ في الظل… يُقدَّم اليوم",
    "البردي يهمس بالأسعار",
    "اقترب… لتكشف كنوز القائمة",
  ],
  en: [
    "What the shadow held… is served today",
    "The papyrus whispers its prices",
    "Draw near… unveil the menu’s treasures",
  ],
} as const;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
