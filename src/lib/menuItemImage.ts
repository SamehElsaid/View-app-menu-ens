import placeholder from "@/components/img/30690.png";

/** Bundled default used when a menu item has no image URL. */
export const DEFAULT_MENU_ITEM_IMAGE_SRC = placeholder.src;

/**
 * Resolves a menu item image URL: empty/whitespace → default placeholder,
 * absolute/data URLs unchanged, relative paths joined to the API host (same as ImageLoad).
 */
export function resolveMenuItemImageSrc(
  src: string | undefined | null,
): string {
  const trimmed = src?.trim();
  if (!trimmed) return DEFAULT_MENU_ITEM_IMAGE_SRC;

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }

  const baseApi = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseApi) return trimmed;

  const baseHost = baseApi.replace(/\/api\/?$/, "");
  const normalizedPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${baseHost}${normalizedPath}`;
}
