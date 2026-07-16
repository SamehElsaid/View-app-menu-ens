"use client";

import "react-phone-number-input/style.css";
import type { CSSProperties, ElementType } from "react";
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
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { arabCurrencies, Currency } from "@/constants/currencies";
import { axiosPost } from "@/shared/axiosCall";
import { FiX, FiSearch, FiMapPin } from "react-icons/fi";
import {
  IoCartOutline,
  IoBagOutline,
  IoBasketOutline,
  IoCafeOutline,
} from "react-icons/io5";
import { MdLocationOn, MdMyLocation } from "react-icons/md";
import type { DeliveryGovernorate } from "@/types/menu";
import LoadImage from "@/components/ImageLoad";
import SkyCartLineItem from "@/components/Global/SkyCartLineItem";
import {
  notifySkyCartUpdated,
  readSkyCartFromCookie,
  updateSkyCartLineQuantity,
  writeSkyCartToCookie,
  type SkyCart,
  type SkyCartItem,
} from "@/lib/skyTemplateCart";
import { useIsOrderingEnabled } from "@/hooks/useIsOrderingEnabled";
import { useTableCartAllowed } from "@/hooks/useTableCartAllowed";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import arLabels from "react-phone-number-input/locale/ar";
import enLabels from "react-phone-number-input/locale/en";
import { fetchBranchDeliveryQuote } from "@/lib/fetchDeliveryQuote";
import { resolveDeliveryLocation } from "@/lib/resolveDeliveryLocation";
import {
  resolveDeliveryAreaLabelSync,
  resolveDeliveryAreaNames,
  isGenericDeliveryAreaLabel,
} from "@/lib/deliveryAreaName";
import {
  SET_DELIVERY_DISTANCE,
  SET_DELIVERY_GOVERNORATE,
} from "@/store/authMenu/authMenu";
import { applyMenuOrderCharges } from "@/lib/menuOrderCharges";
import {
  getMenuFabSideClass,
  getMenuMobileTabCartColumnClasses,
  getMenuMobileTabCartIconClasses,
  getMenuMobileTabCartLabelClasses,
  MENU_CART_FAB_BOTTOM_CLASS,
} from "@/lib/menuFabLayout";

const DEFAULT_ACCENT = "hsl(271, 81%, 56%)";
const DEFAULT_CART_SHAPE = "rounded-full";
const DEFAULT_CART_ICON: CartIconKey = "cart";

type CartIconKey = "cart" | "bag" | "basket" | "cafe";

const CART_ICON_MAP: Record<CartIconKey, ElementType> = {
  cart: IoCartOutline,
  bag: IoBagOutline,
  basket: IoBasketOutline,
  cafe: IoCafeOutline,
};

