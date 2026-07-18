"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import { FiMapPin, FiSearch, FiX } from "react-icons/fi";
import { MdLocationOn, MdMyLocation } from "react-icons/md";
import { toast } from "react-toastify";
import { useIsOrderingEnabled } from "@/hooks/useIsOrderingEnabled";
import { fetchBranchDeliveryQuote } from "@/lib/fetchDeliveryQuote";
import {
  resolveDeliveryAreaLabelSync,
  resolveDeliveryAreaNames,
} from "@/lib/deliveryAreaName";
import { resolveDeliveryLocation } from "@/lib/resolveDeliveryLocation";
import {
  SET_DELIVERY_DISTANCE,
  SET_DELIVERY_GOVERNORATE,
} from "@/store/authMenu/authMenu";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { DeliveryGovernorate } from "@/types/menu";

export type DeliveryOrderAreaSectionProps = {
  currencyLabel: string;
  error?: string;
  onClearError?: () => void;
};

/**
 * Shared «منطقة التوصيل» block (governorate / distance + fee + locate).
 * Used by floating cart and AI checkout for delivery orders.
 */
export default function DeliveryOrderAreaSection({
  currencyLabel,
  error,
  onClearError,
}: DeliveryOrderAreaSectionProps) {
  const locale = useLocale();
  const isArabic = locale === "ar";
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const menuInfo = useAppSelector((s) => s.menu.menuInfo);
  const delivery = useAppSelector((s) => s.menu.delivery);
  const deliveryContext = useAppSelector((s) => s.menu.deliveryContext);
  const branches = useAppSelector((s) => s.menu.branches);
  const {
    isDeliveryOrder,
    isDistanceDelivery,
    governorateId,
    deliveryBranchId,
    deliveryLat,
    deliveryLng,
  } = useIsOrderingEnabled();

  const [showGovSearch, setShowGovSearch] = useState(false);
  const [govSearchText, setGovSearchText] = useState("");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [distanceDeliveryFee, setDistanceDeliveryFee] = useState<number | null>(
    null,
  );
  const [distanceDeliveryKm, setDistanceDeliveryKm] = useState<number | null>(
    null,
  );

  const labels = useMemo(
    () =>
      isArabic
        ? {
            deliveryArea: "منطقة التوصيل",
            changeArea: "تغيير",
            searchArea: "ابحث عن المنطقة...",
            detectLocation: "اسمح لنا بتحديد موقعك",
            deliveryFee: "رسوم التوصيل",
            detecting: "جاري التحديد...",
            noResults: "لا توجد نتائج",
            outOfRange: "موقعك خارج نطاق التوصيل",
            allowLocation: "يرجى السماح بالوصول للموقع في المتصفح",
          }
        : {
            deliveryArea: "Delivery area",
            changeArea: "Change",
            searchArea: "Search area...",
            detectLocation: "Allow us to detect your location",
            deliveryFee: "Delivery fee",
            detecting: "Detecting...",
            noResults: "No results",
            outOfRange: "Location outside delivery range",
            allowLocation: "Please allow location access in your browser",
          },
    [isArabic],
  );

  useEffect(() => {
    if (
      !isDistanceDelivery ||
      !menuInfo?.slug ||
      deliveryBranchId == null ||
      deliveryLat == null ||
      deliveryLng == null
    ) {
      setDistanceDeliveryFee(null);
      setDistanceDeliveryKm(null);
      return;
    }

    let cancelled = false;
    void fetchBranchDeliveryQuote(
      menuInfo.slug,
      deliveryBranchId,
      deliveryLat,
      deliveryLng,
      locale,
    ).then((quote) => {
      if (cancelled) return;
      setDistanceDeliveryFee(quote?.inRange ? quote.deliveryFee : null);
      setDistanceDeliveryKm(quote?.distanceKm ?? null);
    });

    return () => {
      cancelled = true;
    };
  }, [
    deliveryBranchId,
    deliveryLat,
    deliveryLng,
    isDistanceDelivery,
    locale,
    menuInfo?.slug,
  ]);

  const currentGovernorate = useMemo<DeliveryGovernorate | null>(() => {
    if (
      !isDeliveryOrder ||
      isDistanceDelivery ||
      !governorateId ||
      !delivery?.governorates?.length
    ) {
      return null;
    }
    return delivery.governorates.find((g) => g.id === governorateId) ?? null;
  }, [
    delivery?.governorates,
    governorateId,
    isDeliveryOrder,
    isDistanceDelivery,
  ]);

  const filteredGovernorates = useMemo<DeliveryGovernorate[]>(() => {
    if (!delivery?.governorates?.length) return [];
    const q = govSearchText.trim().toLowerCase();
    if (!q) return delivery.governorates;
    return delivery.governorates.filter(
      (g) =>
        g.nameAr.toLowerCase().includes(q) ||
        g.nameEn.toLowerCase().includes(q),
    );
  }, [delivery?.governorates, govSearchText]);

  const changeGovernorate = useCallback(
    (id: number) => {
      dispatch(SET_DELIVERY_GOVERNORATE(id));
      setShowGovSearch(false);
      setGovSearchText("");
      onClearError?.();
    },
    [dispatch, onClearError],
  );

  const applyDistanceDelivery = useCallback(
    (
      branchId: number,
      lat: number,
      lng: number,
      fee: number,
      km: number,
      areaNameAr?: string,
      areaNameEn?: string,
    ) => {
      dispatch(
        SET_DELIVERY_DISTANCE({
          branchId,
          lat,
          lng,
          ...(areaNameAr?.trim() ? { areaNameAr: areaNameAr.trim() } : {}),
          ...(areaNameEn?.trim() ? { areaNameEn: areaNameEn.trim() } : {}),
        }),
      );
      setDistanceDeliveryFee(fee);
      setDistanceDeliveryKm(km);
      setShowGovSearch(false);
      setGovSearchText("");
      onClearError?.();
    },
    [dispatch, onClearError],
  );

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation || !menuInfo?.slug) return;
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
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

        if (result.kind === "redirecting") {
          setIsDetectingLocation(false);
          return;
        }

        if (result.kind === "distance") {
          const areaNames = await resolveDeliveryAreaNames(
            result.lat,
            result.lng,
            delivery?.governorates ?? [],
          );
          applyDistanceDelivery(
            result.branchId,
            result.lat,
            result.lng,
            result.quote.deliveryFee ?? 0,
            result.quote.distanceKm,
            areaNames.nameAr,
            areaNames.nameEn,
          );
          setIsDetectingLocation(false);
          return;
        }

        if (result.kind === "governorate") {
          changeGovernorate(result.governorate.id);
          setIsDetectingLocation(false);
          return;
        }

        toast.warning(labels.outOfRange);
        setIsDetectingLocation(false);
      },
      () => {
        setIsDetectingLocation(false);
        toast.error(labels.allowLocation);
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }, [
    applyDistanceDelivery,
    branches,
    changeGovernorate,
    delivery?.deliveryMode,
    delivery?.governorates,
    labels.allowLocation,
    labels.outOfRange,
    locale,
    menuInfo?.name,
    menuInfo?.slug,
    pathname,
    searchParams,
  ]);

  const deliveryAreaLabel = useMemo(() => {
    if (currentGovernorate) {
      return isArabic
        ? currentGovernorate.nameAr
        : currentGovernorate.nameEn;
    }
    if (isDistanceDelivery) {
      return resolveDeliveryAreaLabelSync(
        isArabic,
        deliveryLat,
        deliveryLng,
        deliveryContext.distance
          ? {
              nameAr: deliveryContext.distance.areaNameAr ?? "",
              nameEn: deliveryContext.distance.areaNameEn ?? "",
            }
          : null,
        delivery?.governorates ?? [],
      );
    }
    return "";
  }, [
    currentGovernorate,
    delivery?.governorates,
    deliveryContext.distance,
    deliveryLat,
    deliveryLng,
    isArabic,
    isDistanceDelivery,
  ]);

  if (!isDeliveryOrder) return null;

  const hasSelectedArea =
    (isDistanceDelivery && distanceDeliveryFee != null) ||
    Boolean(currentGovernorate);

  return (
    <div>
      <div
        className={`overflow-hidden rounded-2xl border shadow-sm ${
          error ? "border-rose-400" : "border-(--bg-main)/15"
        }`}
      >
        <div
          className="flex items-center gap-2 px-3 py-2"
          style={{
            background: `color-mix(in srgb, var(--bg-main) 10%, transparent)`,
          }}
        >
          <MdLocationOn className="h-4 w-4 text-(--bg-main)" />
          <span className="text-sm font-semibold text-(--bg-main)">
            {labels.deliveryArea}
          </span>
          <span className="ms-0.5 text-sm font-bold text-rose-500">*</span>
        </div>

        {!showGovSearch && hasSelectedArea ? (
          <div className="space-y-2.5 bg-white px-3 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-zinc-900">
                  {isDistanceDelivery
                    ? deliveryAreaLabel || labels.deliveryArea
                    : isArabic
                      ? currentGovernorate!.nameAr
                      : currentGovernorate!.nameEn}
                </p>
                <p className="text-sm text-zinc-400">
                  🚚 {labels.deliveryFee}:{" "}
                  <span className="font-semibold text-zinc-600">
                    {isDistanceDelivery
                      ? distanceDeliveryFee
                      : currentGovernorate!.price}{" "}
                    {currencyLabel}
                  </span>
                  {isDistanceDelivery && distanceDeliveryKm != null ? (
                    <span className="ms-1">
                      (≈ {distanceDeliveryKm.toFixed(1)}{" "}
                      {isArabic ? "كم" : "km"})
                    </span>
                  ) : null}
                </p>
              </div>
              {!isDistanceDelivery ? (
                <button
                  type="button"
                  onClick={() => setShowGovSearch(true)}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-(--bg-main)/30 bg-(--bg-main)/6 px-3 py-1 text-sm font-semibold text-(--bg-main) transition hover:bg-(--bg-main)/15 active:scale-95"
                >
                  <FiMapPin className="h-3.5 w-3.5" />
                  {labels.changeArea}
                </button>
              ) : null}
            </div>

            <div className="border-t border-zinc-100" />

            <button
              type="button"
              onClick={detectLocation}
              disabled={isDetectingLocation}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-(--bg-main)/25 bg-(--bg-main)/5 py-2 text-sm font-medium text-(--bg-main) transition hover:bg-(--bg-main)/12 active:scale-[0.98] disabled:opacity-50"
            >
              {isDetectingLocation ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-(--bg-main) border-t-transparent" />
                  {labels.detecting}
                </>
              ) : (
                <>
                  <MdMyLocation className="h-4 w-4" />
                  {labels.detectLocation}
                </>
              )}
            </button>
          </div>
        ) : !isDistanceDelivery ? (
          <div className="bg-white">
            <div className="flex items-center gap-2 border-b border-zinc-100 px-3 py-2.5">
              <FiSearch className="h-4 w-4 shrink-0 text-(--bg-main)/60" />
              <input
                type="text"
                autoFocus
                value={govSearchText}
                onChange={(e) => setGovSearchText(e.target.value)}
                placeholder={labels.searchArea}
                className="flex-1 bg-transparent text-base outline-none placeholder:text-zinc-400"
              />
              <button
                type="button"
                onClick={() => {
                  setShowGovSearch(false);
                  setGovSearchText("");
                }}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 transition hover:bg-zinc-200"
              >
                <FiX className="h-3.5 w-3.5" />
              </button>
            </div>

            <ul className="max-h-48 overflow-y-auto">
              {filteredGovernorates.length ? (
                filteredGovernorates.map((gov) => {
                  const isSelected = gov.id === governorateId;
                  return (
                    <li key={gov.id}>
                      <button
                        type="button"
                        onClick={() => changeGovernorate(gov.id)}
                        className={`flex w-full items-center justify-between gap-3 px-3 py-3 text-start transition hover:bg-(--bg-main)/6 ${
                          isSelected ? "bg-(--bg-main)/8" : ""
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                              isSelected
                                ? "bg-(--bg-main) text-white"
                                : "bg-zinc-100 text-zinc-400"
                            }`}
                          >
                            <FiMapPin className="h-3.5 w-3.5" />
                          </span>
                          <span
                            className={`truncate text-base ${
                              isSelected
                                ? "font-bold text-(--bg-main)"
                                : "font-medium text-zinc-800"
                            }`}
                          >
                            {isArabic ? gov.nameAr : gov.nameEn}
                          </span>
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-sm font-semibold ${
                            isSelected
                              ? "bg-(--bg-main)/15 text-(--bg-main)"
                              : "bg-zinc-100 text-zinc-500"
                          }`}
                        >
                          {gov.price} {currencyLabel}
                        </span>
                      </button>
                    </li>
                  );
                })
              ) : (
                <li className="px-3 py-5 text-center text-sm text-zinc-400">
                  {labels.noResults}
                </li>
              )}
            </ul>
          </div>
        ) : (
          <div className="bg-white px-3 py-3">
            <button
              type="button"
              onClick={detectLocation}
              disabled={isDetectingLocation}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-(--bg-main)/25 bg-(--bg-main)/5 py-2.5 text-sm font-medium text-(--bg-main) transition hover:bg-(--bg-main)/12 active:scale-[0.98] disabled:opacity-50"
            >
              {isDetectingLocation ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-(--bg-main) border-t-transparent" />
                  {labels.detecting}
                </>
              ) : (
                <>
                  <MdMyLocation className="h-4 w-4" />
                  {labels.detectLocation}
                </>
              )}
            </button>
          </div>
        )}
      </div>
      {error ? (
        <p className="mt-1.5 flex items-center gap-1 text-sm text-rose-500">
          <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-rose-100 text-[10px] font-bold text-rose-500">
            !
          </span>
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Whether delivery area is ready for checkout submit. */
export function useDeliveryAreaReady(): boolean {
  const delivery = useAppSelector((s) => s.menu.delivery);
  const {
    isDeliveryOrder,
    isDistanceDelivery,
    governorateId,
    deliveryBranchId,
    deliveryLat,
    deliveryLng,
  } = useIsOrderingEnabled();

  if (!isDeliveryOrder) return true;

  if (isDistanceDelivery) {
    return (
      deliveryBranchId != null && deliveryLat != null && deliveryLng != null
    );
  }

  return Boolean(
    governorateId &&
      delivery?.governorates?.some((g) => g.id === governorateId),
  );
}
