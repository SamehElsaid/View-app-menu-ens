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

/** Lightweight cart sent to n8n: itemId → quantity. */
export type AiOrderCartQuantities = Record<string, number>;

/** Lightweight menu row sent to n8n (matching + budget hints; no media/copy). */
export type AiMenuCatalogItem = {
  id: number;
  nameAr: string;
  price: number;
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

export type AiCartAction = {
  type: AiCartActionType;
  itemId: number;
  quantity?: number;
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
    }
  | {
      id: number;
      itemId?: number;
      name?: string;
      price?: number;
      currency?: string;
      image?: string;
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
