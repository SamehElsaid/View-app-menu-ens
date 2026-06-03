/** Fire-and-forget ad click tracking for public menu viewers. */
export function trackAdClick(adId: number): void {
  const base = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (!base || !Number.isFinite(adId) || adId < 1) return;

  fetch(`${base}/public/ads/${adId}/click`, { method: "POST" }).catch(
    () => undefined,
  );
}
