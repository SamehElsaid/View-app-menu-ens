"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { IoCheckmark, IoCopyOutline } from "react-icons/io5";
import { copyToClipboard } from "@/lib/copyToClipboard";

type MenuWifiCredentialsProps = {
  wifiName?: string;
  wifiPassword?: string;
  /** Extra classes on value text (e.g. theme/density tweaks). */
  valueClassName?: string;
  className?: string;
};

type CopyRowProps = {
  label: string;
  value: string;
  valueClassName?: string;
};

function WifiCopyRow({ label, value, valueClassName = "" }: CopyRowProps) {
  const t = useTranslations("footer");
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current != null) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    const ok = await copyToClipboard(value);
    if (!ok) {
      toast.error(t("copyFailed"));
      return;
    }
    toast.success(t("copied"));
    setCopied(true);
    if (resetTimerRef.current != null) {
      window.clearTimeout(resetTimerRef.current);
    }
    resetTimerRef.current = window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        void handleCopy();
      }}
      aria-label={`${t("copy")} ${label}`}
      className={[
        "group flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-start transition",
        "bg-current/5 hover:bg-current/9 active:bg-current/12",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/25",
        copied ? "bg-emerald-500/10 hover:bg-emerald-500/15" : "",
      ].join(" ")}
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-medium leading-none opacity-55">
          {label}
        </span>
        <span
          dir="ltr"
          className={[
            "mt-1 block truncate text-[13px] font-semibold leading-tight tracking-wide",
            valueClassName,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {value}
        </span>
      </span>
      <span
        className={[
          "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition",
          copied
            ? "bg-emerald-500/15 text-emerald-600"
            : "bg-current/6 opacity-70 group-hover:opacity-100",
        ].join(" ")}
        aria-hidden
      >
        {copied ? (
          <IoCheckmark className="text-base" />
        ) : (
          <IoCopyOutline className="text-base" />
        )}
      </span>
    </button>
  );
}

/** Shared Wi‑Fi name/password rows with one-tap copy (used by all Wi‑Fi surfaces). */
export default function MenuWifiCredentials({
  wifiName = "",
  wifiPassword = "",
  valueClassName = "",
  className = "space-y-1.5",
}: MenuWifiCredentialsProps) {
  const t = useTranslations("footer");
  const name = wifiName.trim();
  const password = wifiPassword.trim();

  if (!name && !password) return null;

  return (
    <div className={className}>
      {name ? (
        <WifiCopyRow
          label={t("wifiName")}
          value={name}
          valueClassName={valueClassName}
        />
      ) : null}
      {password ? (
        <WifiCopyRow
          label={t("wifiPassword")}
          value={password}
          valueClassName={valueClassName}
        />
      ) : null}
    </div>
  );
}
