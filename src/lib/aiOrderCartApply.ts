import {
  notifySkyCartUpdated,
  readSkyCartFromCookie,
  type SkyCartItem,
  writeSkyCartToCookie,
} from "@/lib/skyTemplateCart";
import type {
  AiCartAction,
  AiCartActionType,
  AiOrderCartQuantities,
  AiOrderSuggestion,
} from "@/types/aiOrder";
import { DEFAULT_AI_ORDER_CURRENCY } from "@/types/aiOrder";
import { capSuggestionList } from "@/lib/aiOrderSuggestions";
import { resolveMenuItemImageSrc } from "@/lib/menuItemImage";
import type { MenuItem } from "@/types/menu";

const CART_ACTION_TYPES = new Set<AiCartActionType>([
  "add",
  "remove",
  "set_quantity",
]);

export function toRequestCartQuantities(
  cart: Record<number, SkyCartItem>,
): AiOrderCartQuantities {
  const out: AiOrderCartQuantities = {};
  for (const item of Object.values(cart)) {
    if (item.quantity > 0) {
      out[String(item.id)] = item.quantity;
    }
  }
  return out;
}

function buildSkyCartLine(
  localItem: MenuItem,
  quantity: number,
  displayName: (item: MenuItem) => string,
): SkyCartItem {
  return {
    id: localItem.id,
    quantity: Math.min(999, Math.max(1, Math.floor(quantity))),
    name: displayName(localItem),
    price: localItem.price,
    image: resolveMenuItemImageSrc(localItem.image),
  };
}

function normalizeCartActionType(raw: unknown): AiCartActionType | null {
  if (typeof raw !== "string") return null;
  const t = raw.trim().toLowerCase();
  if (t === "add" || t === "increment" || t === "increase") return "add";
  if (t === "remove" || t === "delete") return "remove";
  if (
    t === "set_quantity" ||
    t === "set" ||
    t === "setquantity" ||
    t === "set quantity"
  ) {
    return "set_quantity";
  }
  return CART_ACTION_TYPES.has(t as AiCartActionType)
    ? (t as AiCartActionType)
    : null;
}

function parseActionQuantity(row: Record<string, unknown>): number | undefined {
  const raw =
    row.quantity ?? row.qty ?? row.amount ?? row.count ?? row.value;
  if (raw === undefined) return undefined;
  const quantity = Number(raw);
  return Number.isFinite(quantity) ? quantity : undefined;
}

export function parseCartActions(raw: unknown): AiCartAction[] {
  if (!Array.isArray(raw)) return [];

  const out: AiCartAction[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const row = entry as Record<string, unknown>;
    const type = normalizeCartActionType(row.type);
    if (!type) continue;

    const itemId = Number(row.itemId ?? row.id ?? row.menuItemId);
    if (!Number.isInteger(itemId) || itemId <= 0) continue;

    const quantity = parseActionQuantity(row);

    out.push({
      type,
      itemId,
      quantity:
        quantity !== undefined && quantity > 0
          ? Math.floor(quantity)
          : undefined,
    });
  }
  return out;
}

export function setCartItemQuantity(
  itemId: number,
  quantity: number,
  ctx: {
    validMenuIds: Set<number>;
    localMenuById: Map<number, MenuItem>;
    displayName: (item: MenuItem) => string;
  },
): boolean {
  if (!ctx.validMenuIds.has(itemId)) return false;
  const localItem = ctx.localMenuById.get(itemId);
  if (!localItem) return false;

  const qty = Math.min(999, Math.max(1, Math.floor(quantity)));
  const next = { ...readSkyCartFromCookie() };
  next[itemId] = buildSkyCartLine(localItem, qty, ctx.displayName);
  writeSkyCartToCookie(next);
  notifySkyCartUpdated();
  return true;
}

/** Remove a line entirely from the cookie cart. */
export function removeCartItem(
  itemId: number,
  ctx: {
    validMenuIds: Set<number>;
  },
): boolean {
  if (!ctx.validMenuIds.has(itemId)) return false;

  const next = { ...readSkyCartFromCookie() };
  if (!next[itemId]) return false;

  delete next[itemId];
  writeSkyCartToCookie(next);
  notifySkyCartUpdated();
  return true;
}

export function increaseCartItemQuantity(
  itemId: number,
  delta: number,
  ctx: {
    validMenuIds: Set<number>;
    localMenuById: Map<number, MenuItem>;
    displayName: (item: MenuItem) => string;
  },
): boolean {
  if (!ctx.validMenuIds.has(itemId) || delta <= 0) return false;
  const localItem = ctx.localMenuById.get(itemId);
  if (!localItem) return false;

  const next = { ...readSkyCartFromCookie() };
  const existingQty = next[itemId]?.quantity ?? 0;
  if (existingQty <= 0) return false;

  next[itemId] = buildSkyCartLine(
    localItem,
    existingQty + Math.floor(delta),
    ctx.displayName,
  );
  writeSkyCartToCookie(next);
  notifySkyCartUpdated();
  return true;
}

