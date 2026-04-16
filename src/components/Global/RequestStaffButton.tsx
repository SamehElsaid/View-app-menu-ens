"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { toast } from "react-toastify";
import { useAppSelector } from "@/store/hooks";
import { arabCurrencies, Currency } from "@/constants/currencies";
import { axiosPost } from "@/shared/axiosCall";
import { FiX } from "react-icons/fi";
import { IoCartOutline } from "react-icons/io5";
import {
  notifySkyCartUpdated,
  readSkyCartFromCookie,
  writeSkyCartToCookie,
  type SkyCartItem,
} from "@/lib/skyTemplateCart";
import { useTableCartAllowed } from "@/hooks/useTableCartAllowed";

/** When `menuCustomizations.primaryColor` is missing, match each template’s default accent. */
const THEME_BG_MAIN_FALLBACK: Record<string, string> = {
  default: "hsl(271, 81%, 56%)",
  sky: "#2196F3",
  neon: "#14b8a6",
  coffee: "#F2B705",
  emerald: "#4c1121",
  noir: "#7c3aed",
  oceanic: "#0ea5e9",
};

type StaffCallPayload = {
  menuId: number;
  tableNumber: string;
  customerName: string;
  items: Array<{
    menuItemId: number;
    quantity: number;
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
  const tableNumber = searchParams.get("table")?.trim() || "";
  const isTableOrder = Boolean(tableNumber);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [customerName, setCustomerName] = useState("");
  /** Empty initial state avoids SSR/client mismatch (cookies only exist on client). */
  const [cart, setCart] = useState<Record<number, SkyCartItem>>({});
  const [isConfirming, setIsConfirming] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const tableCartAllowed = useTableCartAllowed();

  const themeKey = (menuInfo?.theme ?? "default").toLowerCase();
  const accentMain = useMemo(() => {
    const custom = menuCustomizations?.primaryColor?.trim();
    if (custom) return custom;
    return (
      THEME_BG_MAIN_FALLBACK[themeKey] ?? THEME_BG_MAIN_FALLBACK.default
    );
  }, [menuCustomizations?.primaryColor, themeKey]);

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
    setCart(readSkyCartFromCookie());
    const intervalId = setInterval(() => setCart(readSkyCartFromCookie()), 1500);
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

  const persistCart = (nextCart: Record<number, SkyCartItem>) => {
    writeSkyCartToCookie(nextCart);
    notifySkyCartUpdated();
  };
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

  useClosePopupWithPopstate({ setOpen: syncDrawerWithURL, mainQuery: "homeMenu" });

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
    const homeMenu = new URL(window.location.href).searchParams.get("homeMenu") === "true";
    if (homeMenu) {
      syncDrawerWithURL(true);
    }
  }, [syncDrawerWithURL]);

  const goToStep2 = () => {
    if (!cartItemsForOrder.length) return;
    setStep(2);
  };

  const updateItemQuantity = (itemId: number, delta: number) => {
    setCart((prev) => {
      const item = prev[itemId];
      if (!item) return prev;

      const nextQuantity = item.quantity + delta;
      const nextCart = { ...prev };

      if (nextQuantity <= 0) {
        delete nextCart[itemId];
      } else {
        nextCart[itemId] = {
          ...item,
          quantity: nextQuantity,
        };
      }

      persistCart(nextCart);
      return nextCart;
    });
  };

  const confirmOrder = async () => {
    if (!customerName.trim()) {
      toast.warning(labels.enterName);
      return;
    }
    if (!menuInfo?.id || !tableNumber) {
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
        tableNumber,
        customerName: customerName.trim(),
        items: cartItemsForOrder.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity,
        })),
      };

      const response = await axiosPost<StaffCallPayload, unknown>(
        "/public/staff-call",
        locale,
        payload,
        false,
        true,
      );

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
  if (!hasMounted || !isTableOrder) return null;

  return createPortal(
    <div
      className={`fixed bottom-6 z-99990 flex flex-col items-center gap-1 ${isArabic ? "left-5" : "right-5"}`}
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
      <span className="max-w-40 truncate rounded-full border border-(--bg-main)/20 bg-white/95 px-3 py-1 text-center text-xs font-medium text-(--bg-main) shadow-sm">
        {labels.cart}: {totalQuantity}
      </span>

      {isDrawerVisible ? (
        <>
          <div
            className={`fixed h-dvh inset-0 z-99990 bg-black/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"
              }`}
            onClick={closeDrawer}
            aria-hidden
          />
          <aside
            className={`fixed top-0 z-99991 h-full w-full max-w-md bg-white shadow-2xl transition-transform duration-300 ${open
                ? "translate-x-0"
                : isArabic
                  ? "-translate-x-full"
                  : "translate-x-full"
              } ${isArabic ? "left-0" : "right-0"
              }`}
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
                    <p className="text-xs text-(--bg-main)/70">
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
                    <h3 className="mb-2 text-sm font-semibold text-(--bg-main)">
                      {labels.products}
                    </h3>
                    {cartItemsForOrder.length ? (
                      <ul className="space-y-2">
                        {cartItemsForOrder.map((item) => (
                          <li
                            key={item.id}
                            className="rounded-xl border border-(--bg-main)/15 bg-(--bg-main)/2 p-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  className="h-12 w-12 rounded-lg object-cover border border-(--bg-main)/15 bg-white"
                                  width={48}
                                  height={48}
                                  loading="lazy"
                                />
                                <div>
                                  <p className="line-clamp-1 text-sm font-semibold text-zinc-900">
                                    {item.name}
                                  </p>
                                  <p className="mt-1 text-xs text-zinc-600">
                                    {item.price.toFixed(2)} {getCurrency()}
                                  </p>
                                </div>
                              </div>
                              <div className="rounded-lg bg-white p-1 shadow-sm">
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => updateItemQuantity(item.id, -1)}
                                    className="h-7 w-7 rounded-md border border-(--bg-main)/20 text-(--bg-main) transition hover:bg-(--bg-main)/10"
                                    aria-label={labels.decrease}
                                  >
                                    -
                                  </button>
                                  <span className="min-w-6 text-center text-sm font-semibold text-(--bg-main)">
                                    {item.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => updateItemQuantity(item.id, 1)}
                                    className="h-7 w-7 rounded-md border border-(--bg-main)/20 text-(--bg-main) transition hover:bg-(--bg-main)/10"
                                    aria-label={labels.increase}
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </div>
                            <p className="mt-2 text-xs font-medium text-zinc-700">
                              {(item.quantity * item.price).toFixed(2)}{" "}
                              {getCurrency()}
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="rounded-lg border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-500">
                        {labels.empty}
                      </p>
                    )}
                  </div>
                  <div className="border-t border-(--bg-main)/15 bg-white px-4 py-3">
                    <div className="mb-3 flex items-center justify-between text-sm">
                      <span className="font-medium text-zinc-600">{labels.total}</span>
                      <strong className="text-base text-(--bg-main)">
                        {totalPrice.toFixed(2)} {getCurrency()}
                      </strong>
                    </div>
                    <button
                      type="button"
                      onClick={goToStep2}
                      disabled={!cartItemsForOrder.length}
                      className="w-full rounded-lg bg-(--bg-main) px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-zinc-400"
                    >
                      {labels.next}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-1 flex-col justify-between px-4 py-3">
                  <div>
                    <label
                      htmlFor="customer-name"
                      className="mb-2 block text-sm font-semibold text-(--bg-main)"
                    >
                      {labels.name}
                    </label>
                    <input
                      id="customer-name"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={labels.namePlaceholder}
                      className="w-full rounded-lg border border-(--bg-main)/30 px-3 py-2 text-sm outline-none ring-(--bg-main)/30 focus:ring-2"
                    />
                  </div>
                  <div className="space-y-2 border-t border-(--bg-main)/15 pt-3">
                    <button
                      type="button"
                      onClick={confirmOrder}
                      disabled={isConfirming}
                      className="w-full rounded-lg bg-(--bg-main) px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-zinc-400"
                    >
                      {isConfirming ? "..." : labels.confirm}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full rounded-lg border border-(--bg-main)/20 px-4 py-2.5 text-sm font-medium text-(--bg-main) transition hover:bg-(--bg-main)/10"
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
