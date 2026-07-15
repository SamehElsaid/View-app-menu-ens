"use client";

import { Suspense, useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { IoWifiOutline } from "react-icons/io5";
import { useAppSelector } from "@/store/hooks";
import { useIsTableServicesSession } from "@/hooks/useIsTableServicesSession";
import MenuWifiCredentials from "@/components/Global/MenuWifiCredentials";

type MenuWifiDropdownProps = {
  className?: string;
  buttonClassName?: string;
  panelClassName?: string;
  iconClassName?: string;
};

function MenuWifiDropdownInner({
  className = "",
  buttonClassName = "",
  panelClassName = "",
  iconClassName = "text-lg",
}: MenuWifiDropdownProps) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const t = useTranslations("footer");
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);
  const { isTableServicesSession } = useIsTableServicesSession();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const wifiName = menuInfo?.wifiName?.trim() || "";
  const wifiPassword = menuInfo?.wifiPassword?.trim() || "";
  const visible =
    menuInfo?.wifiEnabled === true &&
    Boolean(wifiName || wifiPassword) &&
    !isTableServicesSession;

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

  if (!visible) return null;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={t("wifiDetails")}
        onClick={() => setOpen((prev) => !prev)}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition ${buttonClassName}`}
      >
        <IoWifiOutline className={iconClassName} aria-hidden />
      </button>

      {open ? (
        <div
          id={panelId}
          role="menu"
          dir={isAr ? "rtl" : "ltr"}
          className={`absolute end-0 top-[calc(100%+0.5rem)] z-50 w-56 min-w-56 rounded-2xl border px-3 py-3 text-sm shadow-xl backdrop-blur-md ${panelClassName}`}
        >
          <div className="mb-2.5 flex items-center gap-2 font-semibold">
            <IoWifiOutline className="text-base opacity-80" aria-hidden />
            <span>{t("wifiDetails")}</span>
          </div>
          <MenuWifiCredentials
            wifiName={wifiName}
            wifiPassword={wifiPassword}
          />
        </div>
      ) : null}
    </div>
  );
}

export default function MenuWifiDropdown(props: MenuWifiDropdownProps) {
  return (
    <Suspense fallback={null}>
      <MenuWifiDropdownInner {...props} />
    </Suspense>
  );
}
