"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { DELIVERY_ZONE_PARAM } from "@/hooks/useIsOrderingEnabled";
import type { DeliveryGovernorate } from "@/types/menu";
import { MdLocationOn, MdLocationOff } from "react-icons/md";
import { FiX } from "react-icons/fi";

const MAX_DELIVERY_RADIUS_KM = 10;

/** Haversine formula — returns distance in kilometres between two GPS points. */
function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findNearestGovernorate(
  lat: number,
  lon: number,
  governorates: DeliveryGovernorate[],
): { governorate: DeliveryGovernorate; distanceKm: number } | null {
  let nearest: DeliveryGovernorate | null = null;
  let minDist = Infinity;

  for (const gov of governorates) {
    const dist = haversineKm(lat, lon, gov.lat, gov.lan);
    if (dist < minDist) {
      minDist = dist;
      nearest = gov;
    }
  }

  if (!nearest || minDist > MAX_DELIVERY_RADIUS_KM) return null;
  return { governorate: nearest, distanceKm: minDist };
}

type ModalState = "idle" | "requesting" | "found" | "not_found" | "denied";

export default function DeliveryLocationModal() {
  const locale = useLocale();
  const isArabic = locale === "ar";
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const delivery = useAppSelector((s) => s.menu.delivery);
  const menuInfo = useAppSelector((s) => s.menu.menuInfo);

  const [hasMounted, setHasMounted] = useState(false);
  const [modalState, setModalState] = useState<ModalState>("idle");
  const [foundGovernorate, setFoundGovernorate] =
    useState<DeliveryGovernorate | null>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const deliveryZoneAlreadySet = Boolean(
    searchParams.get(DELIVERY_ZONE_PARAM)?.trim(),
  );

  const shouldShow =
    hasMounted &&
    Boolean(delivery?.deliveryOn) &&
    Boolean(delivery?.governorates?.length) &&
    !deliveryZoneAlreadySet;

  const confirmGovernorate = useCallback(
    (gov: DeliveryGovernorate) => {
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.set(DELIVERY_ZONE_PARAM, String(gov.id));
      const path = nextParams.toString()
        ? `${pathname}?${nextParams.toString()}`
        : pathname;
      router.replace(path, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const handleDismiss = useCallback(() => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set(DELIVERY_ZONE_PARAM, "0");
    const path = nextParams.toString()
      ? `${pathname}?${nextParams.toString()}`
      : pathname;
    router.replace(path, { scroll: false });
  }, [pathname, router, searchParams]);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      handleDismiss();
      return;
    }
    setModalState("requesting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const result = findNearestGovernorate(
          latitude,
          longitude,
          delivery?.governorates ?? [],
        );
        if (result) {
          setFoundGovernorate(result.governorate);
          setModalState("found");
        } else {
          handleDismiss();
        }
      },
      () => {
        handleDismiss();
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }, [delivery?.governorates, handleDismiss]);

  const handleConfirm = useCallback(() => {
    if (foundGovernorate) {
      confirmGovernorate(foundGovernorate);
    }
  }, [confirmGovernorate, foundGovernorate]);

  const accentColor = useMemo(() => {
    const theme = (menuInfo?.theme ?? "default").toLowerCase();
    const fallbacks: Record<string, string> = {
      default: "hsl(271, 81%, 56%)",
      sky: "#2196F3",
      neon: "#14b8a6",
      coffee: "#F2B705",
      retro: "#C67115",
      music: "#4338CA",
      arcane: "#D1282A",
      emerald: "#4c1121",
      noir: "#7c3aed",
      oceanic: "#0ea5e9",
      pharaonic: "#C9A227",
      onecard: "#9333EA",
    };
    return fallbacks[theme] ?? fallbacks.default;
  }, [menuInfo?.theme]);

  const labels = useMemo(
    () =>
      isArabic
        ? {
            title: "تحديد موقع التوصيل",
            subtitle: "نحتاج إلى موقعك لتحديد منطقة التوصيل المتاحة",
            requestBtn: "مشاركة موقعي",
            requesting: "جاري تحديد موقعك...",
            foundTitle: "تم تحديد المنطقة!",
            foundSubtitle: (name: string, price: number) =>
              `يمكننا التوصيل إلى ${name} بسعر ${price} ${menuInfo?.currency ?? ""}`,
            confirmBtn: "تأكيد الطلب من هذه المنطقة",
            notFoundTitle: "خارج نطاق التوصيل",
            notFoundSubtitle: "عذرًا، موقعك خارج نطاق التوصيل (10 كم)",
            deniedTitle: "لم يتم الوصول إلى الموقع",
            deniedSubtitle: "يرجى السماح بالوصول إلى موقعك لتفعيل التوصيل",
            browseOnly: "تصفح القائمة فقط",
            retryBtn: "حاول مرة أخرى",
          }
        : {
            title: "Delivery Location",
            subtitle: "We need your location to confirm delivery is available",
            requestBtn: "Share my location",
            requesting: "Getting your location...",
            foundTitle: "Delivery area found!",
            foundSubtitle: (name: string, price: number) =>
              `We can deliver to ${name} for ${price} ${menuInfo?.currency ?? ""}`,
            confirmBtn: "Confirm delivery to this area",
            notFoundTitle: "Outside delivery range",
            notFoundSubtitle:
              "Sorry, your location is outside our delivery range (10 km)",
            deniedTitle: "Location access denied",
            deniedSubtitle:
              "Please allow location access in your browser to use delivery",
            browseOnly: "Just browse the menu",
            retryBtn: "Try again",
          },
    [isArabic, menuInfo?.currency],
  );

  if (!shouldShow) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-999999 flex  items-center justify-center bg-black/50 backdrop-blur-sm"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div
        className="w-full max-w-md rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl overflow-hidden"
        style={{ "--accent": accentColor } as React.CSSProperties}
      >
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ background: accentColor }}
        >
          <div className="flex items-center gap-3">
            <MdLocationOn className="h-6 w-6 text-white/90" />
            <h2 className="text-lg font-bold text-white">{labels.title}</h2>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-full p-1.5 text-white/80 hover:bg-white/20 transition"
            aria-label={labels.browseOnly}
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-6 space-y-5">
          {modalState === "idle" && (
            <>
              <p className="text-base text-zinc-600 text-center">
                {labels.subtitle}
              </p>
              <button
                type="button"
                onClick={requestLocation}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-base font-semibold text-white transition hover:opacity-90 active:scale-95"
                style={{ background: accentColor }}
              >
                <MdLocationOn className="h-5 w-5" />
                {labels.requestBtn}
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="w-full rounded-xl border border-zinc-200 py-2.5 text-base text-zinc-500 transition hover:bg-zinc-50"
              >
                {labels.browseOnly}
              </button>
            </>
          )}

          {modalState === "requesting" && (
            <div className="flex flex-col items-center gap-3 py-4">
              <div
                className="h-10 w-10 rounded-full border-4 border-t-transparent animate-spin"
                style={{
                  borderColor: `${accentColor} transparent ${accentColor} ${accentColor}`,
                }}
              />
              <p className="text-base text-zinc-600">{labels.requesting}</p>
            </div>
          )}

          {modalState === "found" && foundGovernorate && (
            <>
              <div className="flex flex-col items-center gap-2 py-2">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full"
                  style={{ background: `${accentColor}20` }}
                >
                  <MdLocationOn
                    className="h-7 w-7"
                    style={{ color: accentColor }}
                  />
                </div>
                <p className="text-lg font-bold" style={{ color: accentColor }}>
                  {labels.foundTitle}
                </p>
                <p className="text-base text-zinc-600 text-center">
                  {labels.foundSubtitle(
                    isArabic
                      ? foundGovernorate.nameAr
                      : foundGovernorate.nameEn,
                    foundGovernorate.price,
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full rounded-xl py-3 text-base font-semibold text-white transition hover:opacity-90 active:scale-95"
                style={{ background: accentColor }}
              >
                {labels.confirmBtn}
              </button>
            </>
          )}

          {(modalState === "not_found" || modalState === "denied") && (
            <>
              <div className="flex flex-col items-center gap-2 py-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                  <MdLocationOff className="h-7 w-7 text-red-400" />
                </div>
                <p className="text-lg font-bold text-zinc-800">
                  {modalState === "not_found"
                    ? labels.notFoundTitle
                    : labels.deniedTitle}
                </p>
                <p className="text-base text-zinc-500 text-center">
                  {modalState === "not_found"
                    ? labels.notFoundSubtitle
                    : labels.deniedSubtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalState("idle")}
                className="w-full rounded-xl py-3 text-base font-semibold text-white transition hover:opacity-90"
                style={{ background: accentColor }}
              >
                {labels.retryBtn}
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="w-full rounded-xl border border-zinc-200 py-2.5 text-base text-zinc-500 transition hover:bg-zinc-50"
              >
                {labels.browseOnly}
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
