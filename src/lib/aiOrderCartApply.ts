import { normalizeArabicInput } from "@/lib/aiOrderConversation";
import { capSuggestionList } from "@/lib/aiOrderSuggestions";
import { resolveMenuItemImageSrc } from "@/lib/menuItemImage";
import {
  computeMenuItemUnitPrice,
  getMenuItemSizes,
  getMenuItemVariants,
  hasMenuItemOptions,
} from "@/lib/menuItemOptions";
import {
  buildSkyCartLineKey,
  getCartQuantityForMenuItem,
  notifySkyCartUpdated,
  readSkyCartFromCookie,
  updateSkyCartLineQuantity,
  upsertSkyCartFromMenuItemWithOptions,
  type SkyCart,
  type SkyCartItem,
  writeSkyCartToCookie,
} from "@/lib/skyTemplateCart";
import type {
  AiCartAction,
  AiCartActionType,
  AiOrderCartLine,
  AiOrderCartQuantities,
  AiOrderSuggestion,
} from "@/types/aiOrder";
import { DEFAULT_AI_ORDER_CURRENCY } from "@/types/aiOrder";
import type {
  MenuItem,
  MenuItemSizeOption,
  MenuItemVariantOption,
} from "@/types/menu";

const CART_ACTION_TYPES = new Set<AiCartActionType>([
  "add",
  "remove",
  "set_quantity",
]);

export type AiCartApplyContext = {
  validMenuIds: Set<number>;
  localMenuById: Map<number, MenuItem>;
  displayName: (item: MenuItem) => string;
  locale?: string;
};

export type AiCartApplyResult = {
  changed: boolean;
  lastItemId?: number;
  lastLineKey?: string;
  needsOptions?: { itemId: number };
};

/** Collapse lines to itemId → total qty (legacy n8n field). */
export function toRequestCartQuantities(cart: SkyCart): AiOrderCartQuantities {
  const out: AiOrderCartQuantities = {};
  for (const item of Object.values(cart)) {
    if (item.quantity > 0) {
      out[String(item.id)] = (out[String(item.id)] ?? 0) + item.quantity;
    }
  }
  return out;
}

/** Line-level cart for n8n (preserves size/variant). */
export function toRequestCartLines(cart: SkyCart): AiOrderCartLine[] {
  return Object.values(cart)
    .filter((item) => item.quantity > 0)
    .map((item) => ({
      itemId: item.id,
      quantity: item.quantity,
      lineKey: item.lineKey,
      unitPrice: item.price,
      name: item.name,
      size: item.size ?? null,
      variant: item.variant ?? null,
    }));
}

function optionLabelMatch(candidate: string, target: string): boolean {
  const a = normalizeArabicInput(candidate);
  const b = normalizeArabicInput(target);
  if (!a || !b) return false;
  return a === b || a.includes(b) || b.includes(a);
}

export function resolveSizeOption(
  item: MenuItem,
  action: Pick<AiCartAction, "size" | "sizeName">,
): MenuItemSizeOption | null {
  const sizes = getMenuItemSizes(item);
  if (!sizes.length) return null;

  if (action.size && typeof action.size === "object") {
    const byExact = sizes.find(
      (s) =>
        s.nameAr === action.size!.nameAr &&
        s.nameEn === action.size!.nameEn &&
        s.price === action.size!.price,
    );
    if (byExact) return byExact;

    const byName = sizes.find(
      (s) =>
        optionLabelMatch(s.nameAr, action.size!.nameAr) ||
        optionLabelMatch(s.nameEn, action.size!.nameEn) ||
        optionLabelMatch(s.nameAr, action.size!.nameEn) ||
        optionLabelMatch(s.nameEn, action.size!.nameAr),
    );
    if (byName) return byName;
  }

  const sizeName =
    typeof action.sizeName === "string" ? action.sizeName.trim() : "";
  if (sizeName) {
    const matched = sizes.find(
      (s) =>
        optionLabelMatch(s.nameAr, sizeName) ||
        optionLabelMatch(s.nameEn, sizeName),
    );
    if (matched) return matched;
  }

  return null;
}

