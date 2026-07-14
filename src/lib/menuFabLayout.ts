/**
 * Shared corner FAB / mobile tab-bar layout (cart + table services).
 */

export function getMenuFabSideClass(isArabic: boolean): string {
  return isArabic ? "left-3" : "right-3";
}

/**
 * Bottom inset for floating corner FABs (desktop stack fallback).
 * Phone ordering UI uses a full-width bar instead (`MenuCornerFabs`).
 */
export const MENU_CART_FAB_BOTTOM_CLASS =
  "bottom-[calc(1.75rem+env(safe-area-inset-bottom,0px))] md:bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))]";

/** Desktop-only bottom inset for the table-session FAB stack. */
export const MENU_DESKTOP_FAB_BOTTOM_CLASS =
  "md:bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))]";

/**
 * Clearance above the full-width mobile tab bar (chat FAB, etc.).
 */
export const MENU_MOBILE_TAB_BAR_CLEARANCE_CLASS =
  "bottom-[calc(5.75rem+env(safe-area-inset-bottom,0px))]";

/** Themes that use a dark espresso-style mobile dock. */
const DARK_MOBILE_TAB_BAR_THEMES = new Set(["coffee"]);

export function isDarkMobileTabBarTheme(theme?: string | null): boolean {
  return Boolean(theme && DARK_MOBILE_TAB_BAR_THEMES.has(theme));
}

/**
 * Full-width mobile tab-bar shell classes (phone only; use with max-md:).
 * Coffee uses an espresso dock; other themes keep the light dock.
 */
export function getMenuMobileTabBarClasses(theme?: string | null): string {
  if (isDarkMobileTabBarTheme(theme)) {
    return [
      "max-md:border-t max-md:border-[#3B332E]",
      "max-md:bg-[#17120F]/95 max-md:px-1 max-md:pt-1.5",
      "max-md:pb-[max(0.5rem,env(safe-area-inset-bottom,0px))]",
      "max-md:shadow-[0_-10px_28px_rgba(0,0,0,0.45)] max-md:backdrop-blur-md",
    ].join(" ");
  }

  return [
    "max-md:border-t max-md:border-zinc-200/90",
    "max-md:bg-white/95 max-md:px-1 max-md:pt-1.5",
    "max-md:pb-[max(0.5rem,env(safe-area-inset-bottom,0px))]",
    "max-md:shadow-[0_-8px_24px_rgba(15,23,42,0.08)] max-md:backdrop-blur-md",
  ].join(" ");
}

/**
 * Idle / hover styles for equal-width phone tab buttons inside the dock.
 */
export function getMenuMobileTabItemClasses(theme?: string | null): string {
  if (isDarkMobileTabBarTheme(theme)) {
    return "text-[#B6AA99] hover:bg-[#F2B705]/10 hover:text-[#F2B705]";
  }
  return "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900";
}

/**
 * Active (e.g. wifi open) styles for phone tab buttons.
 */
export function getMenuMobileTabItemActiveClasses(theme?: string | null): string {
  if (isDarkMobileTabBarTheme(theme)) {
    return "bg-[#F2B705]/15 text-[#F2B705]";
  }
  return "bg-(--bg-main)/10 text-(--bg-main)";
}

/**
 * Phone cart icon color inside the dock (max-md: only).
 * Uses currentColor so column hover can tint the icon.
 */
export function getMenuMobileTabCartIconClasses(theme?: string | null): string {
  void theme;
  return "max-md:text-current";
}

/**
 * Phone cart label color inside the dock.
 * Phone inherits column color; desktop uses accent.
 */
export function getMenuMobileTabCartLabelClasses(theme?: string | null): string {
  void theme;
  return "max-md:text-current md:text-(--bg-main)";
}

/**
 * Phone cart column surface + text (max-md: only).
 */
export function getMenuMobileTabCartColumnClasses(theme?: string | null): string {
  if (isDarkMobileTabBarTheme(theme)) {
    return "max-md:text-[#B6AA99] max-md:hover:bg-[#F2B705]/10 max-md:hover:text-[#F2B705]";
  }
  return "max-md:text-zinc-600 max-md:hover:bg-zinc-100 max-md:hover:text-zinc-900";
}
