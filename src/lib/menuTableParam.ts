/**
 * Read dine-in table session from a query-string source
 * (`table`, `tableNumber`, or `tableId`) — same keys as `readTableSessionParam`.
 */
export function readTableParam(searchParams: {
  get: (key: string) => string | null;
}): string {
  return (
    searchParams.get("table")?.trim() ||
    searchParams.get("tableNumber")?.trim() ||
    searchParams.get("tableId")?.trim() ||
    ""
  );
}

export function readTableParamFromLocationSearch(search: string): string {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  return readTableParam(new URLSearchParams(raw));
}

/** Synchronous client read — use inside geo callbacks / hard guards. */
export function readTableParamFromWindow(): string {
  if (typeof window === "undefined") return "";
  return readTableParamFromLocationSearch(window.location.search);
}
