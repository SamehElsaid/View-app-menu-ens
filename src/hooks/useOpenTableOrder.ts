"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { toast } from "react-toastify";
import { axiosGet, axiosPatch } from "@/shared/axiosCall";
import {
  notifySkyCartUpdated,
  writeSkyCartToCookie,
} from "@/lib/skyTemplateCart";
import {
  OPEN_TABLE_ORDER_REFRESH_EVENT,
  openOrderItemsToPatchPayload,
  type OpenTableOrderCall,
  type OpenTableOrderGetResponse,
  type OpenTableOrderItem,
  type OpenTableOrderPatchResponse,
} from "@/lib/openTableOrder";

const POLL_MS = 5000;

type UseOpenTableOrderOptions = {
  menuId: number | null | undefined;
  tableNumber: string;
  /** Table dine-in only; skip for delivery. */
  enabled: boolean;
  /** Toast when cashier ends the table / order disappears. */
  tableEndedMessage?: string;
};

export function useOpenTableOrder({
  menuId,
  tableNumber,
  enabled,
  tableEndedMessage,
}: UseOpenTableOrderOptions) {
  const locale = useLocale();
  const isArabic = locale === "ar";
  const [openOrder, setOpenOrder] = useState<OpenTableOrderCall | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const hadOpenOrderRef = useRef(false);
  const mountedRef = useRef(true);
  const tableEndedMessageRef = useRef(tableEndedMessage);
  tableEndedMessageRef.current = tableEndedMessage;

  const clearLocalCart = useCallback(() => {
    writeSkyCartToCookie({});
    notifySkyCartUpdated();
  }, []);

  const refresh = useCallback(async () => {
    if (!enabled || !menuId || !tableNumber) {
      setOpenOrder(null);
      return null;
    }
    const response = await axiosGet<OpenTableOrderGetResponse>(
      "/public/staff-call/open",
      locale,
      undefined,
      { menuId, tableNumber },
      true,
    );
    if (!mountedRef.current) return null;

    if (!response.status || !response.data?.ok) {
      return null;
    }

    const next = response.data.call ?? null;
    if (hadOpenOrderRef.current && !next) {
      clearLocalCart();
      const msg = tableEndedMessageRef.current;
      if (msg) toast.info(msg);
    }
    hadOpenOrderRef.current = Boolean(next);
    setOpenOrder(next);
    return next;
  }, [clearLocalCart, enabled, locale, menuId, tableNumber]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled || !menuId || !tableNumber) {
      setOpenOrder(null);
      hadOpenOrderRef.current = false;
      return;
    }

    let cancelled = false;
    setLoading(true);
    void (async () => {
      await refresh();
      if (!cancelled && mountedRef.current) setLoading(false);
    })();

    const id = window.setInterval(() => {
      void refresh();
    }, POLL_MS);

    const onExternalRefresh = () => {
      void refresh();
    };
    window.addEventListener(OPEN_TABLE_ORDER_REFRESH_EVENT, onExternalRefresh);

    return () => {
      cancelled = true;
      window.clearInterval(id);
      window.removeEventListener(
        OPEN_TABLE_ORDER_REFRESH_EVENT,
        onExternalRefresh,
      );
    };
  }, [enabled, menuId, tableNumber, locale, refresh]);

  const patchItems = useCallback(
    async (items: OpenTableOrderItem[]) => {
      if (!enabled || !menuId || !tableNumber) {
        return { ok: false as const, error: "INVALID_PAYLOAD" };
      }
      setSaving(true);
      try {
        const response = await axiosPatch<
          {
            menuId: number;
            tableNumber: string;
            items: ReturnType<typeof openOrderItemsToPatchPayload>;
          },
          OpenTableOrderPatchResponse
        >(
          "/public/staff-call/open",
          locale,
          {
            menuId,
            tableNumber,
            items: openOrderItemsToPatchPayload(items),
          },
          true,
        );

        if (!response.status || !response.data?.ok) {
          const err = response.data;
          const msg = isArabic
            ? err?.errorAr || err?.message
            : err?.errorEn || err?.message;
          return {
            ok: false as const,
            error: err?.error || "SERVER_ERROR",
            message: msg,
          };
        }

        const next = response.data.call ?? null;
        if (response.data.cancelled || !next) {
          hadOpenOrderRef.current = false;
          setOpenOrder(null);
        } else {
          hadOpenOrderRef.current = true;
          setOpenOrder(next);
        }
        return {
          ok: true as const,
          cancelled: Boolean(response.data.cancelled),
          call: next,
        };
      } finally {
        if (mountedRef.current) setSaving(false);
      }
    },
    [enabled, isArabic, locale, menuId, tableNumber],
  );

  const updateLineQuantity = useCallback(
    async (lineIndex: number, nextQuantity: number) => {
      if (!openOrder) return { ok: false as const, error: "NOT_FOUND" };
      const nextItems = openOrder.items
        .map((item, index) =>
          index === lineIndex
            ? { ...item, quantity: Math.max(0, Math.floor(nextQuantity)) }
            : item,
        )
        .filter((item) => item.quantity > 0);
      return patchItems(nextItems);
    },
    [openOrder, patchItems],
  );

  return {
    openOrder,
    loading,
    saving,
    refresh,
    patchItems,
    updateLineQuantity,
    clearLocalCart,
  };
}
