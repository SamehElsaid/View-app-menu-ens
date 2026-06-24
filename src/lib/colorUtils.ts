export function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.trim().replace("#", "");
  if (normalized.length !== 3 && normalized.length !== 6) {
    return `rgba(37, 99, 235, ${alpha})`;
  }

  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;

  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);

  if ([r, g, b].some((channel) => Number.isNaN(channel))) {
    return `rgba(37, 99, 235, ${alpha})`;
  }

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
