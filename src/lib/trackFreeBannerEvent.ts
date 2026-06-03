import { axiosPost } from "@/shared/axiosCall";

export type FreeBannerEventType = "impression" | "click";

/** Records a free-menu bottom branding banner event. */
export function trackFreeBannerEvent(
  menuSlug: string,
  type: FreeBannerEventType,
): void {
  const slug = menuSlug?.trim();
  if (!slug) return;

  void axiosPost<{ type: FreeBannerEventType }, unknown>(
    `/public/menus/${encodeURIComponent(slug)}/branding-events`,
    "ar",
    { type },
    false,
    true,
  );
}
