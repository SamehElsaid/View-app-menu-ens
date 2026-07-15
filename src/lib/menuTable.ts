export type MenuTableRef = {
  id?: number | string;
  Id?: number | string;
  tableNumber?: string | null;
  TableNumber?: string | null;
  isActive?: boolean | number | null;
  IsActive?: boolean | number | null;
};

/** Missing `isActive` → treat as active (older payloads). Explicit false/0 → inactive. */
export function isMenuTableActive(table: unknown): boolean {
  if (!table || typeof table !== "object") return false;
  const row = table as MenuTableRef;
  const raw = row.isActive ?? row.IsActive;
  if (raw === undefined || raw === null) return true;
  if (typeof raw === "boolean") return raw;
  if (typeof raw === "number") return raw !== 0;
  return Boolean(raw);
}

export function tableRowId(table: unknown): number | null {
  if (!table || typeof table !== "object") return null;
  const row = table as MenuTableRef;
  const raw = row.id ?? row.Id;
  if (raw === undefined || raw === null) return null;
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function isRegisteredMenuTable(table: unknown): boolean {
  return tableRowId(table) !== null;
}

export function readMenuTableRef(menuInfo: unknown): MenuTableRef | null {
  if (!menuInfo || typeof menuInfo !== "object") return null;
  const table = (menuInfo as { table?: unknown }).table;
  if (!table || typeof table !== "object") return null;
  return table as MenuTableRef;
}

export function readMenuTableNumber(table: unknown): string | null {
  if (!table || typeof table !== "object") return null;
  const row = table as MenuTableRef;
  const raw = row.tableNumber ?? row.TableNumber;
  if (raw === undefined || raw === null) return null;
  const value = String(raw).trim();
  return value || null;
}

export function tableMatchesParam(table: unknown, param: string): boolean {
  const needle = param.trim();
  if (!needle) return false;

  const label = readMenuTableNumber(table);
  if (label !== null && label === needle) return true;

  const id = tableRowId(table);
  return id !== null && String(id) === needle;
}

export function readMenuTables(menuInfo: unknown): MenuTableRef[] | null {
  if (!menuInfo || typeof menuInfo !== "object") return null;
  const tables = (menuInfo as { tables?: unknown }).tables;
  if (!Array.isArray(tables)) return null;
  return tables as MenuTableRef[];
}

function isUnresolvedTableStub(table: unknown, param: string): boolean {
  if (!table || typeof table !== "object") return false;
  if (isRegisteredMenuTable(table)) return false;
  const label = readMenuTableNumber(table);
  return label === param.trim();
}

/** Read table session from URL (`table`, `tableNumber`, or `tableId`). */
export function readTableSessionParam(
  searchParams: { get: (key: string) => string | null } | URLSearchParams,
): string {
  return (
    searchParams.get("table")?.trim() ||
    searchParams.get("tableNumber")?.trim() ||
    searchParams.get("tableId")?.trim() ||
    ""
  );
}

/** True when the guest opened a table QR / dine-in session URL. */
export function hasTableSessionInSearch(
  search: string | { get: (key: string) => string | null } | URLSearchParams,
): boolean {
  if (typeof search === "string") {
    const params = new URLSearchParams(
      search.startsWith("?") ? search.slice(1) : search,
    );
    return Boolean(readTableSessionParam(params));
  }
  return Boolean(readTableSessionParam(search));
}

/**
 * `true` = registered **active** table for this param.
 * `false` = confirmed invalid (unknown, inactive, or unresolved stub).
 * `null` = cannot tell yet (no tables list on menu) — do not strip URL.
 *
 * Inactive tables fall through to the regular (non-QR) menu.
 */
export function isValidTableParam(
  menuInfo: unknown,
  param: string,
): boolean | null {
  const needle = param.trim();
  if (!needle) return false;

  const resolved = readMenuTableRef(menuInfo);
  if (
    isRegisteredMenuTable(resolved) &&
    tableMatchesParam(resolved, needle)
  ) {
    return isMenuTableActive(resolved);
  }

  if (isUnresolvedTableStub(resolved, needle)) {
    return false;
  }

  const tables = readMenuTables(menuInfo);
  if (tables === null) return null;
  if (tables.length === 0) return false;

  const match = tables.find(
    (row) => tableMatchesParam(row, needle) && isRegisteredMenuTable(row),
  );
  if (!match) return false;
  return isMenuTableActive(match);
}
