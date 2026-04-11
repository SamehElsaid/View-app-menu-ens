/** Parse #RRGGBB to rgba() for shadows and overlays */
export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "").trim();
  if (h.length !== 6 || Number.isNaN(parseInt(h, 16))) {
    return `rgba(76, 17, 33, ${alpha})`;
  }
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
