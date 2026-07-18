import type {
  MenuItemSizeOption,
  MenuItemVariantOption,
} from "@/types/menu";

export type AiOrderSource = "menu_order_chat" | "menu_discovery_chat";

export function isDiscoverySource(
  source: AiOrderSource,
): source is "menu_discovery_chat" {
  return source === "menu_discovery_chat";
}

export type AiOrderAction =
  | "reply"
  | "update_cart"
  | "confirm_order"
  | "create_order"
  | "error";

/** Full cart line used locally and in legacy AI responses. */
export type AiOrderCartItem = {
  id: number;
  quantity: number;
  name: string;
  price: number;
  image?: string;
};

export type AiOrderCart = Record<string, AiOrderCartItem>;

/** @deprecated Prefer AiOrderCartLine[]; kept for older n8n payloads. */
export type AiOrderCartQuantities = Record<string, number>;

export type AiCatalogSizeOption = {
  nameAr: string;
  nameEn: string;
  price: number;
};

export type AiCatalogVariantOption = {
  labelAr: string;
  labelEn: string;
  price: number;
};

/** Menu row sent to n8n (matching, sizes/variants, budget hints; no media/copy). */
export type AiMenuCatalogItem = {
  id: number;
  nameAr: string;
  nameEn: string;
  price: number;
  minPrice: number;
  categoryId: number;
  categoryNameAr: string;
  categoryNameEn: string;
  available: boolean;
  sizes: AiCatalogSizeOption[];
  variants: AiCatalogVariantOption[];
};

/** One cart line sent to n8n (preserves size/variant). */
export type AiOrderCartLine = {
  itemId: number;
  quantity: number;
  lineKey: string;
  unitPrice: number;
  name: string;
  size?: MenuItemSizeOption | null;
  variant?: MenuItemVariantOption | null;
};

/** Default when menuInfo.currency is missing (AI order payload). */
export const DEFAULT_AI_ORDER_CURRENCY = "EGP";

export type AiOrderRequest = {
  sessionId: string;
  message: string;
  source: AiOrderSource;
  locale: string;
  direction: "rtl" | "ltr";
  menuId: number;
  /** Venue name for n8n prompts; falls back to menuName when API has no separate field. */
  restaurantName?: string | null;
  menuName?: string | null;
  currency: string;
  /**
   * Line-level cart (preferred). Also mirrored as quantity map under `currentCart`
   * for older n8n workflows — prefer reading `currentCartLines`.
   */
  currentCartLines: AiOrderCartLine[];
  /** @deprecated Use currentCartLines. itemId → total quantity across lines. */
  currentCart: AiOrderCartQuantities;
  menuCatalog: AiMenuCatalogItem[];
};

/** Resolve names from loaded menuInfo (no hardcoded restaurant). */
export function resolveAiOrderMenuIdentity(
  menuInfo: { name?: string; restaurantName?: string | null } | null | undefined,
): { restaurantName: string | null; menuName: string | null } {
  if (!menuInfo) {
    return { restaurantName: null, menuName: null };
  }
  const menuName = menuInfo.name?.trim() || null;
  const explicitRestaurant = menuInfo.restaurantName?.trim() || null;
  const restaurantName = explicitRestaurant || menuName;
  return { restaurantName, menuName };
}

export type AiCartActionType = "add" | "remove" | "set_quantity";

/**
 * Cart mutation from n8n.
 * Prefer `sizeName` / `variantLabel` (match catalog nameAr/nameEn or labelAr/labelEn).
 * Full size/variant objects are also accepted.
 */
export type AiCartAction = {
  type: AiCartActionType;
  itemId: number;
  quantity?: number;
  sizeName?: string;
  variantLabel?: string;
  size?: MenuItemSizeOption | null;
  variant?: MenuItemVariantOption | null;
};

/**
 * Preferred n8n suggestion object. Cards render only when itemId is valid locally
 * and name + price are present on the object.
 */
export type AiN8nSuggestion = {
  itemId: number;
  name: string;
  price: number;
  currency?: string;
  image?: string;
  sizeName?: string;
  variantLabel?: string;
};

/** Raw suggestion from n8n: preferred object or legacy id-only shapes. */
export type AiSuggestionRaw =
  | AiN8nSuggestion
  | {
      itemId: number;
      id?: never;
      name?: string;
      price?: number;
      currency?: string;
      image?: string;
      sizeName?: string;
      variantLabel?: string;
    }
  | {
      id: number;
      itemId?: number;
      name?: string;
      price?: number;
      currency?: string;
      image?: string;
      sizeName?: string;
      variantLabel?: string;
    };

export type AiOrderSuggestion = {
  id: number;
  name: string;
  price: number;
  /** ISO code for display; from n8n or menu default when enriching bare ids. */
  currency: string;
  image?: string;
};

export type AiOrderResponse = {
  reply?: string;
  message?: string;
  output?: string;
  text?: string;
  action?: AiOrderAction;
  cart?: AiOrderCart;
  cartActions?: AiCartAction[];
  cartPatch?: unknown;
  requiresConfirmation?: boolean;
  error?: string;
  metadata?: Record<string, unknown>;
  /** Objects, numeric ids, or string ids depending on n8n output. */
  suggestions?: Array<AiSuggestionRaw | number | string>;
};