export function resolveVariantOption(
  item: MenuItem,
  action: Pick<AiCartAction, "variant" | "variantLabel">,
): MenuItemVariantOption | null {
  const variants = getMenuItemVariants(item);
  if (!variants.length) return null;

  if (action.variant && typeof action.variant === "object") {
    const byExact = variants.find(
      (v) =>
        v.labelAr === action.variant!.labelAr &&
        v.labelEn === action.variant!.labelEn &&
        v.price === action.variant!.price,
    );
    if (byExact) return byExact;

    const byLabel = variants.find(
      (v) =>
        optionLabelMatch(v.labelAr, action.variant!.labelAr) ||
        optionLabelMatch(v.labelEn, action.variant!.labelEn) ||
        optionLabelMatch(v.labelAr, action.variant!.labelEn) ||
        optionLabelMatch(v.labelEn, action.variant!.labelAr),
    );
    if (byLabel) return byLabel;
  }

  const variantLabel =
    typeof action.variantLabel === "string" ? action.variantLabel.trim() : "";
  if (variantLabel) {
    const matched = variants.find(
      (v) =>
        optionLabelMatch(v.labelAr, variantLabel) ||
        optionLabelMatch(v.labelEn, variantLabel),
    );
    if (matched) return matched;
  }

  return null;
}

/**
 * Resolve size/variant for a cart action.
 * Returns `needsOptions` when the item requires sizes/variants and they are missing
 * or names do not match the local menu.
 */
export function resolveActionOptions(
  item: MenuItem,
  action: Pick<AiCartAction, "size" | "sizeName" | "variant" | "variantLabel">,
):
  | { ok: true; size: MenuItemSizeOption | null; variant: MenuItemVariantOption | null }
  | { ok: false; needsOptions: true } {
  const sizes = getMenuItemSizes(item);
  const variants = getMenuItemVariants(item);

  if (!sizes.length && !variants.length) {
    return { ok: true, size: null, variant: null };
  }

  const size = sizes.length ? resolveSizeOption(item, action) : null;
  const variant = variants.length ? resolveVariantOption(item, action) : null;

  if (sizes.length > 0 && !size) {
    return { ok: false, needsOptions: true };
  }
  if (variants.length > 0 && !variant) {
    return { ok: false, needsOptions: true };
  }

  return { ok: true, size, variant };
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
  const raw = row.quantity ?? row.qty ?? row.amount ?? row.count ?? row.value;
  if (raw === undefined) return undefined;
  const quantity = Number(raw);
  return Number.isFinite(quantity) ? quantity : undefined;
}

function parseSizeFromRow(
  row: Record<string, unknown>,
): MenuItemSizeOption | null | undefined {
  const raw = row.size;
  if (raw == null) return undefined;
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const nameAr = typeof o.nameAr === "string" ? o.nameAr : "";
  const nameEn = typeof o.nameEn === "string" ? o.nameEn : "";
  const price = Number(o.price);
  if (!nameAr && !nameEn) return undefined;
  if (!Number.isFinite(price) || price < 0) return undefined;
  return { nameAr, nameEn, price };
}

function parseVariantFromRow(
  row: Record<string, unknown>,
): MenuItemVariantOption | null | undefined {
  const raw = row.variant;
  if (raw == null) return undefined;
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const labelAr = typeof o.labelAr === "string" ? o.labelAr : "";
  const labelEn = typeof o.labelEn === "string" ? o.labelEn : "";
  const price = Number(o.price);
  if (!labelAr && !labelEn) return undefined;
  if (!Number.isFinite(price) || price < 0) return undefined;
  return { labelAr, labelEn, price };
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
    const sizeName =
      typeof row.sizeName === "string"
        ? row.sizeName
        : typeof row.size_name === "string"
          ? row.size_name
          : undefined;
    const variantLabel =
      typeof row.variantLabel === "string"
        ? row.variantLabel
        : typeof row.variant_label === "string"
          ? row.variant_label
          : undefined;
    const size = parseSizeFromRow(row);
    const variant = parseVariantFromRow(row);

    out.push({
      type,
      itemId,
      quantity:
        quantity !== undefined && quantity > 0
          ? Math.floor(quantity)
          : undefined,
      sizeName: sizeName?.trim() || undefined,
      variantLabel: variantLabel?.trim() || undefined,
      size: size === undefined ? undefined : size,
      variant: variant === undefined ? undefined : variant,
    });
  }
  return out;
}