type StaffCallPayload = {
  menuId: number;
  type: "table" | "delivery";
  tableNumber: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  orderNotes?: string;
  governorateId?: number | null;
  branchId?: number;
  customerLat?: number;
  customerLng?: number;
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

function resolveDeliveryWhatsAppPhone(
  delivery: { deliveryPhone?: string | null } | null,
): string {
  if (!delivery) return "";
  return String(delivery.deliveryPhone ?? "")
    .trim()
    .replace(/[^0-9]/g, "");
}

function shouldSendDeliveryWhatsApp(
  delivery: { deliveryWhatsAppOn?: boolean } | null,
): boolean {
  return delivery?.deliveryWhatsAppOn !== false;
}

function buildWhatsAppOrderUrl(
  cleanPhone: string,
  message: string,
): string {
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

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

type RequestStaffButtonProps = {
  /** `inline` = render FAB column only (used by MenuCornerFabs flex row). */
  variant?: "fixed" | "inline";
};

export default function RequestStaffButton({
  variant = "fixed",
}: RequestStaffButtonProps = {}) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const menuInfo = useAppSelector((s) => s.menu.menuInfo);
  const menuCustomizations = useAppSelector((s) => s.menu.menuCustomizations);
  const storeMenu = useAppSelector((s) => s.menu.menu);
  const isMenuActive = menuInfo?.isActive !== false;
  const isArabic = locale === "ar";
  const tableCartAllowed = useTableCartAllowed();
  const { isOrderingEnabled, isDeliveryOrder, isDistanceDelivery, tableNumber, governorateId, deliveryBranchId, deliveryLat, deliveryLng } =
    useIsOrderingEnabled();
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  /** Empty initial state avoids SSR/client mismatch (cookies only exist on client). */
  const [cart, setCart] = useState<SkyCart>({});
  const [isConfirming, setIsConfirming] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const accentMain = useMemo(() => {
    const custom = menuCustomizations?.primaryColor?.trim();
    if (custom) return custom;
    return DEFAULT_ACCENT;
  }, [menuCustomizations?.primaryColor]);
  const CartIcon = CART_ICON_MAP[DEFAULT_CART_ICON];

  const delivery = useAppSelector((s) => s.menu.delivery);
  const deliveryContext = useAppSelector((s) => s.menu.deliveryContext);
  const branches = useAppSelector((s) => s.menu.branches);
  const [showGovSearch, setShowGovSearch] = useState(false);
  const [govSearchText, setGovSearchText] = useState("");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [distanceDeliveryFee, setDistanceDeliveryFee] = useState<number | null>(
    null,
  );
  const [distanceDeliveryKm, setDistanceDeliveryKm] = useState<number | null>(
    null,
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
    )
      return null;
    return delivery.governorates.find((g) => g.id === governorateId) ?? null;
  }, [
    isDeliveryOrder,
    isDistanceDelivery,
    governorateId,
    delivery?.governorates,
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
      setFieldErrors((p) => ({ ...p, govArea: "" }));
    },
    [dispatch],
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
      setFieldErrors((p) => ({ ...p, govArea: "" }));
    },
    [dispatch],
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

        toast.warning(
          isArabic
            ? "موقعك خارج نطاق التوصيل"
            : "Location outside delivery range",
        );
        setIsDetectingLocation(false);
      },
      () => {
        setIsDetectingLocation(false);
        toast.error(
          isArabic
            ? "يرجى السماح بالوصول للموقع في المتصفح"
            : "Please allow location access in your browser",
        );
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }, [
    applyDistanceDelivery,
    branches,
    changeGovernorate,
    delivery?.deliveryMode,
    delivery?.governorates,
    isArabic,
    locale,
    menuInfo?.name,
    menuInfo?.slug,
    pathname,
    searchParams,
  ]);

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
            phone: "رقم الهاتف",
            phonePlaceholder: "01xxxxxxxxx",
            address: "تفاصيل العنوان",
            addressPlaceholder: "الشارع، المبنى، الدور، علامة مميزة…",
            notes: "ملاحظات",
            notesPlaceholder: "ملاحظات إضافية",
            confirm: "تأكيد الطلب",
            success: "تم تأكيد الطلب بنجاح",
            whatsAppPopupBlocked:
              "تم حفظ الطلب. اسمح بالنوافذ المنبثقة أو افتح واتساب يدوياً لإرسال الطلب.",
            enterName: "يرجى إدخال الاسم",
            enterPhone: "يرجى إدخال رقم الهاتف",
            enterAddress: "يرجى إدخال تفاصيل العنوان",
            enterNotes: "يرجى إدخال الملاحظات",
            enterDeliveryArea: "يرجى اختيار منطقة التوصيل",
            invalidPhone: "رقم الهاتف غير صالح",
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
            tax: "الضريبة",
            service: "الخدمة",
            subtotal: "المجموع الفرعي",
            grandTotal: "المجموع الكلي",
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
            phone: "Phone number",
            phonePlaceholder: "01xxxxxxxxx",
            address: "Address details",
            addressPlaceholder: "Street, building, floor, landmark…",
            notes: "Notes",
            notesPlaceholder: "Additional notes",
            confirm: "Confirm order",
            success: "Order confirmed successfully",
            whatsAppPopupBlocked:
              "Order saved. Allow pop-ups or open WhatsApp manually to send the order.",
            enterName: "Please enter your name",
            enterPhone: "Please enter your phone number",
            enterAddress: "Please enter address details",
            enterNotes: "Please enter notes",
            enterDeliveryArea: "Please select a delivery area",
            invalidPhone: "Invalid phone number",
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
            tax: "Tax",
            service: "Service",
            subtotal: "Subtotal",
            grandTotal: "Grand total",
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

  useEffect(() => {
    if (!hasMounted || !accentMain) return;
    document.documentElement.style.setProperty("--bg-main", accentMain);
    return () => {
      document.documentElement.style.removeProperty("--bg-main");
    };
  }, [accentMain, hasMounted]);

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

  const deliveryFeeAmount = useMemo(() => {
    if (!isDeliveryOrder) return 0;
    if (isDistanceDelivery) return distanceDeliveryFee ?? 0;
    return currentGovernorate?.price ?? 0;
  }, [
    currentGovernorate?.price,
    distanceDeliveryFee,
    isDeliveryOrder,
    isDistanceDelivery,
  ]);

  const orderCharges = useMemo(
    () => applyMenuOrderCharges(totalPrice, menuInfo, deliveryFeeAmount),
    [deliveryFeeAmount, menuInfo, totalPrice],
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

  useEffect(() => {
    if (
      !isDistanceDelivery ||
      deliveryLat == null ||
      deliveryLng == null ||
      deliveryBranchId == null
    ) {
      return;
    }
    const storedLabel =
      deliveryContext.distance?.areaNameAr?.trim() ||
      deliveryContext.distance?.areaNameEn?.trim() ||
      "";
    if (storedLabel && !isGenericDeliveryAreaLabel(storedLabel)) {
      return;
    }

    let cancelled = false;
    void resolveDeliveryAreaNames(
      deliveryLat,
      deliveryLng,
      delivery?.governorates ?? [],
    ).then((areaNames) => {
      if (cancelled || (!areaNames.nameAr && !areaNames.nameEn)) return;
      dispatch(
        SET_DELIVERY_DISTANCE({
          branchId: deliveryBranchId,
          lat: deliveryLat,
          lng: deliveryLng,
          areaNameAr: areaNames.nameAr,
          areaNameEn: areaNames.nameEn,
        }),
      );
    });

    return () => {
      cancelled = true;
    };
  }, [
    delivery?.governorates,
    deliveryBranchId,
    deliveryContext.distance?.areaNameAr,
    deliveryContext.distance?.areaNameEn,
    deliveryLat,
    deliveryLng,
    dispatch,
    isDistanceDelivery,
  ]);

  const buildWhatsAppMessage = useCallback(
    (
      name: string,
      phone: string,
      address: string,
      notes: string,
      items: typeof cartItemsForOrder,
      total: number,
    ): string => {
      const currency = menuInfo?.currency ?? "";
      const deliveryFee = isDistanceDelivery
        ? (distanceDeliveryFee ?? 0)
        : (currentGovernorate?.price ?? 0);
      const charges = applyMenuOrderCharges(total, menuInfo, deliveryFee);
      const areaName = deliveryAreaLabel;

      const lines: string[] = [];

      if (isArabic) {
        lines.push("🛵 *طلب توصيل جديد*");
        lines.push("─────────────────");
        lines.push(`👤 *الاسم:* ${name}`);
        if (phone) lines.push(`📞 *التليفون:* ${phone}`);
        if (areaName) lines.push(`📍 *المنطقة:* ${areaName}`);
        if (address) lines.push(`🏠 *تفاصيل العنوان:* ${address}`);
        if (notes) lines.push(`📝 *ملاحظات:* ${notes}`);
        lines.push("─────────────────");
        lines.push("📋 *الطلبات:*");
        for (const item of items) {
          const sizePart = item.size
            ? ` (${item.size.nameAr || item.size.nameEn})`
            : "";
          const variantPart = item.variant
            ? ` + ${item.variant.labelAr || item.variant.labelEn}`
            : "";
          const displayName = item.nameAr || item.name;
          lines.push(
            `• ${displayName}${sizePart}${variantPart} × ${item.quantity} = ${(item.price * item.quantity).toFixed(2)} ${currency}`,
          );
        }
        lines.push("─────────────────");
        lines.push(
          `💵 *المجموع الفرعي:* ${charges.subtotal.toFixed(2)} ${currency}`,
        );
        if (charges.taxAmount > 0)
          lines.push(`🧾 *الضريبة:* ${charges.taxAmount.toFixed(2)} ${currency}`);
        if (charges.serviceAmount > 0)
          lines.push(
            `🛎️ *الخدمة:* ${charges.serviceAmount.toFixed(2)} ${currency}`,
          );
        if (deliveryFee > 0)
          lines.push(
            `🚚 *رسوم التوصيل:* ${Number(deliveryFee).toFixed(2)} ${currency}`,
          );
        lines.push(
          `💰 *المجموع الكلي:* ${charges.grandTotal.toFixed(2)} ${currency}`,
        );
      } else {
        lines.push("🛵 *New Delivery Order*");
        lines.push("─────────────────");
        lines.push(`👤 *Name:* ${name}`);
        if (phone) lines.push(`📞 *Phone:* ${phone}`);
        if (areaName) lines.push(`📍 *Area:* ${areaName}`);
        if (address) lines.push(`🏠 *Address:* ${address}`);
        if (notes) lines.push(`📝 *Notes:* ${notes}`);
        lines.push("─────────────────");
        lines.push("📋 *Order items:*");
        for (const item of items) {
          const sizePart = item.size
            ? ` (${item.size.nameEn || item.size.nameAr})`
            : "";
          const variantPart = item.variant
            ? ` + ${item.variant.labelEn || item.variant.labelAr}`
            : "";
          const displayName = item.nameEn || item.name;
          lines.push(
            `• ${displayName}${sizePart}${variantPart} × ${item.quantity} = ${(item.price * item.quantity).toFixed(2)} ${currency}`,
          );
        }
        lines.push("─────────────────");
        lines.push(`💵 *Subtotal:* ${charges.subtotal.toFixed(2)} ${currency}`);
        if (charges.taxAmount > 0)
          lines.push(`🧾 *Tax:* ${charges.taxAmount.toFixed(2)} ${currency}`);
        if (charges.serviceAmount > 0)
          lines.push(
            `🛎️ *Service:* ${charges.serviceAmount.toFixed(2)} ${currency}`,
          );
        if (deliveryFee > 0)
          lines.push(
            `🚚 *Delivery fee:* ${Number(deliveryFee).toFixed(2)} ${currency}`,
          );
        lines.push(
          `💰 *Grand total:* ${charges.grandTotal.toFixed(2)} ${currency}`,
        );
      }

      return lines.join("\n");
    },
    [
      currentGovernorate,
      deliveryAreaLabel,
      distanceDeliveryFee,
      isArabic,
      isDistanceDelivery,
      menuInfo,
    ],
  );

  const sendWhatsAppNotification = useCallback(
    (
      name: string,
      phone: string,
      address: string,
      notes: string,
      items: typeof cartItemsForOrder,
      total: number,
    ): boolean => {
      if (!shouldSendDeliveryWhatsApp(delivery)) return false;
      const cleanPhone = resolveDeliveryWhatsAppPhone(delivery);
      if (!cleanPhone) return false;
      const message = buildWhatsAppMessage(
        name,
        phone,
        address,
        notes,
        items,
        total,
      );
      const url = buildWhatsAppOrderUrl(cleanPhone, message);
      return Boolean(window.open(url, "_blank"));
    },
    [buildWhatsAppMessage, delivery],
  );

  const confirmOrder = async () => {
    const errors: Record<string, string> = {};

    if (!customerName.trim()) {
      errors.name = labels.enterName;
    }
    if (isDeliveryOrder) {
      if (!customerPhone.trim()) {
        errors.phone = labels.enterPhone;
      } else if (!isValidPhoneNumber(customerPhone)) {
        errors.phone = labels.invalidPhone;
      }
      if (!isDistanceDelivery && !currentGovernorate) {
        errors.govArea = labels.enterDeliveryArea;
      }
      if (isDistanceDelivery && distanceDeliveryFee == null) {
        errors.govArea = labels.enterDeliveryArea;
      }
      if (!customerAddress.trim()) {
        errors.address = labels.enterAddress;
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    if (!menuInfo?.id || (!tableNumber && !isDeliveryOrder)) {
      toast.warning(labels.orderFailed);
      return;
    }

    if (!cartItemsForOrder.length) {
      toast.warning(labels.noValidItems);
      return;
    }

    const orderItems = cartItemsForOrder;
    const orderTotal = totalPrice;
    const orderName = customerName.trim();
    const orderPhone = customerPhone.trim();
    const orderAddress = customerAddress.trim();
    const orderNotesText = orderNotes.trim();
    const notifyWhatsApp =
      isDeliveryOrder &&
      shouldSendDeliveryWhatsApp(delivery) &&
      resolveDeliveryWhatsAppPhone(delivery) !== "";
    /** Open WhatsApp in the same click handler so pop-up blockers allow it. */
    const whatsAppOpened =
      notifyWhatsApp &&
      sendWhatsAppNotification(
        orderName,
        orderPhone,
        orderAddress,
        orderNotesText,
        orderItems,
        orderTotal,
      );

    setIsConfirming(true);
    try {
      const payload: StaffCallPayload = {
        menuId: menuInfo.id,
        type: isDeliveryOrder ? "delivery" : "table",
        tableNumber: isDeliveryOrder ? "" : tableNumber,
        customerName: customerName.trim(),
        ...(isDeliveryOrder
          ? {
              customerPhone: customerPhone.trim(),
              customerAddress: customerAddress.trim(),
            }
          : customerPhone.trim()
            ? { customerPhone: customerPhone.trim() }
            : {}),
        ...(orderNotes.trim() ? { orderNotes: orderNotes.trim() } : {}),
        ...(isDeliveryOrder && governorateId && !isDistanceDelivery
          ? { governorateId }
          : {}),
        ...(isDeliveryOrder &&
        isDistanceDelivery &&
        deliveryBranchId != null &&
        deliveryLat != null &&
        deliveryLng != null
          ? {
              branchId: deliveryBranchId,
              customerLat: deliveryLat,
              customerLng: deliveryLng,
            }
          : {}),
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
      ]);

      if (!response.status) {
        const errBody = response.data as {
          error?: string;
          message?: string;
          errorAr?: string;
          errorEn?: string;
        };
        const apiMsg = isArabic
          ? errBody?.errorAr || errBody?.message
          : errBody?.errorEn || errBody?.message;
        if (errBody?.error === "INVALID_TABLE") {
          toast.error(
            isArabic
              ? "تعذر إتمام طلب التوصيل. تأكد من تفعيل التوصيل في لوحة التحكم."
              : "Could not complete delivery order. Ensure delivery is enabled in the dashboard.",
          );
        } else if (errBody?.error === "DELIVERY_DISABLED") {
          toast.error(
            isArabic
              ? "خدمة التوصيل غير مفعّلة حالياً لهذا المطعم."
              : "Delivery is not enabled for this restaurant.",
          );
        } else if (errBody?.error === "INVALID_GOVERNORATE") {
          toast.error(
            isArabic
              ? "منطقة التوصيل المختارة غير متاحة."
              : "The selected delivery zone is not available.",
          );
        } else if (errBody?.error === "INVALID_ADDRESS") {
          toast.error(
            isArabic
              ? "يرجى إدخال عنوان التوصيل"
              : "Please enter a delivery address",
          );
        } else if (errBody?.error === "INVALID_PHONE") {
          toast.error(
            isArabic ? "رقم الهاتف غير صالح" : "Invalid phone number",
          );
        } else if (apiMsg) {
          toast.error(apiMsg);
        }
        throw new Error(errBody?.error || "Failed to confirm order");
      }

      writeSkyCartToCookie({});
      setCart({});
      notifySkyCartUpdated();

      if (notifyWhatsApp && !whatsAppOpened) {
        toast.info(labels.whatsAppPopupBlocked);
      }

      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setOrderNotes("");
      closeDrawer();
      toast.success(labels.success);
    } catch {
      toast.error(labels.orderFailed);
    } finally {
      setIsConfirming(false);
    }
  };

  if (!isMenuActive || !menuInfo?.id) return null;
  if (!tableCartAllowed && !isDeliveryOrder) return null;
  /** After mount: searchParams and locale match the browser; avoids hydration mismatch. */
  if (!hasMounted || !isOrderingEnabled) return null;

  const cartAnchorClass = `${MENU_CART_FAB_BOTTOM_CLASS} ${getMenuFabSideClass(isArabic)}`;
  /** Theme chrome only when seated in the shared phone dock. */
  const phoneTabTheme = variant === "inline" ? menuInfo.theme : null;

  const fabColumn = (
    <div
      className={[
        "flex flex-col items-center",
        // Phone: equal-width tab inside full-width bar
        "max-md:min-w-0 max-md:flex-1 max-md:justify-center max-md:gap-0.5 max-md:rounded-lg max-md:px-1 max-md:py-1.5 max-md:transition",
        getMenuMobileTabCartColumnClasses(phoneTabTheme),
        // Desktop FAB stack
        "md:gap-1",
      ].join(" ")}
      style={{ "--bg-main": accentMain } as CSSProperties}
    >
      <button
        type="button"
        onClick={openDrawer}
        title={labels.openCart}
        className={[
          "flex items-center justify-center transition",
          // Phone tab bar item
          "max-md:h-7 max-md:w-7 max-md:rounded-none max-md:bg-transparent max-md:shadow-none",
          getMenuMobileTabCartIconClasses(phoneTabTheme),
          // Desktop FAB
          `md:h-14 md:w-14 ${DEFAULT_CART_SHAPE} md:bg-(--bg-main) md:text-white md:shadow-lg md:hover:opacity-90`,
        ].join(" ")}
        aria-label={labels.cart}
      >
        <CartIcon className="h-5 w-5 md:h-6 md:w-6" />
      </button>
      <span
        className={[
          "w-full truncate px-0.5 text-center text-[10px] font-medium leading-tight sm:text-[11px]",
          getMenuMobileTabCartLabelClasses(phoneTabTheme),
          "md:max-w-40 md:rounded-full md:border md:border-(--bg-main)/20 md:bg-white/95 md:px-3 md:py-1 md:text-base md:shadow-base",
        ].join(" ")}
      >
        <span className="md:hidden">
          {labels.cart}
          {totalQuantity > 0 ? ` (${totalQuantity})` : ""}
        </span>
        <span className="hidden md:inline">
          {labels.cart}: {totalQuantity}
        </span>
      </span>
    </div>
  );

  const drawer =
    isDrawerVisible ? (
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
                          <SkyCartLineItem
                            key={item.lineKey}
                            item={item}
                            isArabic={isArabic}
                            currencyLabel={getCurrency()}
                            editable
                            onDecrease={(lineKey) =>
                              updateItemQuantity(lineKey, -1)
                            }
                            onIncrease={(lineKey) =>
                              updateItemQuantity(lineKey, 1)
                            }
                            decreaseLabel={labels.decrease}
                            increaseLabel={labels.increase}
                          />
                        ))}
                      </ul>
                    ) : (
                      <p className="rounded-lg border border-dashed border-zinc-300 p-4 text-center text-base text-zinc-500">
                        {labels.empty}
                      </p>
                    )}
                  </div>
                  <div className="border-t border-(--bg-main)/15 bg-white px-4 py-3">
                    <div className="mb-3 space-y-1.5 text-base">
                      {(orderCharges.taxAmount > 0 ||
                        orderCharges.serviceAmount > 0 ||
                        deliveryFeeAmount > 0) && (
                        <div className="flex items-center justify-between text-sm text-zinc-500">
                          <span>{labels.subtotal}</span>
                          <span>
                            {orderCharges.subtotal.toFixed(2)} {getCurrency()}
                          </span>
                        </div>
                      )}
                      {orderCharges.taxAmount > 0 && (
                        <div className="flex items-center justify-between text-sm text-zinc-500">
                          <span>{labels.tax}</span>
                          <span>
                            {orderCharges.taxAmount.toFixed(2)} {getCurrency()}
                          </span>
                        </div>
                      )}
                      {orderCharges.serviceAmount > 0 && (
                        <div className="flex items-center justify-between text-sm text-zinc-500">
                          <span>{labels.service}</span>
                          <span>
                            {orderCharges.serviceAmount.toFixed(2)}{" "}
                            {getCurrency()}
                          </span>
                        </div>
                      )}
                      {deliveryFeeAmount > 0 && (
                        <div className="flex items-center justify-between text-sm text-zinc-500">
                          <span>{labels.deliveryFee}</span>
                          <span>
                            {deliveryFeeAmount.toFixed(2)} {getCurrency()}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-zinc-600">
                          {orderCharges.taxAmount > 0 ||
                          orderCharges.serviceAmount > 0 ||
                          deliveryFeeAmount > 0
                            ? labels.grandTotal
                            : labels.total}
                        </span>
                        <strong className="text-base text-(--bg-main)">
                          {orderCharges.grandTotal.toFixed(2)} {getCurrency()}
                        </strong>
                      </div>
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
                <div className="flex flex-1 flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                    {/* 1. اسم العميل */}
                    <div>
                      <label
                        htmlFor="customer-name"
                        className="mb-2 block text-base font-semibold text-(--bg-main)"
                      >
                        {labels.name} *
                      </label>
                      <input
                        id="customer-name"
                        type="text"
                        value={customerName}
                        onChange={(e) => {
                          setCustomerName(e.target.value);
                          if (fieldErrors.name)
                            setFieldErrors((p) => ({ ...p, name: "" }));
                        }}
                        placeholder={labels.namePlaceholder}
                        className={`w-full rounded-lg border px-3 py-2 text-base outline-none focus:ring-2 transition ${
                          fieldErrors.name
                            ? "border-rose-400 ring-rose-200 focus:ring-rose-300"
                            : "border-(--bg-main)/30 ring-(--bg-main)/30 focus:ring-2"
                        }`}
                      />
                      {fieldErrors.name && (
                        <p className="mt-1.5 flex items-center gap-1 text-sm text-rose-500">
                          <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-500 text-[10px] font-bold">
                            !
                          </span>
                          {fieldErrors.name}
                        </p>
                      )}
                    </div>

                    {/* 2. رقم الهاتف */}
                    {isDeliveryOrder && (
                      <div>
                        <label
                          htmlFor="customer-phone"
                          className="mb-2 block text-base font-semibold text-(--bg-main)"
                        >
                          {labels.phone} *
                        </label>
                        <div
                          className={`w-full rounded-lg border px-3 py-2 text-base transition focus-within:ring-2 ${
                            fieldErrors.phone
                              ? "border-rose-400 focus-within:ring-rose-200"
                              : "border-(--bg-main)/30 focus-within:ring-(--bg-main)/25"
                          }`}
                        >
                          <PhoneInput
                            id="customer-phone"
                            labels={isArabic ? arLabels : enLabels}
                            defaultCountry="EG"
                            value={customerPhone}
                            onChange={(val) => {
                              setCustomerPhone(val ?? "");
                              if (fieldErrors.phone)
                                setFieldErrors((p) => ({ ...p, phone: "" }));
                            }}
                            className="phone-input-cart"
                          />
                        </div>
                        {fieldErrors.phone && (
                          <p className="mt-1.5 flex items-center gap-1 text-sm text-rose-500">
                            <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-500 text-[10px] font-bold">
                              !
                            </span>
                            {fieldErrors.phone}
                          </p>
                        )}
                      </div>
                    )}

                    {/* 3. منطقة التوصيل */}
                    {isDeliveryOrder && (
                      <div>
                        <div
                          className={`overflow-hidden rounded-2xl border shadow-sm ${fieldErrors.govArea ? "border-rose-400" : "border-(--bg-main)/15"}`}
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
                            <span className="text-rose-500 text-sm font-bold ms-0.5">
                              *
                            </span>
                          </div>

                          {!showGovSearch &&
                          ((isDistanceDelivery && distanceDeliveryFee != null) ||
                            currentGovernorate) ? (
                            <div className="bg-white px-3 py-3 space-y-2.5">
                              <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-base font-bold text-zinc-900">
                                    {isDistanceDelivery
                                      ? deliveryAreaLabel ||
                                        (isArabic
                                          ? "منطقة التوصيل"
                                          : "Delivery area")
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
                                      {menuInfo?.currency ?? ""}
                                    </span>
                                    {isDistanceDelivery &&
                                    distanceDeliveryKm != null ? (
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
                                    className="shrink-0 flex items-center gap-1.5 rounded-full border border-(--bg-main)/30 bg-(--bg-main)/6 px-3 py-1 text-sm font-semibold text-(--bg-main) transition hover:bg-(--bg-main)/15 active:scale-95"
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
                                    <span className="h-4 w-4 rounded-full border-2 border-t-transparent border-(--bg-main) animate-spin" />
                                    {isArabic
                                      ? "جاري التحديد..."
                                      : "Detecting..."}
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
                                            isSelected ? "bg-(--bg-main)/8" : ""
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
                                            {gov.price}{" "}
                                            {menuInfo?.currency ?? ""}
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
                                    <span className="h-4 w-4 rounded-full border-2 border-t-transparent border-(--bg-main) animate-spin" />
                                    {isArabic
                                      ? "جاري التحديد..."
                                      : "Detecting..."}
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
                        {fieldErrors.govArea && (
                          <p className="mt-1.5 flex items-center gap-1 text-sm text-rose-500">
                            <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-500 text-[10px] font-bold">
                              !
                            </span>
                            {fieldErrors.govArea}
                          </p>
                        )}
                      </div>
                    )}

                    {/* 4. تفاصيل العنوان */}
                    {isDeliveryOrder && (
                      <div>
                        <label
                          htmlFor="customer-address"
                          className="mb-2 block text-base font-semibold text-(--bg-main)"
                        >
                          {labels.address} *
                        </label>
                        <textarea
                          id="customer-address"
                          value={customerAddress}
                          onChange={(e) => {
                            setCustomerAddress(e.target.value);
                            if (fieldErrors.address)
                              setFieldErrors((p) => ({ ...p, address: "" }));
                          }}
                          placeholder={labels.addressPlaceholder}
                          rows={3}
                          className={`w-full resize-none rounded-lg border px-3 py-2 text-base outline-none focus:ring-2 transition ${
                            fieldErrors.address
                              ? "border-rose-400 ring-rose-200 focus:ring-rose-300"
                              : "border-(--bg-main)/30 ring-(--bg-main)/30 focus:ring-2"
                          }`}
                        />
                        {fieldErrors.address && (
                          <p className="mt-1.5 flex items-center gap-1 text-sm text-rose-500">
                            <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-500 text-[10px] font-bold">
                              !
                            </span>
                            {fieldErrors.address}
                          </p>
                        )}
                      </div>
                    )}

                    {/* 5. ملاحظات */}
                    <div>
                      <label
                        htmlFor="order-notes"
                        className="mb-2 block text-base font-semibold text-(--bg-main)"
                      >
                        {labels.notes}
                      </label>
                      <textarea
                        id="order-notes"
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        placeholder={labels.notesPlaceholder}
                        rows={3}
                        className="w-full resize-none rounded-lg border border-(--bg-main)/30 px-3 py-2 text-base outline-none ring-(--bg-main)/30 focus:ring-2"
                      />
                    </div>
                  </div>
                  <div className="shrink-0 space-y-2 border-t border-(--bg-main)/15 px-4 pt-3 pb-3 bg-white">
                    {(orderCharges.taxAmount > 0 ||
                      orderCharges.serviceAmount > 0 ||
                      deliveryFeeAmount > 0) && (
                      <div className="mb-1 space-y-1.5 text-sm text-zinc-500">
                        <div className="flex items-center justify-between">
                          <span>{labels.subtotal}</span>
                          <span>
                            {orderCharges.subtotal.toFixed(2)} {getCurrency()}
                          </span>
                        </div>
                        {orderCharges.taxAmount > 0 && (
                          <div className="flex items-center justify-between">
                            <span>{labels.tax}</span>
                            <span>
                              {orderCharges.taxAmount.toFixed(2)}{" "}
                              {getCurrency()}
                            </span>
                          </div>
                        )}
                        {orderCharges.serviceAmount > 0 && (
                          <div className="flex items-center justify-between">
                            <span>{labels.service}</span>
                            <span>
                              {orderCharges.serviceAmount.toFixed(2)}{" "}
                              {getCurrency()}
                            </span>
                          </div>
                        )}
                        {deliveryFeeAmount > 0 && (
                          <div className="flex items-center justify-between">
                            <span>{labels.deliveryFee}</span>
                            <span>
                              {deliveryFeeAmount.toFixed(2)} {getCurrency()}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-base text-zinc-700">
                          <span className="font-medium">
                            {labels.grandTotal}
                          </span>
                          <strong className="text-(--bg-main)">
                            {orderCharges.grandTotal.toFixed(2)} {getCurrency()}
                          </strong>
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={confirmOrder}
                      disabled={isConfirming}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-(--bg-main) px-4 py-2.5 text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isConfirming ? (
                        <>
                          <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          {labels.confirm}
                        </>
                      ) : (
                        labels.confirm
                      )}
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
      ) : null;

  if (variant === "inline") {
    return (
      <>
        {fabColumn}
        {drawer ? createPortal(drawer, document.body) : null}
      </>
    );
  }

  return createPortal(
    <div className={`fixed z-99990 ${cartAnchorClass}`}>{fabColumn}{drawer}</div>,
    document.body,
  );
}
