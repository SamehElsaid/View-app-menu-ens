/**
 * Table-order cart (cookie `sky_template_cart`): shared by all menu templates + RequestStaffButton.
 * Invalid entries (missing id, NaN keys, etc.) are dropped on read.
 */

import type { MenuItem } from "@/types/menu";

export const SKY_CART_COOKIE_KEY = "sky_template_cart";
export const SKY_CART_UPDATED_EVENT = "sky-template-cart-updated";
export const SKY_CART_COOKIE_EXPIRES_DAYS = 1;

export type SkyCartItem = {
  id: number;
  quantity: number;
  name: string;
  price: number;
  image: string;
};

export function isValidSkyCartItemId(id: unknown): id is number {
  return (
    typeof id === "number" &&
    Number.isFinite(id) &&
    id > 0 &&
    id === Math.floor(id) &&
    id <= 2147483647
  );
}

/** Drop lines without a valid numeric id; normalize keys to match `item.id`. */
export function sanitizeSkyCart(raw: unknown): Record<number, SkyCartItem> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<number, SkyCartItem> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const keyNum = Number(k);
    if (!isValidSkyCartItemId(keyNum)) continue;
    if (!v || typeof v !== "object") continue;
    const o = v as Record<string, unknown>;
    const id = o.id;
    if (!isValidSkyCartItemId(id) || id !== keyNum) continue;
    const qty = Number(o.quantity);
    if (!Number.isFinite(qty) || qty < 1) continue;
    const price = Number(o.price);
    if (!Number.isFinite(price) || price < 0) continue;
    out[keyNum] = {
      id,
      quantity: Math.min(999, Math.floor(qty)),
      name: String(o.name ?? ""),
      price,
      image: String(o.image ?? ""),
    };
  }
  return out;
}

export function readSkyCartFromCookie(): Record<number, SkyCartItem> {
  if (typeof document === "undefined") return {};
  const cookieEntry = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${SKY_CART_COOKIE_KEY}=`));
  if (!cookieEntry) return {};
  try {
    const cookieValue = decodeURIComponent(cookieEntry.split("=")[1] || "");
    const parsed = JSON.parse(cookieValue) as unknown;
    return sanitizeSkyCart(parsed);
  } catch {
    return {};
  }
}

export function notifySkyCartUpdated(): void {
  window.dispatchEvent(new Event(SKY_CART_UPDATED_EVENT));
}

export function writeSkyCartToCookie(
  cart: Record<number, SkyCartItem>,
): void {
  if (typeof document === "undefined") return;
  const expiresDate = new Date(
    Date.now() + SKY_CART_COOKIE_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
  );
  document.cookie = `${SKY_CART_COOKIE_KEY}=${encodeURIComponent(
    JSON.stringify(cart),
  )}; expires=${expiresDate.toUTCString()}; path=/; SameSite=Lax`;
}

/** Add or remove quantity for one line; notifies listeners (e.g. RequestStaffButton, SkyTemplate). */
export function upsertSkyCartQuantityFromMenuItem(
  item: MenuItem,
  quantityToAdd: number,
): void {
  if (!isValidSkyCartItemId(item.id)) return;
  const current = readSkyCartFromCookie();
  const next = { ...current };
  const nextQty = (next[item.id]?.quantity ?? 0) + quantityToAdd;
  if (nextQty <= 0) {
    delete next[item.id];
  } else {
    next[item.id] = {
      id: item.id,
      quantity: Math.min(999, nextQty),
      name: item.name,
      price: item.price,
      image: item.image,
    };
  }
  writeSkyCartToCookie(next);
  notifySkyCartUpdated();
}
