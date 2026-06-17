"use client";

import type { CSSProperties } from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  startTransition,
} from "react";
import { createPortal } from "react-dom";
import { useLocale } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { useAppSelector } from "@/store/hooks";
import { arabCurrencies, Currency } from "@/constants/currencies";
import { axiosPost } from "@/shared/axiosCall";
import { FiX, FiSearch, FiMapPin } from "react-icons/fi";
import { IoCartOutline } from "react-icons/io5";
import { MdLocationOn, MdMyLocation } from "react-icons/md";
import type { DeliveryGovernorate } from "@/types/menu";
import LoadImage from "@/components/ImageLoad";
import {
  notifySkyCartUpdated,
  readSkyCartFromCookie,
  updateSkyCartLineQuantity,
  writeSkyCartToCookie,
  type SkyCart,
  type SkyCartItem,
} from "@/lib/skyTemplateCart";
import { useTableCartAllowed } from "@/hooks/useTableCartAllowed";
import { useIsOrderingEnabled } from "@/hooks/useIsOrderingEnabled";

/** When `menuCustomizations.primaryColor` is missing, match each template’s default accent. */
const THEME_BG_MAIN_FALLBACK: Record<string, string> = {
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
};

type StaffCallPayload = {
  menuId: number;
  tableNumber: string;
  customerName: string;
  governorateId?: number | null;
  items: Array<{
    menuItemId: number;
    quantity: number;
    price?: number;
    size?: {
      nameEn: string;
      nameAr: string;
      price: number;
    } | null;
    variant?: {
      labelEn: string;
      labelAr: string;
      price: number;
    } | null;
  }>;
};

const updateURL = (
  menuOpen: boolean,
  router: ReturnType<typeof useRouter>,
  pathname: string,
  mainQuery = "menu",
) => {
  const nextParams = new URL(window.location.href).searchParams;
  const isOpen = nextParams.get(mainQuery) === "true";
  const buildPath = (params: URLSearchParams) =>
    params.toString() ? `${pathname}?${params.toString()}` : pathname;

  if (menuOpen) {
    if (isOpen) {
      nextParams.delete(mainQuery);
      router.replace(buildPath(nextParams), { scroll: false });
      setTimeout(() => {
        const reopenParams = new URLSearchParams(nextParams.toString());
        reopenParams.set(mainQuery, "true");
        router.replace(buildPath(reopenParams), { scroll: false });
      }, 0);
    } else {
      nextParams.set(mainQuery, "true");
      router.replace(buildPath(nextParams), { scroll: false });
    }
  } else if (isOpen) {
    nextParams.delete(mainQuery);
    router.replace(buildPath(nextParams), { scroll: false });
  } else {
    nextParams.set(mainQuery, "false");
    setTimeout(() => {
      router.replace(buildPath(nextParams), { scroll: false });
    }, 0);
  }
};

const useClosePopupWithPopstate = ({
  setOpen,
  mainQuery = "menu",
}: {
  setOpen: (isOpen: boolean) => void;
  mainQuery?: string;
}) => {
  useEffect(() => {
    const handlePopState = () => {
      const params = new URL(window.location.href).searchParams;
      setOpen(params.get(mainQuery) === "true");
    };

    window.addEventListener("popstate", handlePopState);
    handlePopState();
    return () => window.removeEventListener("popstate", handlePopState);
  }, [mainQuery, setOpen]);
};

