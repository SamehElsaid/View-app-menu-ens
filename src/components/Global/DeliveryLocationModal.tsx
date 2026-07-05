"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { useLocale } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { DeliveryGovernorate } from "@/types/menu";
import {
  resolveDeliveryLocation,
  type ResolvedDistanceDelivery,
} from "@/lib/resolveDeliveryLocation";
import {
  SET_DELIVERY_BROWSE_ONLY,
  SET_DELIVERY_DISTANCE,
  SET_DELIVERY_GOVERNORATE,
} from "@/store/authMenu/authMenu";
import { MdLocationOn, MdLocationOff } from "react-icons/md";
import { FiX } from "react-icons/fi";

type ModalState = "idle" | "requesting" | "found" | "not_found" | "denied";

export default function DeliveryLocationModal() {
  const locale = useLocale();
  const isArabic = locale === "ar";
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const delivery = useAppSelector((s) => s.menu.delivery);
  const branches = useAppSelector((s) => s.menu.branches);
  const menuInfo = useAppSelector((s) => s.menu.menuInfo);
  const deliveryContext = useAppSelector((s) => s.menu.deliveryContext);

  const hasMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [modalState, setModalState] = useState<ModalState>("idle");
  const [foundGovernorate, setFoundGovernorate] =
    useState<DeliveryGovernorate | null>(null);
  const [foundDistance, setFoundDistance] =
    useState<ResolvedDistanceDelivery | null>(null);
  const autoLocationRequestedRef = useRef(false);

  const deliveryAlreadySet =
    deliveryContext.browseOnly ||
    deliveryContext.governorateId != null ||
    deliveryContext.distance != null;

  const isDistanceMode =
    delivery?.deliveryMode === "distance" && branches.length > 0;
  const hasGovernorateMode = (delivery?.governorates?.length ?? 0) > 0;

  const shouldShow =
    hasMounted &&
    Boolean(delivery?.deliveryOn) &&
    (isDistanceMode || hasGovernorateMode) &&
    !deliveryAlreadySet;

  const resetModal = useCallback(() => {
    setModalState("idle");
    setFoundGovernorate(null);
    setFoundDistance(null);
  }, []);

  const confirmGovernorate = useCallback(
    (gov: DeliveryGovernorate) => {
      dispatch(SET_DELIVERY_GOVERNORATE(gov.id));
    },
    [dispatch],
  );

  const confirmDistance = useCallback(
    (resolved: ResolvedDistanceDelivery) => {
      dispatch(
        SET_DELIVERY_DISTANCE({
          branchId: resolved.branchId,
          lat: resolved.lat,
          lng: resolved.lng,
        }),
      );
    },
    [dispatch],
  );

  const handleDismiss = useCallback(() => {
    resetModal();
    dispatch(SET_DELIVERY_BROWSE_ONLY());
  }, [dispatch, resetModal]);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setModalState("denied");
      return;
    }
    if (!menuInfo?.slug) return;

    setModalState("requesting");
    setFoundGovernorate(null);
    setFoundDistance(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const nextParams = new URLSearchParams(searchParams.toString());

        const result = await resolveDeliveryLocation({
          menuSlug: menuInfo.slug,
          lat: latitude,
          lng: longitude,
          locale,
          pathname,
          search: nextParams.toString(),
          deliveryMode: delivery?.deliveryMode,
          branches,
          governorates: delivery?.governorates ?? [],
          branchDisplayName: (branch) => branch.name?.trim() || menuInfo.name,
        });

        if (result.kind === "redirecting") return;

        if (result.kind === "distance") {
          setFoundDistance(result);
          setModalState("found");
          return;
        }

        if (result.kind === "governorate") {
          setFoundGovernorate(result.governorate);
          setModalState("found");
          return;
        }

        setModalState("not_found");
      },
      () => {
        setModalState("denied");
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 60_000 },
    );
  }, [
    branches,
    delivery?.deliveryMode,
    delivery?.governorates,
    locale,
    menuInfo?.name,
    menuInfo?.slug,
    pathname,
    searchParams,
  ]);

  useEffect(() => {
    if (!shouldShow) {
      autoLocationRequestedRef.current = false;
      return;
    }
    if (autoLocationRequestedRef.current || !menuInfo?.slug) return;
    autoLocationRequestedRef.current = true;
    requestLocation();
  }, [shouldShow, menuInfo?.slug, requestLocation]);

  const handleConfirm = useCallback(() => {
    if (foundDistance) {
      confirmDistance(foundDistance);
    } else if (foundGovernorate) {
      confirmGovernorate(foundGovernorate);
    }
    resetModal();
  }, [confirmDistance, confirmGovernorate, foundDistance, foundGovernorate, resetModal]);

  const customizations = useAppSelector((s) => s.menu.menuCustomizations);
  const accentColor = customizations?.primaryColor?.trim() || "#7000B5";

  const labels = useMemo(
    () =>
      isArabic
        ? {
            title: "تحديد موقع التوصيل",
            subtitle: isDistanceMode
              ? "نحتاج موقعك لحساب رسوم التوصيل حسب المسافة"
              : "نحتاج إلى موقعك لتحديد منطقة التوصيل المتاحة",
            requestBtn: "مشاركة موقعي",
            requesting: "جاري تحديد موقعك...",
            foundTitle: "تم تحديد المنطقة!",
            foundSubtitleGov: (name: string, price: number) =>
              `يمكننا التوصيل إلى ${name} بسعر ${price} ${menuInfo?.currency ?? ""}`,
            foundSubtitleDistance: (
              name: string,
              fee: number,
              km: number,
            ) =>
              `الفرع: ${name} — ${fee} ${menuInfo?.currency ?? ""} (≈ ${km.toFixed(1)} كم)`,
            confirmBtn: "تأكيد التوصيل",
            notFoundTitle: "خارج نطاق التوصيل",
            notFoundSubtitle: "عذرًا، موقعك خارج نطاق التوصيل لهذا الفرع",
            deniedTitle: "لم يتم الوصول إلى الموقع",
            deniedSubtitle: "يرجى السماح بالوصول إلى موقعك لتفعيل التوصيل",
            browseOnly: "تصفح القائمة فقط",
            retryBtn: "حاول مرة أخرى",
          }
        : {
            title: "Delivery Location",
            subtitle: isDistanceMode
              ? "We need your location to calculate distance-based delivery"
              : "We need your location to confirm delivery is available",
            requestBtn: "Share my location",
            requesting: "Getting your location...",
            foundTitle: "Delivery available!",
            foundSubtitleGov: (name: string, price: number) =>
              `We can deliver to ${name} for ${price} ${menuInfo?.currency ?? ""}`,
            foundSubtitleDistance: (name: string, fee: number, km: number) =>
              `Branch: ${name} — ${fee} ${menuInfo?.currency ?? ""} (≈ ${km.toFixed(1)} km)`,
            confirmBtn: "Confirm delivery",
            notFoundTitle: "Outside delivery range",
            notFoundSubtitle:
              "Sorry, your location is outside this branch delivery range",
            deniedTitle: "Location access denied",
            deniedSubtitle:
              "Please allow location access in your browser to use delivery",
            browseOnly: "Just browse the menu",
            retryBtn: "Try again",
          },
    [isArabic, isDistanceMode, menuInfo?.currency],
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
            <div className="flex flex-col items-center gap-4 py-6">
              <div
                className="h-10 w-10 rounded-full border-4 border-t-transparent animate-spin"
                style={{ borderColor: `${accentColor}33`, borderTopColor: accentColor }}
              />
              <p className="text-base text-zinc-600">{labels.requesting}</p>
            </div>
          )}

          {modalState === "found" && (foundDistance || foundGovernorate) && (
            <>
              <div className="text-center space-y-2">
                <MdLocationOn
                  className="mx-auto h-12 w-12"
                  style={{ color: accentColor }}
                />
                <h3 className="text-lg font-bold text-zinc-900">
                  {labels.foundTitle}
                </h3>
                <p className="text-base text-zinc-600">
                  {foundDistance
                    ? labels.foundSubtitleDistance(
                        foundDistance.branchName,
                        foundDistance.quote.deliveryFee ?? 0,
                        foundDistance.quote.distanceKm,
                      )
                    : foundGovernorate
                      ? labels.foundSubtitleGov(
                          isArabic
                            ? foundGovernorate.nameAr
                            : foundGovernorate.nameEn,
                          foundGovernorate.price,
                        )
                      : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full rounded-xl py-3 text-base font-semibold text-white transition hover:opacity-90"
                style={{ background: accentColor }}
              >
                {labels.confirmBtn}
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

          {modalState === "not_found" && (
            <>
              <div className="text-center space-y-2">
                <MdLocationOff className="mx-auto h-12 w-12 text-zinc-400" />
                <h3 className="text-lg font-bold text-zinc-900">
                  {labels.notFoundTitle}
                </h3>
                <p className="text-base text-zinc-600">{labels.notFoundSubtitle}</p>
              </div>
              <button
                type="button"
                onClick={requestLocation}
                className="w-full rounded-xl py-3 text-base font-semibold text-white"
                style={{ background: accentColor }}
              >
                {labels.retryBtn}
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="w-full rounded-xl border border-zinc-200 py-2.5 text-base text-zinc-500"
              >
                {labels.browseOnly}
              </button>
            </>
          )}

          {modalState === "denied" && (
            <>
              <div className="text-center space-y-2">
                <MdLocationOff className="mx-auto h-12 w-12 text-zinc-400" />
                <h3 className="text-lg font-bold text-zinc-900">
                  {labels.deniedTitle}
                </h3>
                <p className="text-base text-zinc-600">{labels.deniedSubtitle}</p>
              </div>
              <button
                type="button"
                onClick={requestLocation}
                className="w-full rounded-xl py-3 text-base font-semibold text-white"
                style={{ background: accentColor }}
              >
                {labels.retryBtn}
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="w-full rounded-xl border border-zinc-200 py-2.5 text-base text-zinc-500"
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