function findLinesForItem(cart: SkyCart, itemId: number): SkyCartItem[] {
  return Object.values(cart).filter((line) => line.id === itemId);
}

function removeAllLinesForItem(itemId: number): boolean {
  const current = readSkyCartFromCookie();
  const next = { ...current };
  let changed = false;
  for (const [key, line] of Object.entries(next)) {
    if (line.id === itemId) {
      delete next[key];
      changed = true;
    }
  }
  if (!changed) return false;
  writeSkyCartToCookie(next);
  notifySkyCartUpdated();
  return true;
}

/** Set absolute quantity on a specific line (by options). Creates the line if missing. */
export function setCartLineQuantity(
  itemId: number,
  quantity: number,
  ctx: AiCartApplyContext,
  options?: {
    size?: MenuItemSizeOption | null;
    variant?: MenuItemVariantOption | null;
  },
): boolean {
  if (!ctx.validMenuIds.has(itemId)) return false;
  const localItem = ctx.localMenuById.get(itemId);
  if (!localItem) return false;

  const size = options?.size ?? null;
  const variant = options?.variant ?? null;
  const lineKey = buildSkyCartLineKey(itemId, size, variant);
  const current = readSkyCartFromCookie();
  const existingQty = current[lineKey]?.quantity ?? 0;
  const target = Math.min(999, Math.max(0, Math.floor(quantity)));
  const delta = target - existingQty;

  if (delta === 0) return target > 0;
  if (target <= 0) {
    if (!current[lineKey]) return false;
    updateSkyCartLineQuantity(lineKey, -existingQty);
    return true;
  }

  upsertSkyCartFromMenuItemWithOptions(localItem, delta, {
    locale: ctx.locale ?? "ar",
    size,
    variant,
  });
  return true;
}

/** Remove one line by lineKey, or all lines for an itemId when options omitted. */
export function removeCartItem(
  itemId: number,
  ctx: { validMenuIds: Set<number> },
  options?: {
    size?: MenuItemSizeOption | null;
    variant?: MenuItemVariantOption | null;
    lineKey?: string;
  },
): boolean {
  if (!ctx.validMenuIds.has(itemId)) return false;

  if (options?.lineKey) {
    const current = readSkyCartFromCookie();
    const line = current[options.lineKey];
    if (!line || line.id !== itemId) return false;
    updateSkyCartLineQuantity(options.lineKey, -line.quantity);
    return true;
  }

  if (options && (options.size != null || options.variant != null)) {
    const lineKey = buildSkyCartLineKey(
      itemId,
      options.size ?? null,
      options.variant ?? null,
    );
    const current = readSkyCartFromCookie();
    const line = current[lineKey];
    if (!line) return false;
    updateSkyCartLineQuantity(lineKey, -line.quantity);
    return true;
  }

  return removeAllLinesForItem(itemId);
}

export function increaseCartLineQuantity(
  lineKey: string,
  delta: number,
): boolean {
  if (delta <= 0) return false;
  const current = readSkyCartFromCookie();
  if (!current[lineKey]) return false;
  updateSkyCartLineQuantity(lineKey, Math.floor(delta));
  return true;
}

/** @deprecated Prefer increaseCartLineQuantity with a lineKey. */
export function increaseCartItemQuantity(
  itemId: number,
  delta: number,
  ctx: AiCartApplyContext,
): boolean {
  if (!ctx.validMenuIds.has(itemId) || delta <= 0) return false;
  const lines = findLinesForItem(readSkyCartFromCookie(), itemId);
  if (!lines.length) return false;
  const last = lines[lines.length - 1]!;
  return increaseCartLineQuantity(last.lineKey, delta);
}

/** @deprecated Prefer setCartLineQuantity with options. */
export function setCartItemQuantity(
  itemId: number,
  quantity: number,
  ctx: AiCartApplyContext,
): boolean {
  const localItem = ctx.localMenuById.get(itemId);
  if (!localItem) return false;
  if (hasMenuItemOptions(localItem)) {
    // Without options, set absolute total on the first existing line or refuse create.
    const lines = findLinesForItem(readSkyCartFromCookie(), itemId);
    if (!lines.length) return false;
    const line = lines[0]!;
    return setCartLineQuantity(itemId, quantity, ctx, {
      size: line.size ?? null,
      variant: line.variant ?? null,
    });
  }
  return setCartLineQuantity(itemId, quantity, ctx);
}