export function applyCartActions(
  actions: AiCartAction[],
  ctx: {
    validMenuIds: Set<number>;
    localMenuById: Map<number, MenuItem>;
    displayName: (item: MenuItem) => string;
  },
): { changed: boolean; lastItemId?: number } {
  if (!actions.length) return { changed: false };

  const next = { ...readSkyCartFromCookie() };
  let changed = false;
  let lastItemId: number | undefined;

  for (const action of actions) {
    const id = action.itemId;
    if (!ctx.validMenuIds.has(id)) continue;

    const localItem = ctx.localMenuById.get(id);
    if (!localItem) continue;

    const existingQty = next[id]?.quantity ?? 0;

    switch (action.type) {
      case "add": {
        // quantity is a delta (increment), not an absolute target
        const deltaQty =
          action.quantity !== undefined && action.quantity > 0
            ? Math.floor(action.quantity)
            : 1;
        const currentQty = next[id]?.quantity ?? 0;
        next[id] = buildSkyCartLine(
          localItem,
          currentQty + deltaQty,
          ctx.displayName,
        );
        changed = true;
        lastItemId = id;
        break;
      }
      case "remove": {
        if (
          action.quantity === undefined ||
          !Number.isFinite(action.quantity) ||
          action.quantity <= 0
        ) {
          delete next[id];
        } else {
          const newQty = existingQty - Math.floor(action.quantity);
          if (newQty <= 0) {
            delete next[id];
          } else {
            next[id] = buildSkyCartLine(localItem, newQty, ctx.displayName);
          }
        }
        changed = true;
        lastItemId = id;
        break;
      }
      case "set_quantity": {
        // quantity is the final absolute amount in cart
        if (
          action.quantity === undefined ||
          !Number.isFinite(action.quantity)
        ) {
          continue;
        }
        const absoluteQty = Math.floor(action.quantity);
        if (absoluteQty <= 0) {
          delete next[id];
        } else {
          next[id] = buildSkyCartLine(localItem, absoluteQty, ctx.displayName);
        }
        changed = true;
        lastItemId = id;
        break;
      }
    }
  }

  if (!changed) return { changed: false };

  writeSkyCartToCookie(next);
  notifySkyCartUpdated();
  return { changed: true, lastItemId };
}

/** n8n may return item ids as numbers, strings, or { itemId } / { id } objects. */
function resolveSuggestionEntryId(entry: unknown): number | null {
  if (typeof entry === "number" && Number.isInteger(entry) && entry > 0) {
    return entry;
  }
  if (typeof entry === "string" && entry.trim()) {
    const parsed = Number(entry.trim());
    if (Number.isInteger(parsed) && parsed > 0) return parsed;
  }
  if (entry && typeof entry === "object") {
    const row = entry as Record<string, unknown>;
    const candidate =
      row.itemId != null ? Number(row.itemId) : row.id != null ? Number(row.id) : NaN;
    if (Number.isInteger(candidate) && candidate > 0) return candidate;
  }
  return null;
}

function readCurrencyCode(raw: unknown, fallback: string): string {
  if (typeof raw === "string" && raw.trim()) {
    return raw.trim().toUpperCase();
  }
  return fallback;
}

/** Full n8n suggestion object with display name + price. */
function readN8nSuggestionFields(
  entry: unknown,
  defaultCurrency: string,
): { name: string; price: number; currency: string; image?: string } | null {
  if (!entry || typeof entry !== "object") return null;
  const row = entry as Record<string, unknown>;
  const name =
    typeof row.name === "string"
      ? row.name.trim()
      : typeof row.nameAr === "string"
        ? row.nameAr.trim()
        : "";
  const price = Number(row.price);
  if (!name || !Number.isFinite(price) || price <= 0) return null;

  const imageRaw = row.image;
  const image =
    typeof imageRaw === "string" && imageRaw.trim()
      ? imageRaw.trim()
      : undefined;

  return {
    name,
    price,
    currency: readCurrencyCode(row.currency, defaultCurrency),
    image,
  };
}

function isBareIdSuggestionEntry(entry: unknown): boolean {
  if (typeof entry === "number") return true;
  if (typeof entry === "string" && entry.trim()) return true;
  if (entry && typeof entry === "object") {
    return readN8nSuggestionFields(entry, DEFAULT_AI_ORDER_CURRENCY) === null;
  }
  return false;
}

/**
 * Map n8n suggestions to display cards.
 * - Full objects: n8n name/price/currency; local menu validates id and fills missing image.
 * - Bare ids (numbers/strings or id-only objects): enrich name/price/image/currency from local menu.
 */
export function enrichAiSuggestions(
  raw: unknown[] | undefined,
  ctx: {
    validMenuIds: Set<number>;
    localMenuById: Map<number, MenuItem>;
    displayName: (item: MenuItem) => string;
    defaultCurrency: string;
  },
): AiOrderSuggestion[] {
  if (!raw?.length) return [];

  const defaultCurrency =
    ctx.defaultCurrency.trim().toUpperCase() || DEFAULT_AI_ORDER_CURRENCY;
  const out: AiOrderSuggestion[] = [];
  const seen = new Set<number>();

  for (const entry of raw) {
    const id = resolveSuggestionEntryId(entry);
    if (id == null || seen.has(id)) continue;
    if (!ctx.validMenuIds.has(id)) continue;

    const localItem = ctx.localMenuById.get(id);
    if (!localItem) continue;

    const fields = readN8nSuggestionFields(entry, defaultCurrency);

    if (fields) {
      seen.add(id);
      out.push({
        id,
        name: fields.name,
        price: fields.price,
        currency: fields.currency,
        image:
          fields.image != null
            ? resolveMenuItemImageSrc(fields.image)
            : resolveMenuItemImageSrc(localItem.image),
      });
      continue;
    }

    if (!isBareIdSuggestionEntry(entry)) continue;

    seen.add(id);
    out.push({
      id,
      name: ctx.displayName(localItem),
      price: localItem.price,
      currency: defaultCurrency,
      image: resolveMenuItemImageSrc(localItem.image),
    });
  }

  return capSuggestionList(out);
}
