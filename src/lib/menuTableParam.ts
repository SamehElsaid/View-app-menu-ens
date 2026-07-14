/**
 * Read `?table=` / `?tableNumber=` from a query-string source.
 * Shared so table QR mode can reliably disable delivery flows.
 */
export function readTableParam(searchParams: {
  get: (key: string) => string | null;
}): string {
  return (
    searchParams.get("table")?.trim() ||
    searchParams.get("tableNumber")?.trim() ||
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
