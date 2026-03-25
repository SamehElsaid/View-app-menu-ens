"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { useAppSelector } from "@/store/hooks";
import { getGuestStaffSocket } from "@/lib/guestStaffSocket";
import { FiBell } from "react-icons/fi";

type CallStaffAck = {
  ok?: boolean;
  error?: string;
};

export default function RequestStaffButton() {
  const t = useTranslations("staffCall");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const menuInfo = useAppSelector((s) => s.menu.menuInfo);
  const isMenuActive = menuInfo?.isActive !== false;

  const tableFromUrl = useMemo(() => {
    const raw =
      searchParams.get("table") ??
      searchParams.get("t") ??
      searchParams.get("tr") ??
      "";
    return raw.trim().slice(0, 50);
  }, [searchParams]);

  const [pending, setPending] = useState(false);
  const lastCallRef = useRef<number>(0);

  const onClick = useCallback(() => {
    if (pending) return; // ✅ منع spam سريع

    if (!menuInfo?.id) {
      toast.error(t("noMenu"));
      return;
    }

    if (!tableFromUrl) {
      toast.error(t("noTable"));
      return;
    }

    // ✅ Anti-spam إضافي (5 ثواني)
    const now = Date.now();
    if (now - lastCallRef.current < 5000) {
      toast.warning(t("rateLimit"));
      return;
    }
    lastCallRef.current = now;

    const sock = getGuestStaffSocket();
    if (!sock) {
      toast.error(t("configError"));
      return;
    }

    const payload = {
      menuId: menuInfo.id,
      tableNumber: tableFromUrl,
    };

    const handleAck = (ack: CallStaffAck) => {
      console.log("[staff-call] ack", ack);
      setPending(false);

      if (ack?.ok) {
        toast.success(t("success", { table: tableFromUrl }));
        return;
      }

      if (ack?.error === "RATE_LIMIT") {
        toast.warning(t("rateLimit"));
        return;
      }

      if (ack?.error === "INVALID_TABLE") {
        toast.error(t("invalidTable"));
        return;
      }

      toast.error(t("error"));
    };

    console.log("[staff-call] emit", payload, {
      socketId: sock.id,
      connected: sock.connected,
    });

    setPending(true);

    // ✅ timeout لو مفيش رد
    const timeout = setTimeout(() => {
      setPending(false);
      toast.error(t("timeout"));
    }, 5000);

    const emitCall = () => {
      sock.emit("guest:call_staff", payload, (ack: CallStaffAck) => {
        clearTimeout(timeout);
        handleAck(ack);
      });
    };

    // ✅ تأكد من الاتصال
    if (!sock.connected) {
      sock.connect();

      sock.once("connect", () => {
        console.log("✅ socket connected before emit");
        emitCall();
      });

      sock.once("connect_error", (err) => {
        clearTimeout(timeout);
        setPending(false);
        console.error("❌ socket connect error", err.message);
        toast.error(t("error"));
      });

      return;
    }

    emitCall();
  }, [menuInfo, tableFromUrl, t, pending]);

  if (!isMenuActive) return null;

  return (
    <div
      className="fixed bottom-6 z-99990 flex flex-col items-center gap-1"
      style={{ [locale === "ar" ? "left" : "right"]: "1.25rem" }}
    >
      <button
        type="button"
        onClick={onClick}
        disabled={pending || !tableFromUrl}
        title={!tableFromUrl ? t("noTableHint") : t("button")}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={t("button")}
      >
        {pending ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <FiBell className="h-6 w-6" />
        )}
      </button>

      {tableFromUrl ? (
        <span className="max-w-40 truncate rounded-md bg-white/95 px-2 py-0.5 text-center text-xs text-zinc-700 shadow">
          {t("tableLabel", { table: tableFromUrl })}
        </span>
      ) : null}
    </div>
  );
}
