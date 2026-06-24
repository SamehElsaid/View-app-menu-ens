const SUPPORTED_MENU_THEMES = new Set([
  "default",
  "neon",
  "coffee",
  "sky",
  "onecard",
  "waffle",
  "vanilla",
]);

export function resolveMenuTheme(theme?: string | null): string {
  if (theme && SUPPORTED_MENU_THEMES.has(theme)) {
    return theme;
  }
  return "default";
}
