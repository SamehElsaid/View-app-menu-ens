"use client";

import {
  Suspense,
  useEffect,
  useId,
  useMemo,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "react-toastify";
import {
  IoClose,
  IoNotificationsOutline,
  IoReceiptOutline,
  IoWifiOutline,
} from "react-icons/io5";
import { MdOutlineRoomService } from "react-icons/md";
import { useAppSelector } from "@/store/hooks";
import { useIsTableServicesSession } from "@/hooks/useIsTableServicesSession";
import {
  sendStaffServiceRequest,
  type StaffRequestKind,
} from "@/lib/sendStaffServiceRequest";
import {
  getMenuMobileTabItemActiveClasses,
  getMenuMobileTabItemClasses,
} from "@/lib/menuFabLayout";

type ServiceActionId = "waiter" | "bill" | "wifi";

type ServiceAction = {
  id: ServiceActionId;
  label: string;
  icon: ReactNode;
};

type TableServicesRadialFabProps = {
  /** `inline` = used inside MenuCornerFabs (no own fixed portal). */
  variant?: "fixed" | "inline";
};

function TableServicesRadialFabInner({
  variant = "fixed",
}: TableServicesRadialFabProps) {
  const locale = useLocale();
  const isArabic = locale === "ar";
  const tServices = useTranslations("tableServices");
  const tStaff = useTranslations("staffCall");
  const tFooter = useTranslations("footer");

  const menuInfo = useAppSelector((s) => s.menu.menuInfo);
  const customizations = useAppSelector((s) => s.menu.menuCustomizations);
  const accentColor = customizations?.primaryColor?.trim() || "#7000B5";
  const { isTableServicesSession, tableNumber } = useIsTableServicesSession();

  const hasMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [wifiOpen, setWifiOpen] = useState(false);
  const [sending, setSending] = useState<StaffRequestKind | null>(null);
  const menuId = useId();

  const wifiName = menuInfo?.wifiName?.trim() || "";
  const wifiPassword = menuInfo?.wifiPassword?.trim() || "";
  const wifiVisible =
    menuInfo?.wifiEnabled === true && Boolean(wifiName || wifiPassword);

  const actions = useMemo<ServiceAction[]>(() => {
    const items: ServiceAction[] = [
      {
        id: "waiter",
        label: tServices("waiter"),
        icon: <IoNotificationsOutline className="h-5 w-5" aria-hidden />,
      },
      {
        id: "bill",
        label: tServices("bill"),
        icon: <IoReceiptOutline className="h-5 w-5" aria-hidden />,
      },
    ];

    if (wifiVisible) {
      items.push({
        id: "wifi",
        label: tServices("wifi"),
        icon: <IoWifiOutline className="h-5 w-5" aria-hidden />,
      });
    }

    return items;
  }, [tServices, wifiVisible]);

  useEffect(() => {
    if (!menuOpen && !wifiOpen) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Element | null;
      if (!target) return;
      // `display: contents` root has no box — scope dismiss to the corner dock.
      if (!target.closest?.("[data-menu-corner-fabs]")) {
        setMenuOpen(false);
        setWifiOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setWifiOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen, wifiOpen]);

  if (!hasMounted || !isTableServicesSession || !menuInfo?.id) {
    return null;
  }

  const sendRequest = async (requestKind: StaffRequestKind) => {
    if (sending) return;
    setSending(requestKind);
    try {
      const response = await sendStaffServiceRequest(locale, {
        menuId: menuInfo.id,
        type: "table",
        tableNumber,
        requestKind,
      });

      if (!response.status) {
        const errBody = response.data;
        if (errBody?.error === "INVALID_TABLE") {
          toast.error(tStaff("invalidTable"));
        } else if (errBody?.error === "FEATURE_REQUIRES_PRO") {
          toast.error(
            isArabic
              ? (errBody.errorAr ?? tStaff("error"))
              : (errBody.errorEn ?? tStaff("error")),
          );
        } else {
          const apiMsg = isArabic
            ? errBody?.errorAr || errBody?.message
            : errBody?.errorEn || errBody?.message;
          toast.error(apiMsg || tStaff("error"));
        }
        return;
      }

      setMenuOpen(false);
      toast.success(
        requestKind === "bill"
          ? tStaff("successBill", { table: tableNumber })
          : tStaff("successWaiter", { table: tableNumber }),
      );
    } catch {
      toast.error(tStaff("error"));
    } finally {
      setSending(null);
    }
  };

  const wifiPanel = wifiOpen && wifiVisible ? (
    <div
      role="dialog"
      dir={isArabic ? "rtl" : "ltr"}
      className="absolute bottom-[calc(100%+0.5rem)] left-1/2 z-30 w-52 -translate-x-1/2 rounded-2xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-800 shadow-xl md:left-0 md:translate-x-0"
    >
      <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold">
        <IoWifiOutline className="text-base opacity-80" aria-hidden />
        <span>{tFooter("wifiDetails")}</span>
      </div>
      <div className="space-y-1 text-[11px]">
        {wifiName ? (
          <p>
            <span className="opacity-65">{tFooter("wifiName")}: </span>
            <span dir="ltr" className="font-medium">
              {wifiName}
            </span>
          </p>
        ) : null}
        {wifiPassword ? (
          <p>
            <span className="opacity-65">{tFooter("wifiPassword")}: </span>
            <span dir="ltr" className="font-medium tracking-wide">
              {wifiPassword}
            </span>
          </p>
        ) : null}
      </div>
    </div>
  ) : null;

  /** Phone: each service is its own tab (icon + label). */
  const mobileTabs = actions.map((action) => {
    const busy =
      (action.id === "waiter" && sending === "waiter") ||
      (action.id === "bill" && sending === "bill");
    const isWifi = action.id === "wifi";

    return (
      <div key={action.id} className="relative min-w-0 flex-1 md:hidden">
        <button
          type="button"
          disabled={Boolean(sending) && !isWifi}
          aria-label={action.label}
          aria-expanded={isWifi ? wifiOpen : undefined}
          onClick={() => {
            if (isWifi) {
              setWifiOpen((prev) => !prev);
              return;
            }
            setWifiOpen(false);
            void sendRequest(action.id === "bill" ? "bill" : "waiter");
          }}
          className={[
            "flex w-full flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1.5 transition",
            isWifi && wifiOpen
              ? getMenuMobileTabItemActiveClasses(menuInfo.theme)
              : getMenuMobileTabItemClasses(menuInfo.theme),
            "disabled:opacity-60",
          ].join(" ")}
          style={{ "--bg-main": accentColor } as CSSProperties}
        >
          <span className="inline-flex h-7 w-7 items-center justify-center">
            {busy ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
            ) : (
              action.icon
            )}
          </span>
          <span className="w-full truncate px-0.5 text-center text-[10px] font-medium leading-tight sm:text-[11px]">
            {action.label}
          </span>
        </button>
        {isWifi ? wifiPanel : null}
      </div>
    );
  });

  /** Desktop: one FAB that opens a list of services. */
  const desktopFab = (
    <div
      className="relative hidden w-14 flex-col items-center gap-1 md:flex"
      style={{ "--bg-main": accentColor } as CSSProperties}
      dir={isArabic ? "rtl" : "ltr"}
    >
      {menuOpen ? (
        <div
          id={menuId}
          role="menu"
          className={`absolute bottom-[calc(100%+0.5rem)] z-20 w-48 overflow-hidden rounded-2xl border border-zinc-200 bg-white py-1 shadow-[0_12px_28px_rgba(15,23,42,0.18)] ${
            isArabic ? "left-0" : "right-0"
          }`}
        >
          {actions.map((action) => {
            const busy =
              (action.id === "waiter" && sending === "waiter") ||
              (action.id === "bill" && sending === "bill");

            if (action.id === "wifi") {
              return (
                <div
                  key={action.id}
                  className="border-t border-zinc-100 px-3 py-2.5"
                >
                  <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-zinc-800">
                    <IoWifiOutline className="h-4 w-4" aria-hidden />
                    <span>{action.label}</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-zinc-600">
                    {wifiName ? (
                      <p>
                        <span className="opacity-65">{tFooter("wifiName")}: </span>
                        <span dir="ltr" className="font-medium text-zinc-800">
                          {wifiName}
                        </span>
                      </p>
                    ) : null}
                    {wifiPassword ? (
                      <p>
                        <span className="opacity-65">
                          {tFooter("wifiPassword")}:{" "}
                        </span>
                        <span
                          dir="ltr"
                          className="font-medium tracking-wide text-zinc-800"
                        >
                          {wifiPassword}
                        </span>
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            }

            return (
              <button
                key={action.id}
                type="button"
                role="menuitem"
                disabled={Boolean(sending)}
                onClick={() =>
                  void sendRequest(action.id === "bill" ? "bill" : "waiter")
                }
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-start text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 disabled:opacity-60"
              >
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-700">
                  {busy ? (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current/30 border-t-current" />
                  ) : (
                    action.icon
                  )}
                </span>
                {action.label}
              </button>
            );
          })}
        </div>
      ) : null}

      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-controls={menuId}
        aria-label={tServices("label")}
        title={tServices("label")}
        onClick={() => setMenuOpen((prev) => !prev)}
        className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition hover:opacity-90"
      >
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(145deg, #0f172a 0%, #1e293b 55%, ${accentColor} 160%)`,
          }}
          aria-hidden
        />
        <span className="relative z-10">
          {menuOpen ? (
            <IoClose className="h-6 w-6" aria-hidden />
          ) : (
            <MdOutlineRoomService className="h-6 w-6" aria-hidden />
          )}
        </span>
      </button>

      <span className="w-14 truncate rounded-full border border-(--bg-main)/20 bg-white/95 px-1 py-1 text-center text-[10px] font-medium leading-tight text-(--bg-main) shadow-base">
        {tServices("labelShort")}
      </span>
    </div>
  );

  const tree = (
    <>
      {mobileTabs}
      {desktopFab}
    </>
  );

  return variant === "inline" ? tree : createPortal(tree, document.body);
}

export default function TableServicesRadialFab(
  props: TableServicesRadialFabProps,
) {
  return (
    <Suspense fallback={null}>
      <TableServicesRadialFabInner {...props} />
    </Suspense>
  );
}
