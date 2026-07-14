"use client";

import { Suspense, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useLocale } from "next-intl";
import RequestStaffButton from "@/components/Global/RequestStaffButton";
import RateMenuButton from "@/components/Global/RateMenuButton";
import TableServicesRadialFab from "@/components/Global/TableServicesRadialFab";
import { useAppSelector } from "@/store/hooks";
import { useIsMenuCornerDockSession } from "@/hooks/useIsMenuCornerDockSession";
import {
  getMenuMobileTabBarClasses,
  MENU_DESKTOP_FAB_BOTTOM_CLASS,
} from "@/lib/menuFabLayout";

function MenuCornerFabsInner() {
  const locale = useLocale();
  const isArabic = locale === "ar";
  const menuInfo = useAppSelector((s) => s.menu.menuInfo);
  const theme = menuInfo?.theme;
  const isMenuCornerDockSession = useIsMenuCornerDockSession();

  const hasMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const hasActiveMenu =
    Boolean(menuInfo?.id) && menuInfo?.isActive !== false;

  if (!hasMounted || !hasActiveMenu) return null;

  // No delivery / table / cart session → lone rate FAB in the cart corner.
  if (!isMenuCornerDockSession) {
    return <RateMenuButton variant="fab" />;
  }

  return createPortal(
    <div
      className={[
        "fixed z-99990 flex",
        // Phone: full-width bottom tab bar (equal-width tabs).
        "max-md:inset-x-0 max-md:bottom-0 max-md:left-0 max-md:right-0",
        "max-md:w-full max-md:translate-x-0 max-md:flex-row max-md:items-stretch",
        "max-md:gap-0 max-md:rounded-none",
        getMenuMobileTabBarClasses(theme),
        // Desktop+: corner stack of FABs.
        MENU_DESKTOP_FAB_BOTTOM_CLASS,
        "md:inset-x-auto md:w-auto md:translate-x-0 md:flex-col md:items-center md:gap-2",
        "md:border-0 md:bg-transparent md:p-0 md:shadow-none md:ring-0 md:backdrop-blur-none",
        isArabic ? "md:left-3 md:right-auto" : "md:right-3 md:left-auto",
      ].join(" ")}
      data-menu-corner-fabs=""
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Table QR only — no-ops for delivery. */}
      <TableServicesRadialFab variant="inline" />
      <RateMenuButton variant="inline" />
      <RequestStaffButton variant="inline" />
    </div>,
    document.body,
  );
}

/**
 * Corner controls for all active menus.
 * - Browse (no delivery/table/cart session): lone rate FAB at cart position
 * - Table QR: waiter / bill / wifi / rate / cart dock
 * - Delivery order: rate / cart dock
 */
export default function MenuCornerFabs() {
  return (
    <Suspense fallback={null}>
      <MenuCornerFabsInner />
    </Suspense>
  );
}