export default function RequestStaffButton() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const menuInfo = useAppSelector((s) => s.menu.menuInfo);
  const menuCustomizations = useAppSelector((s) => s.menu.menuCustomizations);
  const storeMenu = useAppSelector((s) => s.menu.menu);
  const isMenuActive = menuInfo?.isActive !== false;
  const isArabic = locale === "ar";
  const {
    isOrderingEnabled,
    isDeliveryOrder,
    tableNumber,
    governorateId,
  } = useIsOrderingEnabled();
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [customerName, setCustomerName] = useState("");
  /** Empty initial state avoids SSR/client mismatch (cookies only exist on client). */
  const [cart, setCart] = useState<SkyCart>({});
  const [isConfirming, setIsConfirming] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const tableCartAllowed = useTableCartAllowed();

  const themeKey = (menuInfo?.theme ?? "default").toLowerCase();
  const accentMain = useMemo(() => {
    const custom = menuCustomizations?.primaryColor?.trim();
    if (custom) return custom;
    return THEME_BG_MAIN_FALLBACK[themeKey] ?? THEME_BG_MAIN_FALLBACK.default;
  }, [menuCustomizations?.primaryColor, themeKey]);

  const delivery = useAppSelector((s) => s.menu.delivery);
  const [showGovSearch, setShowGovSearch] = useState(false);
  const [govSearchText, setGovSearchText] = useState("");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const currentGovernorate = useMemo<DeliveryGovernorate | null>(() => {
    if (!isDeliveryOrder || !governorateId || !delivery?.governorates?.length) return null;
    return delivery.governorates.find((g) => g.id === governorateId) ?? null;
  }, [isDeliveryOrder, governorateId, delivery?.governorates]);

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
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.set("deliveryZone", String(id));
      const path = nextParams.toString()
        ? `${pathname}?${nextParams.toString()}`
        : pathname;
      router.replace(path, { scroll: false });
      setShowGovSearch(false);
      setGovSearchText("");
    },
    [pathname, router, searchParams],
  );

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const govs = delivery?.governorates ?? [];
        let nearest: DeliveryGovernorate | null = null;
        let minDist = Infinity;
        for (const g of govs) {
          const dLat = ((g.lat - latitude) * Math.PI) / 180;
          const dLon = ((g.lan - longitude) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((latitude * Math.PI) / 180) *
              Math.cos((g.lat * Math.PI) / 180) *
              Math.sin(dLon / 2) ** 2;
          const dist = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          if (dist < minDist) {
            minDist = dist;
            nearest = g;
          }
        }
        if (nearest && minDist <= 10) {
          changeGovernorate(nearest.id);
        } else {
          toast.warning(isArabic ? "موقعك خارج نطاق التوصيل" : "Location outside delivery range");
        }
        setIsDetectingLocation(false);
      },
      () => {
        setIsDetectingLocation(false);
        toast.error(isArabic ? "يرجى السماح بالوصول للموقع في المتصفح" : "Please allow location access in your browser");
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }, [changeGovernorate, delivery?.governorates, isArabic]);

  const labels = useMemo(
    () =>
      isArabic
        ? {
            cart: "السلة",
            openCart: "فتح السلة",
            close: "إغلاق",
            step1: "الخطوة 1: المنتجات",
            step2: "الخطوة 2: بيانات الطلب",
            products: "المنتجات",
            total: "الإجمالي",
            empty: "السلة فارغة",
            next: "التالي",
            back: "رجوع",
            name: "اسم العميل",
            namePlaceholder: "اكتب اسمك",
            confirm: "تأكيد الطلب",
            success: "تم تأكيد الطلب بنجاح",
            enterName: "يرجى إدخال الاسم",
            orderFailed: "تعذر تأكيد الطلب، يرجى المحاولة مرة أخرى",
            noValidItems:
              "لا توجد منتجات صالحة في السلة. أضف منتجات من القائمة أو أعد تحميل الصفحة.",
            increase: "زيادة",
            decrease: "تقليل",
            deliveryArea: "منطقة التوصيل",
            changeArea: "تغيير",
            searchArea: "ابحث عن المنطقة...",
            detectLocation: "اسمح لنا بتحديد موقعك",
            deliveryFee: "رسوم التوصيل",
          }
        : {
            cart: "Cart",
            openCart: "Open cart",
            close: "Close",
            step1: "Step 1: Products",
            step2: "Step 2: Order details",
            products: "Products",
            total: "Total",
            empty: "Cart is empty",
            next: "Next",
            back: "Back",
            name: "Customer name",
            namePlaceholder: "Enter your name",
            confirm: "Confirm order",
            success: "Order confirmed successfully",
            enterName: "Please enter your name",
            orderFailed: "Could not confirm order, please try again",
            noValidItems:
              "No valid items in the cart. Add products from the menu or refresh the page.",
            increase: "Increase",
            decrease: "Decrease",
            deliveryArea: "Delivery area",
            changeArea: "Change",
            searchArea: "Search area...",
            detectLocation: "Allow us to detect your location",
            deliveryFee: "Delivery fee",
          },
    [isArabic],
  );

  const getCurrency = () => {
    const currencyCode = menuInfo?.currency || "AED";
    let currencySymbol: string = currencyCode;

    if (isArabic) {
      const foundCurrency = arabCurrencies.find(
        (currencyList: Currency) => currencyList.code === currencyCode,
      );
      if (foundCurrency?.symbol) {
        currencySymbol = foundCurrency.symbol;
      }
    }

    return currencySymbol;
  };

  useEffect(() => {
    setHasMounted(true);
    const syncFromCookie = () =>
      startTransition(() => setCart(readSkyCartFromCookie()));
    syncFromCookie();
    const intervalId = setInterval(syncFromCookie, 1500);
    return () => clearInterval(intervalId);
  }, []);

  const cartItems = useMemo(
    () => Object.values(cart).filter((item) => item.quantity > 0),
    [cart],
  );

  /** Lines whose id still exists on the loaded menu (ignore stale / missing ids). */
  const cartItemsForOrder = useMemo(() => {
    const ids = new Set((storeMenu ?? []).map((m) => m.id));
    if (ids.size === 0) return cartItems;
    return cartItems.filter((item) => ids.has(item.id));
  }, [cartItems, storeMenu]);
  const totalQuantity = useMemo(
    () => cartItemsForOrder.reduce((sum, item) => sum + item.quantity, 0),
    [cartItemsForOrder],
  );

  const totalPrice = useMemo(
    () =>
      cartItemsForOrder.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      ),
    [cartItemsForOrder],
  );

  const syncDrawerWithURL = useCallback((shouldOpen: boolean) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    if (shouldOpen) {
      setIsDrawerVisible(true);
      requestAnimationFrame(() => setOpen(true));
      return;
    }

    setOpen(false);
    closeTimeoutRef.current = setTimeout(() => {
      setIsDrawerVisible(false);
      setStep(1);
    }, 300);
  }, []);

  useClosePopupWithPopstate({
    setOpen: syncDrawerWithURL,
    mainQuery: "homeMenu",
  });

  const openDrawer = () => {
    setStep(1);
    syncDrawerWithURL(true);
    updateURL(true, router, pathname, "homeMenu");
  };

  const closeDrawer = () => {
    syncDrawerWithURL(false);
    updateURL(false, router, pathname, "homeMenu");
  };

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const homeMenu =
      new URL(window.location.href).searchParams.get("homeMenu") === "true";
    if (homeMenu) {
      syncDrawerWithURL(true);
    }
  }, [syncDrawerWithURL]);

  const goToStep2 = () => {
    if (!cartItemsForOrder.length) return;
    setStep(2);
  };

  const updateItemQuantity = (lineKey: string, delta: number) => {
    updateSkyCartLineQuantity(lineKey, delta);
    setCart(readSkyCartFromCookie());
  };

  const buildWhatsAppMessage = useCallback(
    (name: string, items: typeof cartItemsForOrder, total: number): string => {
      const currency = menuInfo?.currency ?? "";
      const govName = currentGovernorate
        ? isArabic
          ? currentGovernorate.nameAr
          : currentGovernorate.nameEn
        : "";
      const govFee = currentGovernorate?.price ?? 0;

      const lines: string[] = [];

      if (isArabic) {
        lines.push("🛵 *طلب توصيل جديد*");
        lines.push(`👤 العميل: ${name}`);
        if (govName) lines.push(`📍 المنطقة: ${govName}`);
        lines.push("");
        lines.push("📋 *الطلبات:*");
        for (const item of items) {
          const sizePart = item.size
            ? ` (${item.size.nameAr || item.size.nameEn})`
            : "";
          const variantPart = item.variant
            ? ` + ${item.variant.labelAr || item.variant.labelEn}`
            : "";
          lines.push(
            `• ${item.name}${sizePart}${variantPart} × ${item.quantity} = ${(item.price * item.quantity).toFixed(2)} ${currency}`,
          );
        }
        lines.push("");
        lines.push(`💵 الإجمالي: ${total.toFixed(2)} ${currency}`);
        if (govFee > 0)
          lines.push(`🚚 رسوم التوصيل: ${govFee} ${currency}`);
        lines.push(
          `💰 المجموع الكلي: ${(total + govFee).toFixed(2)} ${currency}`,
        );
      } else {
        lines.push("🛵 *New Delivery Order*");
        lines.push(`👤 Customer: ${name}`);
        if (govName) lines.push(`📍 Area: ${govName}`);
        lines.push("");
        lines.push("📋 *Order items:*");
        for (const item of items) {
          const sizePart = item.size
            ? ` (${item.size.nameEn || item.size.nameAr})`
            : "";
          const variantPart = item.variant
            ? ` + ${item.variant.labelEn || item.variant.labelAr}`
            : "";
          lines.push(
            `• ${item.name}${sizePart}${variantPart} × ${item.quantity} = ${(item.price * item.quantity).toFixed(2)} ${currency}`,
          );
        }
        lines.push("");
        lines.push(`💵 Subtotal: ${total.toFixed(2)} ${currency}`);
        if (govFee > 0)
          lines.push(`🚚 Delivery fee: ${govFee} ${currency}`);
        lines.push(
          `💰 Grand total: ${(total + govFee).toFixed(2)} ${currency}`,
        );
      }

      return lines.join("\n");
    },
    [currentGovernorate, isArabic, menuInfo?.currency],
  );

  const sendWhatsAppNotification = useCallback(
    (name: string, items: typeof cartItemsForOrder, total: number) => {
      const phone = delivery?.deliveryPhone ?? delivery?.phoneNumber ?? "";
      if (!phone) return;
      const cleanPhone = phone.replace(/[^0-9]/g, "");
      const message = buildWhatsAppMessage(name, items, total);
      const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank", "noopener,noreferrer");
    },
    [buildWhatsAppMessage, delivery?.deliveryPhone, delivery?.phoneNumber],
  );

  const confirmOrder = async () => {
    if (!customerName.trim()) {
      toast.warning(labels.enterName);
      return;
    }
    if (!menuInfo?.id || (!tableNumber && !isDeliveryOrder)) {
      toast.warning(labels.orderFailed);
      return;
    }

    if (!cartItemsForOrder.length) {
      toast.warning(labels.noValidItems);
      return;
    }

    setIsConfirming(true);
    try {
      const payload: StaffCallPayload = {
        menuId: menuInfo.id,
        tableNumber: tableNumber || (isDeliveryOrder ? "delivery" : ""),
        customerName: customerName.trim(),
        ...(isDeliveryOrder && governorateId ? { governorateId } : {}),
        items: cartItemsForOrder.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity,
          price: item.price,
          size: item.size ?? null,
          variant: item.variant ?? null,
        })),
      };

      const [response] = await Promise.all([
        axiosPost<StaffCallPayload, unknown>(
          "/public/staff-call",
          locale,
          payload,
          false,
          true,
        ),
        ...(isDeliveryOrder
          ? [
              Promise.resolve(
                sendWhatsAppNotification(
                  customerName.trim(),
                  cartItemsForOrder,
                  totalPrice,
                ),
              ),
            ]
          : []),
      ]);

      if (!response.status) {
        throw new Error("Failed to confirm order");
      }

      writeSkyCartToCookie({});
      setCart({});
      notifySkyCartUpdated();
      setCustomerName("");
      closeDrawer();
      toast.success(labels.success);
    } catch {
      toast.error(labels.orderFailed);
    } finally {
      setIsConfirming(false);
    }
  };

  if (!isMenuActive || !menuInfo?.id) return null;
  if (!tableCartAllowed) return null;
  /** After mount: searchParams and locale match the browser; avoids hydration mismatch. */
  if (!hasMounted || !isOrderingEnabled) return null;

  const cartAnchorClass = isArabic
    ? "bottom-6 left-5"
    : "bottom-[calc(6.75rem+env(safe-area-inset-bottom,0px))] right-5 sm:bottom-28";

  return createPortal(
    <div
      className={`fixed z-99990 flex flex-col items-center gap-1 ${cartAnchorClass}`}
      style={{ "--bg-main": accentMain } as CSSProperties}
    >
      <button
        type="button"
        onClick={openDrawer}
        title={labels.openCart}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-(--bg-main) text-white shadow-lg transition hover:opacity-90"
        aria-label={labels.cart}
      >
        <IoCartOutline className="h-6 w-6" />
      </button>
      <span className="max-w-40 truncate rounded-full border border-(--bg-main)/20 bg-white/95 px-3 py-1 text-center text-base font-medium text-(--bg-main) shadow-base">
        {labels.cart}: {totalQuantity}
      </span>

      {isDrawerVisible ? (
        <>
          <div
            className={`fixed h-dvh inset-0 z-99990 bg-black/40 transition-opacity duration-300 ${
              open ? "opacity-100" : "opacity-0"
            }`}
            onClick={closeDrawer}
            aria-hidden
          />
          <aside
            className={`fixed top-0 z-99991 h-full w-full max-w-md bg-white shadow-2xl transition-transform duration-300 ${
              open
                ? "translate-x-0"
                : isArabic
                  ? "-translate-x-full"
                  : "translate-x-full"
            } ${isArabic ? "left-0" : "right-0"}`}
            dir={isArabic ? "rtl" : "ltr"}
            role="dialog"
            aria-modal="true"
            aria-label={labels.cart}
          >
            <div className="flex h-full flex-col">
              <div className="border-b border-(--bg-main)/15 bg-(--bg-main)/5 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-(--bg-main)">
                      {labels.cart}
                    </h2>
                    <p className="text-base text-(--bg-main)/70">
                      {step === 1 ? labels.step1 : labels.step2}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeDrawer}
                    aria-label={labels.close}
                    className="rounded-md p-2 text-(--bg-main) transition hover:bg-(--bg-main)/10"
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {step === 1 ? (
                <div className="flex flex-1 flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto px-4 py-3">
                    <h3 className="mb-2 text-base font-semibold text-(--bg-main)">
                      {labels.products}
                    </h3>
                    {cartItemsForOrder.length ? (
                      <ul className="space-y-2">
                        {cartItemsForOrder.map((item) => (
                          <li
                            key={item.lineKey}
                            className="rounded-xl border border-(--bg-main)/15 bg-(--bg-main)/2 p-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <LoadImage
                                  src={item.image}
                                  alt={item.name}
                                  className="h-12 w-12 rounded-lg object-cover border border-(--bg-main)/15 bg-white"
                                  width={48}
                                  height={48}
                                />
                                <div>
                                  <p className="line-clamp-1 text-base font-semibold text-zinc-900">
                                    {item.name}
                                  </p>
                                  {item.size || item.variant ? (
                                    <p className="mt-0.5 text-sm text-zinc-500">
                                      {[
                                        item.size
                                          ? isArabic
                                            ? item.size.nameAr || item.size.nameEn
                                            : item.size.nameEn || item.size.nameAr
                                          : null,
                                        item.variant
                                          ? isArabic
                                            ? item.variant.labelAr ||
                                              item.variant.labelEn
                                            : item.variant.labelEn ||
                                              item.variant.labelAr
                                          : null,
                                      ]
                                        .filter(Boolean)
                                        .join(" · ")}
                                    </p>
                                  ) : null}
                                  <p className="mt-1 text-base text-zinc-600">
                                    {item.price.toFixed(2)} {getCurrency()}
                                  </p>
                                </div>
                              </div>
                              <div className="rounded-lg bg-white p-1 shadow-base">
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateItemQuantity(item.lineKey, -1)
                                    }
                                    className="h-7 w-7 rounded-md border border-(--bg-main)/20 text-(--bg-main) transition hover:bg-(--bg-main)/10"
                                    aria-label={labels.decrease}
                                  >
                                    -
                                  </button>
                                  <span className="min-w-6 text-center text-base font-semibold text-(--bg-main)">
                                    {item.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateItemQuantity(item.lineKey, 1)
                                    }
                                    className="h-7 w-7 rounded-md border border-(--bg-main)/20 text-(--bg-main) transition hover:bg-(--bg-main)/10"
                                    aria-label={labels.increase}
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </div>
                            <p className="mt-2 text-base font-medium text-zinc-700">
                              {(item.quantity * item.price).toFixed(2)}{" "}
                              {getCurrency()}
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="rounded-lg border border-dashed border-zinc-300 p-4 text-center text-base text-zinc-500">
                        {labels.empty}
                      </p>
                    )}
                  </div>
                  <div className="border-t border-(--bg-main)/15 bg-white px-4 py-3">
                    <div className="mb-3 flex items-center justify-between text-base">
                      <span className="font-medium text-zinc-600">
                        {labels.total}
                      </span>
                      <strong className="text-base text-(--bg-main)">
                        {totalPrice.toFixed(2)} {getCurrency()}
                      </strong>
                    </div>
                    <button
                      type="button"
                      onClick={goToStep2}
                      disabled={!cartItemsForOrder.length}
                      className="w-full rounded-lg bg-(--bg-main) px-4 py-2.5 text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-zinc-400"
                    >
                      {labels.next}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-1 flex-col justify-between px-4 py-3">
                  <div className="space-y-4">
                    {isDeliveryOrder && (
                      <div className="overflow-hidden rounded-2xl border border-(--bg-main)/15 shadow-sm">
                        {/* Header */}
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
                        </div>

                        {!showGovSearch && currentGovernorate ? (
                          <div className="bg-white px-3 py-3 space-y-2.5">
                            {/* Current zone */}
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-base font-bold text-zinc-900">
                                  {currentGovernorate
                                    ? isArabic
                                      ? currentGovernorate.nameAr
                                      : currentGovernorate.nameEn
                                    : "—"}
                                </p>
                                {currentGovernorate && (
                                  <p className="text-sm text-zinc-400">
                                    🚚 {labels.deliveryFee}:{" "}
                                    <span className="font-semibold text-zinc-600">
                                      {currentGovernorate.price}{" "}
                                      {menuInfo?.currency ?? ""}
                                    </span>
                                  </p>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => setShowGovSearch(true)}
                                className="shrink-0 flex items-center gap-1.5 rounded-full border border-(--bg-main)/30 bg-(--bg-main)/6 px-3 py-1 text-sm font-semibold text-(--bg-main) transition hover:bg-(--bg-main)/15 active:scale-95"
                              >
                                <FiMapPin className="h-3.5 w-3.5" />
                                {labels.changeArea}
                              </button>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-zinc-100" />

                            {/* Detect location */}
                            <button
                              type="button"
                              onClick={detectLocation}
                              disabled={isDetectingLocation}
                              className="flex w-full items-center justify-center gap-2 rounded-xl border border-(--bg-main)/25 bg-(--bg-main)/5 py-2 text-sm font-medium text-(--bg-main) transition hover:bg-(--bg-main)/12 active:scale-[0.98] disabled:opacity-50"
                            >
                              {isDetectingLocation ? (
                                <>
                                  <span className="h-4 w-4 rounded-full border-2 border-t-transparent border-(--bg-main) animate-spin" />
                                  {isArabic ? "جاري التحديد..." : "Detecting..."}
                                </>
                              ) : (
                                <>
                                  <MdMyLocation className="h-4 w-4" />
                                  {labels.detectLocation}
                                </>
                              )}
                            </button>
                          </div>
                        ) : (
                          <div className="bg-white">
                            {/* Search bar */}
                            <div className="flex items-center gap-2 border-b border-zinc-100 px-3 py-2.5">
                              <FiSearch className="h-4 w-4 shrink-0 text-(--bg-main)/60" />
                              <input
                                type="text"
                                autoFocus
                                value={govSearchText}
                                onChange={(e) =>
                                  setGovSearchText(e.target.value)
                                }
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

                            {/* List */}
                            <ul className="max-h-48 overflow-y-auto">
                              {filteredGovernorates.length ? (
                                filteredGovernorates.map((gov) => {
                                  const isSelected = gov.id === governorateId;
                                  return (
                                    <li key={gov.id}>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          changeGovernorate(gov.id)
                                        }
                                        className={`flex w-full items-center justify-between gap-3 px-3 py-3 text-start transition hover:bg-(--bg-main)/6 ${
                                          isSelected
                                            ? "bg-(--bg-main)/8"
                                            : ""
                                        }`}
                                      >
                                        <span className="flex items-center gap-2 min-w-0">
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
                                            {isArabic
                                              ? gov.nameAr
                                              : gov.nameEn}
                                          </span>
                                        </span>
                                        <span
                                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-sm font-semibold ${
                                            isSelected
                                              ? "bg-(--bg-main)/15 text-(--bg-main)"
                                              : "bg-zinc-100 text-zinc-500"
                                          }`}
                                        >
                                          {gov.price} {menuInfo?.currency ?? ""}
                                        </span>
                                      </button>
                                    </li>
                                  );
                                })
                              ) : (
                                <li className="px-3 py-5 text-center text-sm text-zinc-400">
                                  {isArabic ? "لا توجد نتائج" : "No results"}
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <label
                        htmlFor="customer-name"
                        className="mb-2 block text-base font-semibold text-(--bg-main)"
                      >
                        {labels.name}
                      </label>
                      <input
                        id="customer-name"
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder={labels.namePlaceholder}
                        className="w-full rounded-lg border border-(--bg-main)/30 px-3 py-2 text-base outline-none ring-(--bg-main)/30 focus:ring-2"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 border-t border-(--bg-main)/15 pt-3">
                    <button
                      type="button"
                      onClick={confirmOrder}
                      disabled={isConfirming}
                      className="w-full rounded-lg bg-(--bg-main) px-4 py-2.5 text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-zinc-400"
                    >
                      {isConfirming ? "..." : labels.confirm}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full rounded-lg border border-(--bg-main)/20 px-4 py-2.5 text-base font-medium text-(--bg-main) transition hover:bg-(--bg-main)/10"
                    >
                      {labels.back}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </>
      ) : null}
    </div>,
    document.body,
  );
}
