"use client";

import { Suspense, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { IoStarOutline } from "react-icons/io5";
import { useAppSelector } from "@/store/hooks";
import { useIsMenuCornerDockSession } from "@/hooks/useIsMenuCornerDockSession";
import RateMenuModal from "@/components/Global/RateMenuModal";
import {
  getMenuFabSideClass,
  getMenuMobileTabItemClasses,
  MENU_CART_FAB_BOTTOM_CLASS,
} from "@/lib/menuFabLayout";

type RateMenuButtonProps = {
  className?: string;
  buttonClassName?: string;
  iconClassName?: string;
  /**
   * `navbar` = header control (hidden when dock hosts rate).
   * `inline` = tab / FAB inside MenuCornerFabs ordering dock.
   * `fab` = lone floating control in the cart corner when there is
   *        no delivery / table / cart session.
   */
  variant?: "navbar" | "inline" | "fab";
};

function RateFabColumn({
  accentColor,
  open,
  onOpen,
  label,
  title,
}: {
  accentColor: string;
  open: boolean;
  onOpen: () => void;
  label: string;
  title: string;
}) {
  return (
    <div
      className="relative flex w-14 flex-col items-center gap-1"
      style={{ "--bg-main": accentColor } as CSSProperties}
    >
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={title}
        title={title}
        onClick={onOpen}
        className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition hover:opacity-90"
      >
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(145deg, #0f172a 0%, #1e293b 55%, ${accentColor} 160%)`,
          }}
          aria-hidden
        />
        <IoStarOutline className="relative z-10 h-6 w-6" aria-hidden />
      </button>
      <span className="w-14 truncate rounded-full border border-(--bg-main)/20 bg-white/95 px-1 py-1 text-center text-[10px] font-medium leading-tight text-(--bg-main) shadow-base">
        {label}
      </span>
    </div>
  );
}

function RateMenuButtonInner({
  className = "",
  buttonClassName = "",
  iconClassName = "text-lg",
  variant = "navbar",
}: RateMenuButtonProps) {
  const locale = useLocale();
  const isArabic = locale === "ar";
  const t = useTranslations("rateMenu");
  const menuInfo = useAppSelector((s) => s.menu.menuInfo);
  const customizations = useAppSelector((s) => s.menu.menuCustomizations);
  const accentColor = customizations?.primaryColor?.trim() || "#7000B5";
  const isMenuCornerDockSession = useIsMenuCornerDockSession();
  const [open, setOpen] = useState(false);

  if (!menuInfo?.id || !menuInfo.slug || menuInfo.isActive === false) {
    return null;
  }

  // Moved into the bottom tab bar / corner stack during table or delivery.
  if (variant === "navbar" && isMenuCornerDockSession) {
    return null;
  }

  // Lone FAB only when ordering dock is NOT hosting rate + cart.
  if (variant === "fab" && isMenuCornerDockSession) {
    return null;
  }

  const modal = <RateMenuModal open={open} onClose={() => setOpen(false)} />;

  if (variant === "fab") {
    const tree = (
      <>
        <div
          className={`fixed z-99990 ${MENU_CART_FAB_BOTTOM_CLASS} ${getMenuFabSideClass(isArabic)}`}
          data-menu-rate-fab=""
          dir={isArabic ? "rtl" : "ltr"}
        >
          <RateFabColumn
            accentColor={accentColor}
            open={open}
            onOpen={() => setOpen(true)}
            label={t("tab")}
            title={t("button")}
          />
        </div>
        {modal}
      </>
    );

    if (typeof document === "undefined") return null;
    return createPortal(tree, document.body);
  }

  if (variant === "inline") {
    const phoneTabItemClasses = getMenuMobileTabItemClasses(menuInfo.theme);

    return (
      <>
        {/* Phone: equal-width tab */}
        <div className="relative min-w-0 flex-1 md:hidden">
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-label={t("button")}
            onClick={() => setOpen(true)}
            className={`flex w-full flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1.5 transition ${phoneTabItemClasses}`}
          >
            <span className="inline-flex h-7 w-7 items-center justify-center">
              <IoStarOutline className="h-5 w-5" aria-hidden />
            </span>
            <span className="w-full truncate px-0.5 text-center text-[10px] font-medium leading-tight sm:text-[11px]">
              {t("tab")}
            </span>
          </button>
        </div>

        {/* Desktop: stacked FAB matching cart / services */}
        <div className="relative hidden md:block">
          <RateFabColumn
            accentColor={accentColor}
            open={open}
            onOpen={() => setOpen(true)}
            label={t("tab")}
            title={t("button")}
          />
        </div>

        {modal}
      </>
    );
  }

  return (
    <>
      <div className={`relative ${className}`}>
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={t("button")}
          title={t("button")}
          onClick={() => setOpen(true)}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition ${buttonClassName}`}
        >
          <IoStarOutline className={iconClassName} aria-hidden />
        </button>
      </div>

      {modal}
    </>
  );
}

/**
 * Rate this place — lone cart-corner FAB while browsing without ordering;
 * moves into MenuCornerFabs for table QR and confirmed delivery orders.
 */
export default function RateMenuButton(props: RateMenuButtonProps) {
  return (
    <Suspense fallback={null}>
      <RateMenuButtonInner {...props} />
    </Suspense>
  );
}
