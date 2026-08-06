"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useLocale } from "next-intl";
import { FcGoogle } from "react-icons/fc";
import { IoClose } from "react-icons/io5";
import { useAppSelector } from "@/store/hooks";
import { useIsMenuCornerDockSession } from "@/hooks/useIsMenuCornerDockSession";
import {
  MENU_CART_FAB_BOTTOM_CLASS,
  MENU_MOBILE_TAB_BAR_CLEARANCE_CLASS,
} from "@/lib/menuFabLayout";
import { subscribeGoogleReviewsAfterOrderPrompt } from "@/lib/googleReviewsAfterOrder";
import {
  DEFAULT_GOOGLE_REVIEWS_BUTTON_TEXT_AR,
  DEFAULT_GOOGLE_REVIEWS_BUTTON_TEXT_EN,
  normalizeGoogleReviewsPosition,
  normalizeGoogleReviewsUrl,
} from "@/lib/googleReviewsUrl";

function useGoogleReviewsConfig() {
  const menuInfo = useAppSelector((s) => s.menu.menuInfo);
  const locale = useLocale();
  const isArabic = locale === "ar";

  return useMemo(() => {
    const enabledRaw = menuInfo?.googleReviewsEnabled as
      | boolean
      | number
      | string
      | undefined;
    const enabled =
      enabledRaw === true || enabledRaw === 1 || enabledRaw === "1";
    const rawUrl =
      typeof menuInfo?.googleReviewsUrl === "string"
        ? menuInfo.googleReviewsUrl.trim()
        : "";
    const url = rawUrl ? normalizeGoogleReviewsUrl(rawUrl) : "";
    // Show when enabled + URL present. If URL fails strict host check, still
    // open it (already saved by dashboard) so a valid Maps place link always works.
    const valid = enabled && Boolean(url);
    const position = normalizeGoogleReviewsPosition(
      menuInfo?.googleReviewsPosition,
    );
    const showIcon = menuInfo?.googleReviewsShowIcon !== false;
    const openInNewTab = menuInfo?.googleReviewsOpenInNewTab !== false;
    const label = isArabic
      ? (menuInfo?.googleReviewsButtonTextAr?.trim() ||
          DEFAULT_GOOGLE_REVIEWS_BUTTON_TEXT_AR)
      : (menuInfo?.googleReviewsButtonTextEn?.trim() ||
          DEFAULT_GOOGLE_REVIEWS_BUTTON_TEXT_EN);

    return {
      active: valid && menuInfo?.isActive !== false,
      url,
      position,
      showIcon,
      openInNewTab,
      label,
      isArabic,
    };
  }, [menuInfo, isArabic]);
}

function openGoogleReviews(
  url: string,
  openInNewTab: boolean,
): void {
  if (openInNewTab) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }
  window.location.assign(url);
}

function ReviewButtonContent({
  label,
  showIcon,
}: {
  label: string;
  showIcon: boolean;
}) {
  return (
    <>
      {showIcon ? (
        <>
          <span aria-hidden>⭐</span>
          <FcGoogle className="h-5 w-5 shrink-0" aria-hidden />
        </>
      ) : null}
      <span className="min-w-0 truncate">{label}</span>
    </>
  );
}

function AfterOrderModal({
  open,
  label,
  showIcon,
  isArabic,
  onClose,
  onReview,
}: {
  open: boolean;
  label: string;
  showIcon: boolean;
  isArabic: boolean;
  onClose: () => void;
  onReview: () => void;
}) {
  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-99999 flex items-end justify-center bg-black/45 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={label}
      dir={isArabic ? "rtl" : "ltr"}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            {showIcon ? <FcGoogle className="h-7 w-7" aria-hidden /> : null}
            <h2 className="text-base font-semibold text-slate-900">{label}</h2>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-full p-1 text-slate-500 hover:bg-slate-100"
          >
            <IoClose className="h-5 w-5" />
          </button>
        </div>
        <button
          type="button"
          onClick={onReview}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <ReviewButtonContent label={label} showIcon={showIcon} />
        </button>
      </div>
    </div>,
    document.body,
  );
}

export default function GoogleReviewsCta() {
  const config = useGoogleReviewsConfig();
  const isMenuCornerDockSession = useIsMenuCornerDockSession();
  const [afterOrderOpen, setAfterOrderOpen] = useState(false);

  const hasMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!config.active || config.position !== "after_order") return;
    return subscribeGoogleReviewsAfterOrderPrompt(() => {
      setAfterOrderOpen(true);
    });
  }, [config.active, config.position]);

  if (!hasMounted || !config.active) return null;

  const handleOpen = () => {
    openGoogleReviews(config.url, config.openInNewTab);
    setAfterOrderOpen(false);
  };

  if (config.position === "after_order") {
    return (
      <AfterOrderModal
        open={afterOrderOpen}
        label={config.label}
        showIcon={config.showIcon}
        isArabic={config.isArabic}
        onClose={() => setAfterOrderOpen(false)}
        onReview={handleOpen}
      />
    );
  }

  if (config.position === "top") {
    return createPortal(
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-99980 flex justify-center p-3 pt-[max(4.5rem,env(safe-area-inset-top,0px))]"
        dir={config.isArabic ? "rtl" : "ltr"}
      >
        <button
          type="button"
          onClick={handleOpen}
          className="pointer-events-auto inline-flex max-w-[min(100%,28rem)] items-center gap-2 rounded-full bg-slate-900/95 px-4 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-sm transition hover:bg-slate-800"
        >
          <ReviewButtonContent
            label={config.label}
            showIcon={config.showIcon}
          />
        </button>
      </div>,
      document.body,
    );
  }

  // Default / bottom
  const bottomClass = isMenuCornerDockSession
    ? MENU_MOBILE_TAB_BAR_CLEARANCE_CLASS
    : MENU_CART_FAB_BOTTOM_CLASS;

  return createPortal(
    <div
      className={`pointer-events-none fixed inset-x-0 z-99980 flex justify-center px-3 ${bottomClass}`}
      dir={config.isArabic ? "rtl" : "ltr"}
    >
      <button
        type="button"
        onClick={handleOpen}
        className="pointer-events-auto inline-flex max-w-[min(100%,28rem)] items-center gap-2 rounded-full bg-slate-900/95 px-4 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-sm transition hover:bg-slate-800"
      >
        <ReviewButtonContent
          label={config.label}
          showIcon={config.showIcon}
        />
      </button>
    </div>,
    document.body,
  );
}
