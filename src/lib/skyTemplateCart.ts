"use client";

/**
 * Table-order cart (cookie `sky_template_cart`): shared by all menu templates + RequestStaffButton.
 * Invalid entries (missing id, NaN keys, etc.) are dropped on read.
 */

import { startTransition } from "react";
import type {
  MenuItem,
  MenuItemSizeOption,
  MenuItemVariantOption,
} from "@/types/menu";
import {
  computeMenuItemUnitPrice,
  pickSizeLabel,
  pickVariantLabel,
} from "@/lib/menuItemOptions";
import { resolveMenuItemImageSrc } from "@/lib/menuItemImage";

export const SKY_CART_COOKIE_KEY = "sky_template_cart";
export const SKY_CART_UPDATED_EVENT = "sky-template-cart-updated";
export const SKY_CART_COOKIE_EXPIRES_DAYS = 1;

export type SkyCartItem = {
  lineKey: string;
  id: number;
  quantity: number;
  name: string;
  price: number;
  image: string;
  size?: MenuItemSizeOption | null;
  variant?: MenuItemVariantOption | null;
};

export type SkyCart = Record<string, SkyCartItem>;

export function isValidSkyCartItemId(id: unknown): id is number {
  return (
    typeof id === "number" &&
    Number.isFinite(id) &&
    id > 0 &&
    id === Math.floor(id) &&
    id <= 2147483647
  );
}

function isValidSizeOption(raw: unknown): raw is MenuItemSizeOption {
  if (!raw || typeof raw !== "object") return false;
  const o = raw as Record<string, unknown>;
  return (
    typeof o.nameAr === "string" &&
    typeof o.nameEn === "string" &&
    typeof o.price === "number" &&
    Number.isFinite(o.price) &&
    o.price >= 0
  );
}

function isValidVariantOption(raw: unknown): raw is MenuItemVariantOption {
  if (!raw || typeof raw !== "object") return false;
  const o = raw as Record<string, unknown>;
  return (
    typeof o.labelAr === "string" &&
    typeof o.labelEn === "string" &&
    typeof o.price === "number" &&
    Number.isFinite(o.price) &&
    o.price >= 0
  );
}

export function buildSkyCartLineKey(
  itemId: number,
  size?: MenuItemSizeOption | null,
  variant?: MenuItemVariantOption | null,
): string {
  if (!size && !variant) return String(itemId);
  const sizePart = size
    ? `${size.nameEn}::${size.nameAr}::${size.price}`
    : "_";
  const variantPart = variant
    ? `${variant.labelEn}::${variant.labelAr}::${variant.price}`
    : "_";
  return `${itemId}__${sizePart}__${variantPart}`;
}

function buildCartDisplayName(
  item: MenuItem,
  locale: string,
  size?: MenuItemSizeOption | null,
  variant?: MenuItemVariantOption | null,
): string {
  const baseName =
    locale === "ar" ? item.nameAr || item.name : item.nameEn || item.name;
  const parts = [baseName];
  if (size) parts.push(pickSizeLabel(size, locale));
  if (variant) parts.push(pickVariantLabel(variant, locale));
  return parts.join(" · ");
}

/** Drop lines without a valid numeric id; normalize keys to `lineKey`. */
export function sanitizeSkyCart(raw: unknown): SkyCart {
  if (!raw || typeof raw !== "object") return {};
  const out: SkyCart = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!v || typeof v !== "object") continue;
    const o = v as Record<string, unknown>;
    const id = o.id;
    if (!isValidSkyCartItemId(id)) continue;
    const qty = Number(o.quantity);
    if (!Number.isFinite(qty) || qty < 1) continue;
    const price = Number(o.price);
    if (!Number.isFinite(price) || price < 0) continue;

    const size = isValidSizeOption(o.size) ? o.size : null;
    const variant = isValidVariantOption(o.variant) ? o.variant : null;
    const lineKey =
      typeof o.lineKey === "string" && o.lineKey.trim()
        ? o.lineKey.trim()
        : buildSkyCartLineKey(id, size, variant);

    if (out[lineKey]) continue;

    out[lineKey] = {
      lineKey,
      id,
      quantity: Math.min(999, Math.floor(qty)),
      name: String(o.name ?? ""),
      price,
      image: String(o.image ?? ""),
      size,
      variant,
    };
  }
  return out;
}

export function readSkyCartFromCookie(): SkyCart {
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

export function getCartQuantityForMenuItem(cart: SkyCart, itemId: number): number {
  return Object.values(cart)
    .filter((line) => line.id === itemId)
    .reduce((sum, line) => sum + line.quantity, 0);
}

/** Notify cart listeners after the current render/commit (avoids cross-component setState during render). */
export function notifySkyCartUpdated(): void {
  if (typeof window === "undefined") return;
  setTimeout(() => {
    window.dispatchEvent(new Event(SKY_CART_UPDATED_EVENT));
  }, 0);
}

/** Subscribe with deferred, low-priority cart state sync (safe for cross-component updates). */
export function subscribeSkyCartUpdated(onSync: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = () => {
    requestAnimationFrame(() => {
      startTransition(onSync);
    });
  };

  window.addEventListener(SKY_CART_UPDATED_EVENT, handler);
  return () => window.removeEventListener(SKY_CART_UPDATED_EVENT, handler);
}

export function writeSkyCartToCookie(cart: SkyCart): void {
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
  upsertSkyCartFromMenuItemWithOptions(item, quantityToAdd);
}

export function upsertSkyCartFromMenuItemWithOptions(
  item: MenuItem,
  quantityToAdd: number,
  options?: {
    locale?: string;
    size?: MenuItemSizeOption | null;
    variant?: MenuItemVariantOption | null;
  },
): void {
  if (!isValidSkyCartItemId(item.id)) return;
  const locale = options?.locale ?? "en";
  const size = options?.size ?? null;
  const variant = options?.variant ?? null;
  const lineKey = buildSkyCartLineKey(item.id, size, variant);
  const current = readSkyCartFromCookie();
  const next = { ...current };
  const nextQty = (next[lineKey]?.quantity ?? 0) + quantityToAdd;
  if (nextQty <= 0) {
    delete next[lineKey];
  } else {
    next[lineKey] = {
      lineKey,
      id: item.id,
      quantity: Math.min(999, nextQty),
      name: buildCartDisplayName(item, locale, size, variant),
      price: computeMenuItemUnitPrice(item, size, variant),
      image: resolveMenuItemImageSrc(item.image),
      size,
      variant,
    };
  }
  writeSkyCartToCookie(next);
  notifySkyCartUpdated();
}

export function updateSkyCartLineQuantity(
  lineKey: string,
  delta: number,
): void {
  const current = readSkyCartFromCookie();
  const line = current[lineKey];
  if (!line) return;

  const next = { ...current };
  const nextQty = line.quantity + delta;
  if (nextQty <= 0) {
    delete next[lineKey];
  } else {
    next[lineKey] = {
      ...line,
      quantity: Math.min(999, nextQty),
    };
  }
  writeSkyCartToCookie(next);
  notifySkyCartUpdated();
}
