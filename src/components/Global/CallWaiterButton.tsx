"use client";

import { Suspense, useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { IoNotificationsOutline, IoReceiptOutline } from "react-icons/io5";
import { MdOutlineRoomService } from "react-icons/md";
import { useAppSelector } from "@/store/hooks";
import { axiosPost } from "@/shared/axiosCall";
import { useIsOrderingEnabled } from "@/hooks/useIsOrderingEnabled";
import { useTableCartAllowed } from "@/hooks/useTableCartAllowed";

type StaffRequestKind = "waiter" | "bill";

type ServiceCallPayload = {
  menuId: number;
  type: "table";
  tableNumber: string;
  requestKind: StaffRequestKind;
};

type CallWaiterButtonProps = {
  className?: string;
  buttonClassName?: string;
  panelClassName?: string;
  iconClassName?: string;
};

function CallWaiterButtonInner({
  className = "",
  buttonClassName = "",
  panelClassName = "",
  iconClassName = "text-lg",
}: CallWaiterButtonProps) {
  const locale = useLocale();
  const isArabic = locale === "ar";
  const t = useTranslations("staffCall");
  const menuInfo = useAppSelector((s) => s.menu.menuInfo);
  const tableCartAllowed = useTableCartAllowed();
  const { isOrderingEnabled, isDeliveryOrder, tableNumber } =
    useIsOrderingEnabled();

  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState<StaffRequestKind | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const isTableSession =
    tableCartAllowed &&
    isOrderingEnabled &&
    !isDeliveryOrder &&
    Boolean(tableNumber);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!rootRef.current || !target) return;
      if (!rootRef.current.contains(target)) setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!menuInfo?.id || menuInfo.isActive === false || !isTableSession) {
    return null;
  }

  const sendRequest = async (requestKind: StaffRequestKind) => {
    if (sending) return;
    setSending(requestKind);
    try {
      const payload: ServiceCallPayload = {
        menuId: menuInfo.id,
        type: "table",
        tableNumber,
        requestKind,
      };

      const response = await axiosPost<ServiceCallPayload, unknown>(
        "/public/staff-call",
        locale,
        payload,
        false,
        true,
      );

      if (!response.status) {
        const errBody = response.data as {
          error?: string;
          message?: string;
          errorAr?: string;
          errorEn?: string;
        };
        if (errBody?.error === "INVALID_TABLE") {
          toast.error(t("invalidTable"));
        } else if (errBody?.error === "FEATURE_REQUIRES_PRO") {
          toast.error(
            isArabic
              ? (errBody.errorAr ?? t("error"))
              : (errBody.errorEn ?? t("error")),
          );
        } else {
          const apiMsg = isArabic
            ? errBody?.errorAr || errBody?.message
            : errBody?.errorEn || errBody?.message;
          toast.error(apiMsg || t("error"));
        }
        return;
      }

      setOpen(false);
      toast.success(
        requestKind === "bill"
          ? t("successBill", { table: tableNumber })
          : t("successWaiter", { table: tableNumber }),
      );
    } catch {
      toast.error(t("error"));
    } finally {
      setSending(null);
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={t("button")}
        title={t("button")}
        onClick={() => setOpen((prev) => !prev)}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition ${buttonClassName}`}
      >
        <IoNotificationsOutline className={iconClassName} aria-hidden />
      </button>

      {open ? (
        <div
          id={panelId}
          role="menu"
          dir={isArabic ? "rtl" : "ltr"}
          className={`absolute end-0 top-[calc(100%+0.5rem)] z-50 min-w-60 rounded-2xl border px-3 py-3 text-sm shadow-xl backdrop-blur-md ${panelClassName}`}
        >
          <div className="mb-2 px-1">
            <p className="font-semibold">{t("title")}</p>
            <p className="mt-0.5 text-xs opacity-65">
              {t("tableLabel", { table: tableNumber })}
            </p>
          </div>

          <div className="grid gap-1.5">
            <button
              type="button"
              role="menuitem"
              disabled={Boolean(sending)}
              onClick={() => void sendRequest("waiter")}
              className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-start transition hover:bg-black/5 disabled:opacity-60"
            >
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-current/10">
                {sending === "waiter" ? (
                  <span className="h-4 w-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
                ) : (
                  <MdOutlineRoomService className="h-4 w-4" aria-hidden />
                )}
              </span>
              <span className="min-w-0">
                <span className="block font-semibold leading-tight">
                  {t("callWaiter")}
                </span>
              </span>
            </button>

            <button
              type="button"
              role="menuitem"
              disabled={Boolean(sending)}
              onClick={() => void sendRequest("bill")}
              className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-start transition hover:bg-black/5 disabled:opacity-60"
            >
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-current/10">
                {sending === "bill" ? (
                  <span className="h-4 w-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
                ) : (
                  <IoReceiptOutline className="h-4 w-4" aria-hidden />
                )}
              </span>
              <span className="min-w-0">
                <span className="block font-semibold leading-tight">
                  {t("requestBill")}
                </span>
              </span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function CallWaiterButton(props: CallWaiterButtonProps) {
  return (
    <Suspense fallback={null}>
      <CallWaiterButtonInner {...props} />
    </Suspense>
  );
}
