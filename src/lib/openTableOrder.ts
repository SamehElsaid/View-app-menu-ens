export const OPEN_TABLE_ORDER_REFRESH_EVENT = "ens-open-table-order-refresh";

export function notifyOpenTableOrderRefresh(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(OPEN_TABLE_ORDER_REFRESH_EVENT));
}

/**
 * Guest live table order (open StaffTableCall) — public GET/PATCH helpers.
 */

export type OpenTableOrderStatus =
  | "pending"
  | "confirmed"
  | "prepared"
  | "delivered"
  | "cancelled";

export type OpenTableOrderItem = {
  name: string;
  menuItemId?: number;
  price?: number;
  quantity: number;
  total?: number;
  notes?: string;
  size?: {
    nameAr: string;
    nameEn: string;
    price: number;
  } | null;
  variant?: {
    labelAr: string;
    labelEn: string;
    price: number;
  } | null;
};

export type OpenTableOrderCall = {
  id: number;
  menuId: number;
  tableNumber: string;
  customerName: string | null;
  items: OpenTableOrderItem[];
  orderTotal: number;
  status: OpenTableOrderStatus;
  at: string;
  requestKind: string;
};

export type OpenTableOrderGetResponse = {
  ok?: boolean;
  call?: OpenTableOrderCall | null;
  error?: string;
  message?: string;
  errorAr?: string;
  errorEn?: string;
};

export type OpenTableOrderPatchResponse = {
  ok?: boolean;
  cancelled?: boolean;
  call?: OpenTableOrderCall | null;
  error?: string;
  message?: string;
  errorAr?: string;
  errorEn?: string;
};

export type OpenTableOrderPatchItem = {
  menuItemId?: number;
  name?: string;
  quantity: number;
  price?: number;
  size?: OpenTableOrderItem["size"];
  variant?: OpenTableOrderItem["variant"];
};

export function isGuestEditableOpenOrderStatus(
  status: string | null | undefined,
): boolean {
  return String(status ?? "")
    .trim()
    .toLowerCase() === "pending";
}

export function buildOpenTableOrderLineKey(
  item: OpenTableOrderItem,
  index: number,
): string {
  const id = item.menuItemId ?? 0;
  const size = item.size
    ? `${item.size.nameEn}|${item.size.nameAr}|${item.size.price}`
    : "";
  const variant = item.variant
    ? `${item.variant.labelEn}|${item.variant.labelAr}|${item.variant.price}`
    : "";
  return `open:${id}:${size}:${variant}:${index}`;
}

export function openOrderItemsToPatchPayload(
  items: OpenTableOrderItem[],
): OpenTableOrderPatchItem[] {
  return items
    .filter((item) => item.quantity > 0)
    .map((item) => ({
      ...(item.menuItemId != null ? { menuItemId: item.menuItemId } : {}),
      ...(item.name ? { name: item.name } : {}),
      quantity: item.quantity,
      ...(item.price != null ? { price: item.price } : {}),
      ...(item.size ? { size: item.size } : {}),
      ...(item.variant ? { variant: item.variant } : {}),
    }));
}
