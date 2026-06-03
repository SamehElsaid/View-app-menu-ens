/** Fire-and-forget: record a product card open for menu analytics. */
export function trackMenuItemClick(slug: string, itemId: number): void {
  const menuSlug = String(slug ?? "").trim();
  const id = Number(itemId);
  if (!menuSlug || !Number.isFinite(id) || id <= 0) return;

  const base = (process.env.NEXT_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");
  if (!base) return;

  const url = `${base}/public/menu/${encodeURIComponent(menuSlug)}/items/${id}/view`;
  void fetch(url, { method: "POST", keepalive: true }).catch(() => {});
}