export function applyCartActions(
  actions: AiCartAction[],
  ctx: AiCartApplyContext,
): AiCartApplyResult {
  if (!actions.length) return { changed: false };

  let changed = false;
  let lastItemId: number | undefined;
  let lastLineKey: string | undefined;
  let needsOptions: { itemId: number } | undefined;

  for (const action of actions) {
    const id = action.itemId;
    if (!ctx.validMenuIds.has(id)) continue;

    const localItem = ctx.localMenuById.get(id);
    if (!localItem) continue;

    switch (action.type) {
      case "add": {
        const resolved = resolveActionOptions(localItem, action);
        if (!resolved.ok) {
          needsOptions = { itemId: id };
          continue;
        }
        const deltaQty =
          action.quantity !== undefined && action.quantity > 0
            ? Math.floor(action.quantity)
            : 1;
        upsertSkyCartFromMenuItemWithOptions(localItem, deltaQty, {
          locale: ctx.locale ?? "ar",
          size: resolved.size,
          variant: resolved.variant,
        });
        changed = true;
        lastItemId = id;
        lastLineKey = buildSkyCartLineKey(
          id,
          resolved.size,
          resolved.variant,
        );
        break;
      }
      case "remove": {
        const resolved = resolveActionOptions(localItem, action);
        const cart = readSkyCartFromCookie();

        if (resolved.ok && (resolved.size || resolved.variant || !hasMenuItemOptions(localItem))) {
          const lineKey = buildSkyCartLineKey(
            id,
            resolved.size,
            resolved.variant,
          );
          const existing = cart[lineKey];
          if (!existing) break;

          if (
            action.quantity === undefined ||
            !Number.isFinite(action.quantity) ||
            action.quantity <= 0
          ) {
            updateSkyCartLineQuantity(lineKey, -existing.quantity);
          } else {
            updateSkyCartLineQuantity(
              lineKey,
              -Math.min(existing.quantity, Math.floor(action.quantity)),
            );
          }
          changed = true;
          lastItemId = id;
          lastLineKey = lineKey;
          break;
        }

        // No options specified: remove all lines for this item (or reduce across lines).
        const lines = findLinesForItem(cart, id);
        if (!lines.length) break;

        if (
          action.quantity === undefined ||
          !Number.isFinite(action.quantity) ||
          action.quantity <= 0
        ) {
          if (removeAllLinesForItem(id)) {
            changed = true;
            lastItemId = id;
          }
        } else {
          let remaining = Math.floor(action.quantity);
          for (const line of lines) {
            if (remaining <= 0) break;
            const deduct = Math.min(line.quantity, remaining);
            updateSkyCartLineQuantity(line.lineKey, -deduct);
            remaining -= deduct;
            lastLineKey = line.lineKey;
          }
          changed = true;
          lastItemId = id;
        }
        break;
      }
      case "set_quantity": {
        if (
          action.quantity === undefined ||
          !Number.isFinite(action.quantity)
        ) {
          continue;
        }
        const absoluteQty = Math.floor(action.quantity);
        const resolved = resolveActionOptions(localItem, action);

        if (!resolved.ok) {
          if (absoluteQty <= 0) {
            if (removeAllLinesForItem(id)) {
              changed = true;
              lastItemId = id;
            }
          } else {
            needsOptions = { itemId: id };
          }
          continue;
        }

        const lineKey = buildSkyCartLineKey(
          id,
          resolved.size,
          resolved.variant,
        );
        if (
          setCartLineQuantity(id, absoluteQty, ctx, {
            size: resolved.size,
            variant: resolved.variant,
          })
        ) {
          changed = true;
          lastItemId = id;
          lastLineKey = absoluteQty > 0 ? lineKey : undefined;
        }
        break;
      }
    }
  }

  return { changed, lastItemId, lastLineKey, needsOptions };
}

export function getSuggestionCartQty(cart: SkyCart, itemId: number): number {
  return getCartQuantityForMenuItem(cart, itemId);
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
      row.itemId != null
        ? Number(row.itemId)
        : row.id != null
          ? Number(row.id)
          : NaN;
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
