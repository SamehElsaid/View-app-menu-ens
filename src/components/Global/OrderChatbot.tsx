"use client";

import {
  FormEvent,
  Fragment,
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { FiCheck, FiChevronDown, FiSend, FiX } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useAppSelector } from "@/store/hooks";
import { axiosPost } from "@/shared/axiosCall";
import {
  notifySkyCartUpdated,
  readSkyCartFromCookie,
  subscribeSkyCartUpdated,
  type SkyCartItem,
  writeSkyCartToCookie,
} from "@/lib/skyTemplateCart";
import {
  applyCartActions,
  enrichAiSuggestions,
  increaseCartItemQuantity,
  removeCartItem,
  setCartItemQuantity,
  toRequestCartQuantities,
} from "@/lib/aiOrderCartApply";
import {
  findMenuItemsForRemoveIntent,
  findMenuItemsMatchingText,
  isRemoveIntent,
} from "@/lib/aiOrderRemoveIntent";
import { clearPendingSelection } from "@/lib/aiOrderPendingSelection";
import { clearPendingSuggestions } from "@/lib/aiOrderPendingSuggestions";
import {
  isIncreaseQuantityIntent,
  clearLastCartItemId,
  parseIncreaseDeltaFromMessage,
  readLastCartItemId,
  writeLastCartItemId,
} from "@/lib/aiOrderQuantity";
import {
  compactReplyWhenSuggestionsExist,
  extractSuggestionIdsFromRaw,
  normalizeAiOrderResponse,
  pickReplyText,
  resolveCartActions,
} from "@/lib/aiOrderResponse";
import {
  type ConversationState,
  isAddMoreIntent,
  isNameCaptureMessage,
  resolveLocalIntent,
  syncStateWithCart,
} from "@/lib/aiOrderConversation";
import LoadImage from "@/components/ImageLoad";
import { capSuggestionList } from "@/lib/aiOrderSuggestions";
import { useCurrencyLabel } from "@/lib/useCurrencyLabel";
import { pickRandomQuickChips, type QuickChip } from "@/lib/aiOrderQuickChips";
import { isFreeMenuPlan } from "@/lib/menuPlan";
import { useAiChatCanOrder } from "@/hooks/useAiChatCanOrder";
import {
  sendAiDiscoveryMessage,
  sendAiOrderMessage,
} from "@/lib/aiOrderWebhook";
import {
  DEFAULT_AI_ORDER_CURRENCY,
  resolveAiOrderMenuIdentity,
  type AiMenuCatalogItem,
  type AiOrderCart,
  type AiOrderRequest,
  type AiOrderSuggestion,
} from "@/types/aiOrder";
import type { MenuItem } from "@/types/menu";
import { ALLOWED_CONTACT, buildWhatsAppUrl } from "@/lib/assistantConfig";

/** TEMP: hide AI avatar FAB and link to WhatsApp support instead. */
const TEMP_WHATSAPP_FAB = false;

type UiMessage = {
  id: string;
  role: "user" | "bot";
  text: string;
  suggestions?: AiOrderSuggestion[];
};

/** Cap rendered suggestion cards only (does not alter chat/cart logic). */
function suggestionCardsForDisplay(
  suggestions: AiOrderSuggestion[] | undefined,
): AiOrderSuggestion[] {
  return capSuggestionList(suggestions ?? []);
}

export type OrderChatbotMode = "ordering" | "discovery";

type StaffCallPayload = {
  menuId: number;
  tableNumber: string;
  customerName: string;
  items: Array<{
    menuItemId: number;
    quantity: number;
  }>;
};

const NAME_STORAGE_KEY = "ensmenu_ai_order_customer_name";
const BETA_NOTICE_SESSION_KEY = "ensmenu_ai_order_beta_notice_v4";
const AI_AVATAR_SRC = "/images/AiAvatar.png";

/** Per menu + mode so free/paid menus and discovery/order do not share n8n session. */
function buildChatSessionStorageKey(
  menuId: number,
  discovery: boolean,
): string {
  const kind = discovery ? "discovery" : "order";
  return menuId > 0
    ? `ensmenu_ai_${kind}_session_${menuId}`
    : `ensmenu_ai_${kind}_session_pending`;
}

const BETA_NOTICE_AR =
  "✨ المساعد الذكي في نسخة تجريبية (Beta) حاليًا وقد يخطئ أحيانًا في فهم بعض الطلبات.";

const WELCOME_MESSAGE: UiMessage = {
  id: "welcome",
  role: "bot",
  text: "أهلاً 👋\nأنا لينا ✨ مساعدة Ensmenu\n\nأقدر أساعدك في الأسعار، المنيو الرقمي، أو تبدأ بسرعة 🍽️",
};

function hasSeenBetaNotice(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(BETA_NOTICE_SESSION_KEY) === "1";
}

function markBetaNoticeSeen(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(BETA_NOTICE_SESSION_KEY, "1");
}

function generateSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function readOrCreateSessionId(storageKey: string): string {
  if (typeof window === "undefined") return "unknown";
  const current = localStorage.getItem(storageKey);
  if (current) return current;
  const next = generateSessionId();
  localStorage.setItem(storageKey, next);
  return next;
}

function asAiOrderCart(
  raw: Record<
    number,
    { id: number; quantity: number; name: string; price: number; image: string }
  >,
): AiOrderCart {
  const out: AiOrderCart = {};
  for (const [k, v] of Object.entries(raw)) {
    out[k] = {
      id: v.id,
      quantity: v.quantity,
      name: v.name,
      price: v.price,
      image: v.image,
    };
  }
  return out;
}

export default function OrderChatbot({
  mode = "ordering",
}: {
  mode?: OrderChatbotMode;
}) {
  const localeFromIntl = useLocale();
  const searchParams = useSearchParams();
  const menuInfo = useAppSelector((s) => s.menu.menuInfo);
  const menuItems = useAppSelector((s) => s.menu.menu) ?? [];
  const currencyLabel = useCurrencyLabel();
  const canOrderViaChat = useAiChatCanOrder();

  const isFreePlan = isFreeMenuPlan(menuInfo?.ownerPlanType);

  /** Free → LINAENSMENUFREE; paid (with or without ?table=) → ai-order webhook. */
  const useDiscoveryWebhook = isFreePlan;

  /** No Add/checkout: free menus and paid opened without ?table=. */
  const isBrowseOnly = !canOrderViaChat;

  const chatSessionStorageKey = useMemo(
    () => buildChatSessionStorageKey(menuInfo?.id ?? 0, useDiscoveryWebhook),
    [menuInfo?.id, useDiscoveryWebhook],
  );

  /** Clear ENS fixed banner (~52px) on free-plan menus. */
  const chatAnchorClass = isFreePlan
    ? "bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] sm:bottom-20"
    : "bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))]";

  const localeFromDocument =
    typeof document !== "undefined" ? document.documentElement.lang : "";
  const locale = (localeFromIntl || localeFromDocument || "ar").toLowerCase();
  const isArabic = locale.startsWith("ar");
  const direction: "rtl" | "ltr" = isArabic ? "rtl" : "ltr";

  const labels = useMemo(() => {
    if (isBrowseOnly) {
      return isArabic
        ? {
            button: "اسأل عن المنيو",
            title: "مساعد المنيو ✨",
            placeholder: "اسأل عن الأطباق أو الاقتراحات...",
            confirm: "تأكيد الطلب",
            edit: "تعديل الطلب",
            error: "حصلت مشكلة بسيطة، جرّب تاني.",
            emptyCart: "السلة فاضية حاليًا",
            online: "متصل",
            orderSummaryTitle: "ملخص الطلب",
            showOrderSummary: "عرض ملخص الطلب",
            hideOrderSummary: "إخفاء الملخص",
            orderTotal: (total: string) => `الإجمالي: ${total}`,
            askTable: "رقم الطاولة غير موجود في الرابط الحالي.",
            success:
              "✅ تم إرسال طلبك إلى المطعم بنجاح، وجاري تحضيره الآن. شكرًا لطلبك ونتمنى لك تجربة ممتعة 🌟",
            add: "إضافة",
            inlineCartTitle: "تعديل الطلب",
            removeFromCart: "حذف",
            quickConfirm: "تأكيد الطلب",
            customerNameLabel: "اسم حضرتك",
            customerNamePlaceholder: "مثال: أحمد محمد",
            sendOrder: "إرسال الطلب",
            customerNameRequired: "من فضلك اكتب اسمك قبل الإرسال",
            quickChipsAria: "اقتراحات سريعة",
            contactWhatsApp: "تواصل عبر واتساب",
          }
        : {
            button: "Ask about the menu",
            title: "Menu Assistant ✨",
            placeholder: "Ask about dishes or recommendations...",
            confirm: "Confirm order",
            edit: "Edit order",
            error: "Something went wrong. Please try again.",
            emptyCart: "Your cart is empty",
            online: "Online",
            orderSummaryTitle: "Order summary",
            showOrderSummary: "Show order summary",
            hideOrderSummary: "Hide summary",
            orderTotal: (total: string) => `Total: ${total}`,
            askTable: "Table number is missing from the current URL.",
            success:
              "✅ Your order was sent to the restaurant and is being prepared. Thank you — enjoy your meal! 🌟",
            add: "Add",
            inlineCartTitle: "Edit order",
            removeFromCart: "Remove",
            quickConfirm: "Confirm order",
            customerNameLabel: "Your name",
            customerNamePlaceholder: "e.g. John Smith",
            sendOrder: "Send order",
            customerNameRequired: "Please enter your name before sending",
            quickChipsAria: "Quick suggestions",
            contactWhatsApp: "Contact on WhatsApp",
          };
    }
    return isArabic
      ? {
          button: "اطلب بالذكاء الاصطناعي",
          title: "مساعد الطلبات الذكي ✨",
          placeholder: "اكتب طلبك هنا...",
          confirm: "تأكيد الطلب",
          edit: "تعديل الطلب",
          error: "حصلت مشكلة بسيطة، جرّب تاني.",
          emptyCart: "السلة فاضية حاليًا",
          online: "متصل",
          orderSummaryTitle: "ملخص الطلب",
          showOrderSummary: "عرض ملخص الطلب",
          hideOrderSummary: "إخفاء الملخص",
          orderTotal: (total: string) => `الإجمالي: ${total}`,
          askTable: "رقم الطاولة غير موجود في الرابط الحالي.",
          success:
            "✅ تم إرسال طلبك إلى المطعم بنجاح، وجاري تحضيره الآن. شكرًا لطلبك ونتمنى لك تجربة ممتعة 🌟",
          add: "إضافة",
          inlineCartTitle: "تعديل الطلب",
          removeFromCart: "حذف",
          quickConfirm: "تأكيد الطلب",
          customerNameLabel: "اسم حضرتك",
          customerNamePlaceholder: "مثال: أحمد محمد",
          sendOrder: "إرسال الطلب",
          customerNameRequired: "من فضلك اكتب اسمك قبل الإرسال",
          quickChipsAria: "اقتراحات سريعة",
          contactWhatsApp: "تواصل عبر واتساب",
        }
      : {
          button: "Order with AI",
          title: "Smart Order Assistant ✨",
          placeholder: "Type your order...",
          confirm: "Confirm order",
          edit: "Edit order",
          error: "Something went wrong. Please try again.",
          emptyCart: "Your cart is empty",
          online: "Online",
          orderSummaryTitle: "Order summary",
          showOrderSummary: "Show order summary",
          hideOrderSummary: "Hide summary",
          orderTotal: (total: string) => `Total: ${total}`,
          askTable: "Table number is missing from the current URL.",
          success:
            "✅ Your order was sent to the restaurant and is being prepared. Thank you — enjoy your meal! 🌟",
          add: "Add",
          inlineCartTitle: "Edit order",
          removeFromCart: "Remove",
          quickConfirm: "Confirm order",
          customerNameLabel: "Your name",
          customerNamePlaceholder: "e.g. John Smith",
          sendOrder: "Send order",
          customerNameRequired: "Please enter your name before sending",
          quickChipsAria: "Quick suggestions",
          contactWhatsApp: "Contact on WhatsApp",
        };
  }, [isArabic, isBrowseOnly]);

  const whatsappFabUrl = useMemo(
    () =>
      buildWhatsAppUrl(menuInfo?.socialWhatsapp) ?? ALLOWED_CONTACT.whatsappUrl,
    [menuInfo?.socialWhatsapp],
  );

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [sessionId, setSessionId] = useState("unknown");
  const [customerName, setCustomerName] = useState("");
  const [checkoutNameInput, setCheckoutNameInput] = useState("");
  const [conversationState, setConversationState] =
    useState<ConversationState>("browsing");
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [cartSnapshot, setCartSnapshot] = useState<AiOrderCart>(() =>
    asAiOrderCart(readSkyCartFromCookie()),
  );
  const [lastCartItemId, setLastCartItemId] = useState<number | null>(null);
  const [pendingRemovePick, setPendingRemovePick] = useState(false);
  const [showBetaCard, setShowBetaCard] = useState(false);
  const [pendingOrderSubmit, setPendingOrderSubmit] = useState(false);
  const [showInlineCartEditor, setShowInlineCartEditor] = useState(false);
  const [orderSummarySheetOpen, setOrderSummarySheetOpen] = useState(false);
  const [quickChips, setQuickChips] = useState<QuickChip[]>([]);
  const [quickChipsEpoch, setQuickChipsEpoch] = useState(0);
  const [expandedSuggestionQtyKeys, setExpandedSuggestionQtyKeys] = useState<
    Set<string>
  >(() => new Set());
  const betaShownThisOpenRef = useRef(false);
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const orderSummaryPanelRef = useRef<HTMLDivElement>(null);
  const checkoutNameInputRef = useRef<HTMLInputElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  const visibleMessages = useMemo(() => {
    if (messages.length > 0) return messages;
    return open ? [WELCOME_MESSAGE] : [];
  }, [messages, open]);

  const handleOpenChat = useCallback(() => {
    setOpen(true);
    setMessages((prev) => (prev.length === 0 ? [WELCOME_MESSAGE] : prev));
  }, []);

  const resizeChatInput = useCallback(() => {
    const el = chatInputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, []);

  useEffect(() => {
    resizeChatInput();
  }, [input, resizeChatInput]);

  const scrollMessagesToBottom = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      const el = messagesScrollRef.current;
      if (!el) return;
      el.scrollTo({ top: el.scrollHeight, behavior });
    },
    [],
  );

  useEffect(() => {
    if (!open) return;

    scrollMessagesToBottom("instant");
    const rafId = requestAnimationFrame(() => scrollMessagesToBottom("smooth"));
    const timeoutId = window.setTimeout(
      () => scrollMessagesToBottom("smooth"),
      120,
    );

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
    };
  }, [
    open,
    visibleMessages,
    isSending,
    showBetaCard,
    showInlineCartEditor,
    conversationState,
    scrollMessagesToBottom,
  ]);

  useEffect(() => {
    setShowBetaCard(!hasSeenBetaNotice());
  }, []);

  useEffect(() => {
    if (!open) {
      setExpandedSuggestionQtyKeys(new Set());
      setOrderSummarySheetOpen(false);
      setPendingOrderSubmit(false);
      setShowInlineCartEditor(false);
      if (betaShownThisOpenRef.current) {
        markBetaNoticeSeen();
        setShowBetaCard(false);
        betaShownThisOpenRef.current = false;
      }
      return;
    }
    if (showBetaCard && open) {
      betaShownThisOpenRef.current = true;
    }
  }, [open, showBetaCard]);

  useEffect(() => {
    const sid = readOrCreateSessionId(chatSessionStorageKey);
    setSessionId(sid);
    const storedName = localStorage.getItem(NAME_STORAGE_KEY) || "";
    setCustomerName(storedName);
    setLastCartItemId(readLastCartItemId());
    setMessages([]);

    if (isBrowseOnly) {
      return;
    }

    const sync = () => {
      const nextCart = asAiOrderCart(readSkyCartFromCookie());
      setCartSnapshot(nextCart);
      setConversationState((prev) =>
        syncStateWithCart(prev, Object.keys(nextCart).length > 0),
      );
    };
    sync();
    return subscribeSkyCartUpdated(sync);
  }, [chatSessionStorageKey, isBrowseOnly]);

  useEffect(() => {
    if (customerName.trim()) {
      localStorage.setItem(NAME_STORAGE_KEY, customerName.trim());
    }
  }, [customerName]);

  const aiMenuCatalog = useMemo<AiMenuCatalogItem[]>(
    () =>
      menuItems.map((item: MenuItem) => ({
        id: item.id,
        nameAr: item.nameAr ?? item.name ?? "",
        price: item.price,
      })),
    [menuItems],
  );

  const validMenuIds = useMemo(
    () => new Set(menuItems.map((item) => item.id)),
    [menuItems],
  );

  const localMenuById = useMemo(() => {
    const map = new Map<number, MenuItem>();
    for (const item of menuItems) {
      map.set(item.id, item);
    }
    return map;
  }, [menuItems]);

  const displayNameForItem = (item: MenuItem) =>
    isArabic
      ? item.nameAr || item.name || item.nameEn || ""
      : item.nameEn || item.name || item.nameAr || "";

  const menuCurrencyCode = (
    menuInfo?.currency?.trim() || DEFAULT_AI_ORDER_CURRENCY
  ).toUpperCase();

  const aiMenuIdentity = useMemo(
    () => resolveAiOrderMenuIdentity(menuInfo),
    [menuInfo],
  );

  const refreshQuickChips = useCallback(() => {
    setQuickChips(pickRandomQuickChips(menuItems, isArabic, 4));
    setQuickChipsEpoch((n) => n + 1);
  }, [menuItems, isArabic]);

  useEffect(() => {
    if (!open) return;
    refreshQuickChips();
  }, [open, menuItems, refreshQuickChips]);

  const suggestionContext = useMemo(
    () => ({
      validMenuIds,
      localMenuById,
      displayName: displayNameForItem,
      defaultCurrency: menuCurrencyCode,
    }),
    [validMenuIds, localMenuById, isArabic, menuCurrencyCode],
  );

  const cartItems = useMemo(() => Object.values(cartSnapshot), [cartSnapshot]);
  const totalPrice = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  );
  const currencyDisplay = currencyLabel(menuInfo?.currency);

  const formatPrice = (amount: number) =>
    `${amount.toFixed(2)} ${currencyDisplay}`;

  const cartNotEmpty = cartItems.length > 0;

  useEffect(() => {
    if (!cartItems.length) {
      setShowInlineCartEditor(false);
    }
  }, [cartItems.length]);

  const checkoutActive =
    conversationState === "waiting_for_confirmation" ||
    (conversationState === "waiting_for_name" && pendingOrderSubmit);

  const showOrderSummarySheet = checkoutActive && orderSummarySheetOpen;

  const showCheckoutNameStep =
    showOrderSummarySheet &&
    pendingOrderSubmit &&
    conversationState === "waiting_for_name";

  const openOrderSummarySheet = () => {
    setOrderSummarySheetOpen(true);
  };

  const dismissOrderSummarySheet = () => {
    setOrderSummarySheetOpen(false);
  };

  useEffect(() => {
    if (!showCheckoutNameStep) return;
    const t = window.setTimeout(() => {
      checkoutNameInputRef.current?.focus();
      orderSummaryPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 80);
    return () => window.clearTimeout(t);
  }, [showCheckoutNameStep]);

  const persistLastCartItemId = (itemId: number) => {
    if (!validMenuIds.has(itemId)) return;
    setLastCartItemId(itemId);
    writeLastCartItemId(itemId);
  };

  const syncCartFromCookie = () => {
    const nextCart = asAiOrderCart(readSkyCartFromCookie());
    setCartSnapshot(nextCart);
    setConversationState((prev) =>
      syncStateWithCart(prev, Object.keys(nextCart).length > 0),
    );
  };

  const applyValidatedCart = (
    candidateCart: AiOrderCart | undefined,
  ): boolean => {
    if (!candidateCart || typeof candidateCart !== "object") return false;
    const next: Record<string, SkyCartItem> = {};

    for (const [key, value] of Object.entries(candidateCart)) {
      const id = Number(value?.id ?? key);
      const quantity = Number(value?.quantity);

      if (!Number.isInteger(id) || id <= 0) continue;
      if (!validMenuIds.has(id)) continue;
      if (!Number.isFinite(quantity) || quantity <= 0) continue;

      const localItem = localMenuById.get(id);
      if (!localItem) continue;

      next[String(id)] = {
        lineKey: String(id),
        id,
        quantity: Math.floor(quantity),
        name: displayNameForItem(localItem),
        price: localItem.price,
        image: localItem.image ?? "",
      };
    }

    writeSkyCartToCookie(next);
    notifySkyCartUpdated();
    setCartSnapshot(asAiOrderCart(next));
    setConversationState(
      Object.keys(next).length > 0 ? "ordering" : "browsing",
    );
    const lastKey = Object.keys(next).map(Number).pop();
    if (lastKey) persistLastCartItemId(lastKey);
    return true;
  };

  const beginCheckoutFlow = () => {
    const tableNumber = searchParams.get("table")?.trim() || "";
    const currentCart = readSkyCartFromCookie();
    const items = Object.values(currentCart).filter((item) =>
      validMenuIds.has(item.id),
    );

    if (!items.length) {
      setErrorText(labels.emptyCart);
      setConversationState("browsing");
      return;
    }
    if (!tableNumber) {
      setErrorText(labels.askTable);
      return;
    }
    setErrorText("");
    setPendingOrderSubmit(false);
    setShowInlineCartEditor(false);
    setConversationState("waiting_for_confirmation");
    setOrderSummarySheetOpen(true);
  };

  const submitOrderToStaff = async (
    nameOverride?: string,
  ): Promise<boolean> => {
    setErrorText("");
    const tableNumber = searchParams.get("table")?.trim() || "";
    const currentCart = readSkyCartFromCookie();
    const items = Object.values(currentCart).filter((item) =>
      validMenuIds.has(item.id),
    );
    const resolvedName = (nameOverride ?? customerName).trim();

    if (!tableNumber) {
      setErrorText(labels.askTable);
      return false;
    }
    if (!menuInfo?.id || !items.length) {
      setErrorText(labels.emptyCart);
      return false;
    }
    if (!resolvedName) {
      return false;
    }

    setIsSending(true);
    try {
      const payload: StaffCallPayload = {
        menuId: menuInfo.id,
        tableNumber,
        customerName: resolvedName,
        items: items.map((item) => ({
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
      notifySkyCartUpdated();
      setCartSnapshot({});
      setConversationState("order_completed");
      setPendingOrderSubmit(false);
      setOrderSummarySheetOpen(false);
      appendMessage("bot", labels.success);
      return true;
    } catch {
      const msg = labels.error;
      setErrorText(msg);
      appendMessage("bot", msg);
      return false;
    } finally {
      setIsSending(false);
    }
  };

  const applyNameFromChat = async (name: string) => {
    const trimmed = name.trim();
    setCustomerName(trimmed);
    localStorage.setItem(NAME_STORAGE_KEY, trimmed);

    if (pendingOrderSubmit) {
      setPendingOrderSubmit(false);
      setConversationState("waiting_for_confirmation");
      await submitOrderToStaff(trimmed);
      return;
    }

    setConversationState("waiting_for_confirmation");
  };

  const appendMessage = (
    role: "user" | "bot",
    text: string,
    suggestions?: UiMessage["suggestions"],
  ) => {
    const hasSuggestions = Boolean(suggestions?.length);
    if (!text.trim() && !hasSuggestions) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}_${Math.random()}`,
        role,
        text: text.trim(),
        suggestions: hasSuggestions ? suggestions : undefined,
      },
    ]);
  };

  const handleQuickConfirm = () => {
    if (!cartNotEmpty) return;
    setShowInlineCartEditor(false);
    beginCheckoutFlow();
  };

  const applyInlineCartQuantity = (itemId: number, nextQty: number) => {
    if (nextQty <= 0) {
      removeCartItem(itemId, { validMenuIds });
    } else {
      setCartItemQuantity(itemId, nextQty, suggestionContext);
    }
    syncLastCartItemAfterCartChange();
    syncCartFromCookie();
    if (!Object.keys(readSkyCartFromCookie()).length) {
      setShowInlineCartEditor(false);
      setConversationState("browsing");
    }
    scrollMessagesToBottom("smooth");
  };

  const handleInlineCartIncrease = (itemId: number) => {
    const current = readSkyCartFromCookie()[itemId]?.quantity ?? 0;
    if (current <= 0) return;
    applyInlineCartQuantity(itemId, current + 1);
  };

  const handleInlineCartDecrease = (itemId: number) => {
    const current = readSkyCartFromCookie()[itemId]?.quantity ?? 0;
    if (current <= 0) return;
    applyInlineCartQuantity(itemId, current - 1);
  };

  const handleInlineCartRemove = (itemId: number) => {
    removeCartItem(itemId, { validMenuIds });
    syncLastCartItemAfterCartChange();
    syncCartFromCookie();
    if (!Object.keys(readSkyCartFromCookie()).length) {
      setShowInlineCartEditor(false);
      setConversationState("browsing");
    }
    scrollMessagesToBottom("smooth");
  };

  const clearN8nPendingState = () => {
    clearPendingSelection();
    clearPendingSuggestions();
  };

  const syncLastCartItemAfterCartChange = () => {
    const remaining = readSkyCartFromCookie();
    const ids = Object.keys(remaining)
      .map(Number)
      .filter((id) => validMenuIds.has(id) && remaining[id]);
    if (ids.length) {
      persistLastCartItemId(ids[ids.length - 1]!);
    } else {
      setLastCartItemId(null);
      clearLastCartItemId();
    }
  };

  const handleRemoveIntent = (trimmed: string): boolean => {
    if (!isRemoveIntent(trimmed)) return false;

    setPendingRemovePick(false);
    const matches = findMenuItemsForRemoveIntent(trimmed, menuItems);

    if (matches.length === 1) {
      const item = matches[0]!;
      const removed = removeCartItem(item.id, { validMenuIds });

      if (removed) {
        syncLastCartItemAfterCartChange();
        syncCartFromCookie();
        setConversationState(
          Object.keys(readSkyCartFromCookie()).length > 0
            ? "ordering"
            : "browsing",
        );
      }
      return true;
    }

    setPendingRemovePick(matches.length > 1);
    return false;
  };

  const getSuggestionCartQty = (itemId: number) =>
    cartSnapshot[itemId]?.quantity ??
    readSkyCartFromCookie()[itemId]?.quantity ??
    0;

  const suggestionQtyKey = (messageId: string, itemId: number) =>
    `${messageId}_${itemId}`;

  const isSuggestionQtyVisible = (messageId: string, itemId: number) =>
    expandedSuggestionQtyKeys.has(suggestionQtyKey(messageId, itemId));

  const openSuggestionQty = (messageId: string, itemId: number) => {
    const key = suggestionQtyKey(messageId, itemId);
    setExpandedSuggestionQtyKeys((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  };

  const collapseSuggestionQty = (messageId: string, itemId: number) => {
    const key = suggestionQtyKey(messageId, itemId);
    setExpandedSuggestionQtyKeys((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  const handleSuggestionCartAdjust = (
    messageId: string,
    itemId: number,
    delta: number,
  ) => {
    const menuItem = localMenuById.get(itemId);
    const current = getSuggestionCartQty(itemId);
    const nextQty = current + delta;

    if (nextQty <= 0) {
      if (current > 0) {
        removeCartItem(itemId, { validMenuIds });
        syncLastCartItemAfterCartChange();
        syncCartFromCookie();
        setConversationState(
          Object.keys(readSkyCartFromCookie()).length > 0
            ? "ordering"
            : "browsing",
        );
      }
      collapseSuggestionQty(messageId, itemId);
      return;
    }

    if (!menuItem) return;

    if (pendingRemovePick) {
      setPendingRemovePick(false);
      removeCartItem(itemId, { validMenuIds });
      syncLastCartItemAfterCartChange();
      syncCartFromCookie();
      setConversationState(
        Object.keys(readSkyCartFromCookie()).length > 0
          ? "ordering"
          : "browsing",
      );
      return;
    }

    if (current <= 0) {
      setPendingRemovePick(false);
      clearN8nPendingState();
    }

    setCartItemQuantity(itemId, nextQty, suggestionContext);
    persistLastCartItemId(itemId);
    syncCartFromCookie();
    setConversationState("ordering");
  };

  const handleEditOrder = () => {
    if (!cartNotEmpty) return;
    setPendingOrderSubmit(false);
    dismissOrderSummarySheet();
    setShowInlineCartEditor(true);
    setConversationState("ordering");
    scrollMessagesToBottom("smooth");
  };

  const handleLocalMessage = async (trimmed: string): Promise<boolean> => {
    if (isBrowseOnly) return false;

    const cart = readSkyCartFromCookie();
    const cartNotEmpty = Object.values(cart).some((item) =>
      validMenuIds.has(item.id),
    );

    if (conversationState === "order_completed") {
      setConversationState(cartNotEmpty ? "ordering" : "browsing");
    }

    if (conversationState === "waiting_for_name") {
      if (isAddMoreIntent(trimmed)) {
        setPendingOrderSubmit(false);
        setConversationState(cartNotEmpty ? "ordering" : "browsing");
        return false;
      }

      if (isNameCaptureMessage(trimmed)) {
        await applyNameFromChat(trimmed);
        return true;
      }

      return false;
    }

    if (handleRemoveIntent(trimmed)) {
      return true;
    }

    if (pendingRemovePick && !isRemoveIntent(trimmed)) {
      const pickMatches = findMenuItemsMatchingText(trimmed, menuItems);
      if (pickMatches.length === 1) {
        setPendingRemovePick(false);
        const item = pickMatches[0]!;
        if (removeCartItem(item.id, { validMenuIds })) {
          syncLastCartItemAfterCartChange();
          syncCartFromCookie();
          setConversationState(
            Object.keys(readSkyCartFromCookie()).length > 0
              ? "ordering"
              : "browsing",
          );
        }
        return true;
      }
      setPendingRemovePick(false);
      return false;
    }

    if (cartNotEmpty && isIncreaseQuantityIntent(trimmed)) {
      const delta = parseIncreaseDeltaFromMessage(trimmed);
      const candidateId = lastCartItemId ?? readLastCartItemId();
      const itemId =
        candidateId && validMenuIds.has(candidateId) && cart[candidateId]
          ? candidateId
          : null;

      if (
        itemId &&
        increaseCartItemQuantity(itemId, delta, suggestionContext)
      ) {
        persistLastCartItemId(itemId);
        syncCartFromCookie();
        setConversationState("ordering");
        return true;
      }
      return false;
    }

    const intent = resolveLocalIntent(
      trimmed,
      conversationState,
      cartNotEmpty,
      menuItems,
    );

    switch (intent) {
      case "customer_name":
        await applyNameFromChat(trimmed);
        return true;
      case "confirm":
        await confirmOrder();
        return true;
      case "checkout":
        beginCheckoutFlow();
        return true;
      case "add_more":
        setConversationState(cartNotEmpty ? "ordering" : "browsing");
        return false;
      case "edit_cancel_unclear":
        return false;
      case "none":
        break;
    }

    return false;
  };

  const sendMessage = async (message: string) => {
    const trimmed = message.trim();
    if (!trimmed || isSending) return;

    setErrorText("");
    appendMessage("user", trimmed);
    setInput("");

    const handledLocally = await handleLocalMessage(trimmed);
    if (handledLocally) return;

    setIsSending(true);

    const payload: AiOrderRequest = {
      sessionId,
      message: trimmed,
      source: useDiscoveryWebhook ? "menu_discovery_chat" : "menu_order_chat",
      locale: isArabic ? "ar" : "en",
      direction,
      menuId: menuInfo?.id ?? 0,
      restaurantName: aiMenuIdentity.restaurantName,
      menuName: aiMenuIdentity.menuName,
      currency: menuCurrencyCode,
      currentCart: canOrderViaChat
        ? toRequestCartQuantities(readSkyCartFromCookie())
        : {},
      menuCatalog: aiMenuCatalog,
    };

    const result = useDiscoveryWebhook
      ? await sendAiDiscoveryMessage(payload)
      : await sendAiOrderMessage(payload);
    setIsSending(false);

    if (!result.ok) {
      const msg = result.error || labels.error;
      setErrorText(msg);
      appendMessage("bot", msg);
      return;
    }

    const normalized = normalizeAiOrderResponse(
      result.data ?? result.rawText,
      "",
    );
    const visibleSuggestions = enrichAiSuggestions(
      normalized.suggestions,
      suggestionContext,
    );
    const rawSuggestionIds = extractSuggestionIdsFromRaw(
      normalized.suggestions,
    );

    const text = pickReplyText(normalized, result.rawText || "", "");
    const safeText = visibleSuggestions.length
      ? compactReplyWhenSuggestionsExist(
          text,
          "",
          visibleSuggestions.map((s) => s.name),
          rawSuggestionIds.length
            ? rawSuggestionIds
            : visibleSuggestions.map((s) => s.id),
        )
      : text;
    appendMessage(
      "bot",
      safeText,
      visibleSuggestions.length ? visibleSuggestions : undefined,
    );

    if (canOrderViaChat) {
      // Suggestion cards: Add is frontend-only; ignore n8n cartActions when showing cards.
      const cartActions =
        visibleSuggestions.length > 0 ? [] : resolveCartActions(normalized);

      if (cartActions.length) {
        clearN8nPendingState();
        const { changed, lastItemId } = applyCartActions(
          cartActions,
          suggestionContext,
        );
        if (changed) {
          syncCartFromCookie();
          if (lastItemId) persistLastCartItemId(lastItemId);
          setConversationState("ordering");
        }
      } else if (normalized.cart) {
        clearN8nPendingState();
        applyValidatedCart(normalized.cart);
      } else {
        setConversationState((prev) =>
          syncStateWithCart(prev, cartItems.length > 0),
        );
      }

      const action = normalized.action;
      const aiWantsCheckout =
        action === "confirm_order" || normalized.requiresConfirmation;
      if (aiWantsCheckout) {
        const freshCart = readSkyCartFromCookie();
        const hasItems = Object.values(freshCart).some((item) =>
          validMenuIds.has(item.id),
        );
        if (hasItems) beginCheckoutFlow();
      }
    }

    refreshQuickChips();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await sendMessage(input);
    requestAnimationFrame(resizeChatInput);
  };

  const handleChatInputKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter" || e.shiftKey) return;
    e.preventDefault();
    if (isSending || !input.trim()) return;
    void handleSubmit(e);
  };

  const confirmOrder = async () => {
    setErrorText("");
    if (customerName.trim()) {
      await submitOrderToStaff();
      return;
    }
    setPendingOrderSubmit(true);
    setConversationState("waiting_for_name");
    setCheckoutNameInput("");
    setOrderSummarySheetOpen(true);
  };

  const submitOrderWithCheckoutName = async () => {
    const name = checkoutNameInput.trim();
    if (!name) {
      setErrorText(labels.customerNameRequired);
      checkoutNameInputRef.current?.focus();
      return;
    }
    setErrorText("");
    setCustomerName(name);
    localStorage.setItem(NAME_STORAGE_KEY, name);
    setPendingOrderSubmit(false);
    setConversationState("waiting_for_confirmation");
    await submitOrderToStaff(name);
  };

  const handleCheckoutNameFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    void submitOrderWithCheckoutName();
  };

  return (
    <div
      className={`fixed ${chatAnchorClass} ${isArabic ? "right-5" : "left-5"} z-99992`}
      dir={direction}
    >
      {open ? (
        <div className="w-[min(92vw,390px)] rounded-3xl border border-zinc-200/80 bg-white shadow-[0_20px_45px_rgba(2,6,23,0.15)] ring-1 ring-black/5 overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95">
          <div className="relative overflow-hidden bg-linear-to-br from-violet-600 via-violet-500 to-fuchsia-500 px-4 py-4 text-white">
            <div className="absolute -top-10 -end-10 h-24 w-24 rounded-full bg-white/15 blur-2xl" />
            <div className="absolute -bottom-6 start-0 h-16 w-16 rounded-full bg-fuchsia-300/20 blur-xl" />
            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-md sm:text-[17px] font-semibold leading-snug tracking-tight">
                  {labels.title}
                </p>
                <p className="text-[11px] text-white/90 mt-2 flex items-center gap-2 font-medium">
                  <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-emerald-300 shadow-[0_0_0_3px_rgba(16,185,129,0.28)]" />
                  {labels.online}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="shrink-0 rounded-xl border border-white/25 bg-white/10 p-1.5 hover:bg-white/20 transition"
                aria-label="Close"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="relative">
            <div
              ref={messagesScrollRef}
              className="h-[360px] sm:h-[380px] overflow-y-auto overscroll-contain bg-linear-to-b from-zinc-50/80 to-white px-3.5 py-3.5 space-y-3"
            >
              {showBetaCard ? (
                <div
                  className="flex justify-center px-1 pb-1"
                  role="note"
                  aria-label="إشعار النسخة التجريبية"
                >
                  <p className="max-w-[95%] rounded-lg border border-amber-100/90 bg-amber-50/70 px-2.5 py-2 text-center text-[10px] leading-[1.55] text-zinc-600 sm:text-[11px]">
                    {BETA_NOTICE_AR}
                  </p>
                </div>
              ) : null}
              {visibleMessages.map((m) => (
                <Fragment key={m.id}>
                  <div
                    className={`flex transition-all duration-200 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={
                        m.role === "user"
                          ? "w-fit max-w-[70%] min-w-20 shrink-0 space-y-2"
                          : "max-w-[88%] min-w-0 space-y-2"
                      }
                    >
                      {m.text.trim() ? (
                        <div
                          className={`rounded-2xl px-3.5 py-3 text-[13px] leading-[1.65] shadow-[0_2px_10px_rgba(2,6,23,0.06)] ${
                            m.role === "user"
                              ? "w-fit max-w-full min-w-20 whitespace-normal break-normal wrap-break-word bg-linear-to-r from-violet-600 to-fuchsia-500 text-white rounded-br-md"
                              : "max-w-full whitespace-pre-line wrap-break-word bg-white/95 text-zinc-800 rounded-bl-md border border-zinc-200/80"
                          }`}
                        >
                          {m.text}
                        </div>
                      ) : null}
                      {m.role === "bot"
                        ? (() => {
                            const cards = suggestionCardsForDisplay(
                              m.suggestions,
                            );
                            if (!cards.length) return null;
                            return (
                              <div className="grid gap-2">
                                {cards.map((s) => {
                                  const rawImage =
                                    s.image ??
                                    localMenuById.get(s.id)?.image ??
                                    "";
                                  const cartQty = getSuggestionCartQty(s.id);
                                  const showQty = isSuggestionQtyVisible(
                                    m.id,
                                    s.id,
                                  );

                                  return (
                                    <div
                                      key={`${m.id}_${s.id}`}
                                      className="flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200 bg-white p-2 shadow-[0_1px_6px_rgba(2,6,23,0.06)]"
                                    >
                                      <LoadImage
                                        src={rawImage}
                                        alt={s.name}
                                        className="h-11 w-11 shrink-0 rounded-lg object-cover border border-zinc-200"
                                        width={44}
                                        height={44}
                                      />
                                      <div className="min-w-0 flex-1 basis-0 grow">
                                        <p className="truncate text-xs font-semibold text-zinc-800">
                                          {s.name}
                                        </p>
                                        <p className="text-[11px] text-zinc-500">
                                          {Number(s.price).toFixed(2)}{" "}
                                          {currencyLabel(s.currency)}
                                        </p>
                                      </div>
                                      {!canOrderViaChat ? null : showQty ? (
                                        <div className="flex shrink-0 flex-col items-center gap-0.5">
                                          <div
                                            className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50/80 px-1 py-0.5"
                                            role="group"
                                            aria-label={
                                              isArabic ? "الكمية" : "Quantity"
                                            }
                                          >
                                            <button
                                              type="button"
                                              aria-label={
                                                isArabic
                                                  ? "تقليل الكمية"
                                                  : "Decrease quantity"
                                              }
                                              disabled={
                                                cartQty <= 0 || isSending
                                              }
                                              onClick={() => {
                                                if (cartQty <= 0) return;
                                                handleSuggestionCartAdjust(
                                                  m.id,
                                                  s.id,
                                                  -1,
                                                );
                                              }}
                                              className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white text-base font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                              −
                                            </button>
                                            <span className="min-w-6 text-center text-sm font-semibold tabular-nums text-zinc-800">
                                              {cartQty}
                                            </span>
                                            <button
                                              type="button"
                                              aria-label={
                                                isArabic
                                                  ? "زيادة الكمية"
                                                  : "Increase quantity"
                                              }
                                              disabled={
                                                cartQty >= 999 || isSending
                                              }
                                              onClick={() =>
                                                handleSuggestionCartAdjust(
                                                  m.id,
                                                  s.id,
                                                  1,
                                                )
                                              }
                                              className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white text-base font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                              +
                                            </button>
                                          </div>
                                          <button
                                            type="button"
                                            disabled={isSending}
                                            aria-label={
                                              isArabic
                                                ? "إخفاء الكمية"
                                                : "Hide quantity"
                                            }
                                            onClick={() =>
                                              collapseSuggestionQty(m.id, s.id)
                                            }
                                            className="flex h-6 w-8 items-center justify-center rounded-md text-violet-600 transition hover:bg-violet-50 disabled:opacity-50"
                                          >
                                            <FiChevronDown
                                              className="h-4 w-4"
                                              aria-hidden
                                            />
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          type="button"
                                          disabled={isSending}
                                          onClick={() =>
                                            openSuggestionQty(m.id, s.id)
                                          }
                                          className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-violet-600 px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                          <span>{labels.add}</span>
                                          {cartQty > 0 ? (
                                            <span className="rounded-full bg-white/25 px-1.5 py-0.5 text-[10px] font-bold tabular-nums leading-none">
                                              {cartQty}
                                            </span>
                                          ) : null}
                                        </button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()
                        : null}
                    </div>
                  </div>
                </Fragment>
              ))}
              {isSending ? (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md border border-zinc-200/70 bg-zinc-100 px-3 py-2 text-xs text-zinc-500">
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.2s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.1s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce" />
                    </div>
                  </div>
                </div>
              ) : null}
              {!isBrowseOnly && showInlineCartEditor && cartItems.length > 0 ? (
                <div className="rounded-xl border border-violet-200/90 bg-white p-3 shadow-[0_4px_14px_rgba(124,58,237,0.08)]">
                  <p className="mb-2 text-xs font-semibold text-zinc-800">
                    {labels.inlineCartTitle}
                  </p>
                  <ul className="max-h-44 space-y-2 overflow-y-auto pe-0.5">
                    {cartItems.map((item) => {
                      const localItem = localMenuById.get(item.id);
                      const name = localItem
                        ? displayNameForItem(localItem)
                        : item.name;
                      return (
                        <li
                          key={item.id}
                          className="flex flex-wrap items-center gap-2 rounded-lg border border-zinc-100 bg-zinc-50/90 p-2 sm:flex-nowrap"
                        >
                          <div className="min-w-0 flex-1 basis-full sm:basis-auto">
                            <p className="truncate text-xs font-semibold text-zinc-800">
                              {name}
                            </p>
                            <p className="text-[11px] text-zinc-500">
                              {formatPrice(item.price)} × {item.quantity} —{" "}
                              <span className="font-medium text-zinc-700">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              type="button"
                              aria-label={
                                isArabic ? "تقليل الكمية" : "Decrease quantity"
                              }
                              onClick={() => handleInlineCartDecrease(item.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white text-base font-semibold text-zinc-700 transition hover:bg-zinc-100"
                            >
                              −
                            </button>
                            <span className="min-w-6 text-center text-sm font-semibold tabular-nums text-zinc-800">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              aria-label={
                                isArabic ? "زيادة الكمية" : "Increase quantity"
                              }
                              disabled={item.quantity >= 999}
                              onClick={() => handleInlineCartIncrease(item.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white text-base font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-40"
                            >
                              +
                            </button>
                            <button
                              type="button"
                              onClick={() => handleInlineCartRemove(item.id)}
                              className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1.5 text-[10px] font-semibold text-rose-700 transition hover:bg-rose-100"
                            >
                              {labels.removeFromCart}
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  <p className="mt-2 border-t border-violet-100 pt-2 text-xs font-bold text-zinc-800">
                    {labels.orderTotal(formatPrice(totalPrice))}
                  </p>
                </div>
              ) : null}
            </div>

            {!isBrowseOnly && showOrderSummarySheet ? (
              <button
                type="button"
                className="absolute inset-0 z-10 bg-zinc-900/25 transition-opacity"
                onClick={dismissOrderSummarySheet}
                aria-label={labels.hideOrderSummary}
              />
            ) : null}

            {!isBrowseOnly && showOrderSummarySheet ? (
              <div
                ref={orderSummaryPanelRef}
                className="absolute inset-x-0 bottom-0 z-20 flex max-h-[min(62vh,340px)] flex-col rounded-t-2xl border border-violet-200/90 border-b-0 bg-white shadow-[0_-10px_28px_rgba(124,58,237,0.2)]"
                role="dialog"
                aria-modal="true"
                aria-label={labels.orderSummaryTitle}
              >
                <div className="flex shrink-0 flex-col items-center border-b border-violet-100/80 px-3 pb-2 pt-2.5">
                  <div
                    className="mb-2 h-1 w-10 shrink-0 rounded-full bg-zinc-300"
                    aria-hidden
                  />
                  <div className="flex w-full items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-zinc-800">
                      {labels.orderSummaryTitle}
                    </p>
                    <button
                      type="button"
                      onClick={dismissOrderSummarySheet}
                      aria-label={labels.hideOrderSummary}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-violet-600 transition hover:bg-violet-50"
                    >
                      <FiChevronDown className="h-5 w-5" aria-hidden />
                    </button>
                  </div>
                </div>
                <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-3 py-2.5">
                  {cartItems.length ? (
                    <>
                      <ul className="space-y-2 pe-0.5">
                        {cartItems.map((item) => {
                          const localItem = localMenuById.get(item.id);
                          const name = localItem
                            ? displayNameForItem(localItem)
                            : item.name;
                          const subtotal = item.price * item.quantity;
                          return (
                            <li
                              key={item.id}
                              className="flex gap-2 rounded-lg border border-zinc-100 bg-zinc-50/80 p-2"
                            >
                              <LoadImage
                                src={localItem?.image ?? ""}
                                alt={name}
                                className="h-10 w-10 shrink-0 rounded-md border border-zinc-200 object-cover"
                                width={40}
                                height={40}
                              />
                              <div className="min-w-0 flex-1 text-start">
                                <p className="text-xs font-semibold text-zinc-800 leading-snug">
                                  {name} × {item.quantity}
                                </p>
                                <p className="mt-0.5 text-[11px] text-zinc-500 leading-snug">
                                  {formatPrice(item.price)} × {item.quantity} —{" "}
                                  <span className="font-medium text-zinc-700">
                                    {formatPrice(subtotal)}
                                  </span>
                                </p>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                      <p className="border-t border-violet-100 pt-2 text-xs font-bold text-zinc-800">
                        {labels.orderTotal(formatPrice(totalPrice))}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs font-semibold text-zinc-700">
                      {labels.emptyCart}
                    </p>
                  )}
                  {showCheckoutNameStep ? (
                    <form
                      onSubmit={handleCheckoutNameFormSubmit}
                      className="space-y-2.5 rounded-lg border border-violet-100 bg-violet-50/40 p-2.5"
                    >
                      <label
                        htmlFor="checkout-customer-name"
                        className="block text-xs font-semibold text-zinc-800"
                      >
                        {labels.customerNameLabel}
                      </label>
                      <input
                        id="checkout-customer-name"
                        ref={checkoutNameInputRef}
                        type="text"
                        value={checkoutNameInput}
                        onChange={(e) => setCheckoutNameInput(e.target.value)}
                        placeholder={labels.customerNamePlaceholder}
                        autoComplete="name"
                        disabled={isSending}
                        className="w-full rounded-lg border border-violet-200 bg-white px-3 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-300/60"
                      />
                      <button
                        type="submit"
                        disabled={isSending || !checkoutNameInput.trim()}
                        className="w-full rounded-lg bg-linear-to-r from-violet-600 to-fuchsia-500 px-3 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {labels.sendOrder}
                      </button>
                    </form>
                  ) : (
                    <div className="flex gap-2 pb-0.5">
                      <button
                        type="button"
                        onClick={() => void confirmOrder()}
                        disabled={isSending || !cartItems.length}
                        className="flex-1 rounded-lg bg-linear-to-r from-violet-600 to-fuchsia-500 px-3 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {labels.confirm}
                      </button>
                      <button
                        type="button"
                        onClick={handleEditOrder}
                        disabled={isSending || !cartItems.length}
                        className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {labels.edit}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <div className="border-t bg-zinc-50 px-3 py-2 space-y-2.5">
            {!isBrowseOnly &&
            checkoutActive &&
            !orderSummarySheetOpen &&
            cartItems.length > 0 ? (
              <button
                type="button"
                onClick={openOrderSummarySheet}
                className="flex w-full items-center justify-between gap-2 rounded-xl border border-violet-200 bg-linear-to-r from-violet-50 to-fuchsia-50/80 px-3 py-2.5 text-start transition hover:border-violet-300 hover:from-violet-100"
              >
                <span className="text-xs font-semibold text-violet-800">
                  {labels.showOrderSummary}
                </span>
                <span className="shrink-0 text-[11px] font-bold tabular-nums text-violet-900">
                  {labels.orderTotal(formatPrice(totalPrice))}
                </span>
              </button>
            ) : null}

            {errorText ? (
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-2 py-1">
                {errorText}
              </p>
            ) : null}

            <div
              className="sticky bottom-0 z-10 -mx-0.5 space-y-1.5 bg-zinc-50/95 px-1 pb-1.5 pt-1 backdrop-blur-sm"
              role="toolbar"
              aria-label={isArabic ? "إجراءات سريعة" : "Quick actions"}
            >
              {!isBrowseOnly &&
              cartNotEmpty &&
              !showOrderSummarySheet &&
              !isSending ? (
                <div className="flex justify-center py-0.5">
                  <button
                    type="button"
                    onClick={handleQuickConfirm}
                    disabled={isSending}
                    className="inline-flex min-w-46 items-center justify-center gap-2 rounded-full border border-emerald-200/80 bg-gradient-to-r from-white via-emerald-50/90 to-white px-5 py-2.5 text-[12px] font-semibold tracking-tight text-emerald-900 shadow-[0_2px_12px_rgba(16,185,129,0.14)] ring-1 ring-emerald-100/80 transition hover:border-emerald-300 hover:shadow-[0_4px_16px_rgba(16,185,129,0.2)] hover:ring-emerald-200/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    <span>{labels.quickConfirm}</span>
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-linear-to-br from-emerald-500 to-teal-600 text-white shadow-sm"
                      aria-hidden
                    >
                      <FiCheck className="h-3 w-3 stroke-3" />
                    </span>
                  </button>
                </div>
              ) : null}

              {!isSending && !showOrderSummarySheet && quickChips.length > 0 ? (
                <div
                  key={quickChipsEpoch}
                  className="relative -mx-1 px-1"
                  role="group"
                  aria-label={labels.quickChipsAria}
                >
                  <div className="overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-smooth pb-1 [scrollbar-width:thin] [scrollbar-color:rgba(124,58,237,0.35)_transparent] touch-pan-x [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-violet-300/80 [&::-webkit-scrollbar-track]:bg-transparent">
                    <div className="flex w-max flex-nowrap gap-2 py-0.5 pe-1 ps-0.5 snap-x snap-mandatory">
                      {quickChips.map((chip, index) => (
                        <button
                          key={`${quickChipsEpoch}_${chip.id}`}
                          type="button"
                          onClick={() => void sendMessage(chip.message)}
                          disabled={isSending}
                          style={{ animationDelay: `${index * 70}ms` }}
                          className="shrink-0 snap-start whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 rounded-full border border-violet-200/70 bg-white px-3.5 py-2 text-[11px] font-semibold text-violet-900 shadow-[0_2px_10px_rgba(124,58,237,0.1)] ring-1 ring-violet-100/60 transition duration-300 fill-mode-both hover:border-violet-300 hover:bg-violet-50/80 hover:shadow-[0_4px_14px_rgba(124,58,237,0.16)] active:scale-[0.97] disabled:opacity-50"
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <textarea
                ref={chatInputRef}
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  resizeChatInput();
                }}
                onKeyDown={handleChatInputKeyDown}
                placeholder={labels.placeholder}
                disabled={isSending}
                className="flex-1 max-h-32 min-h-10 resize-none overflow-y-auto rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm leading-relaxed [overflow-wrap:anywhere] outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-400 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isSending || !input.trim()}
                className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-r from-violet-600 to-fuchsia-500 text-white transition hover:opacity-95 disabled:opacity-60"
                aria-label="Send"
              >
                <FiSend className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div dir="ltr" className="relative size-14 overflow-visible">
          {TEMP_WHATSAPP_FAB ? (
            <a
              href={whatsappFabUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={labels.contactWhatsApp}
              className="relative flex size-14 items-center justify-center rounded-full border-2 border-white bg-[#25D366] text-white shadow-lg shadow-[#25D366]/35 ring-2 ring-[#25D366]/30 transition hover:scale-105 hover:bg-[#20BD5A] active:scale-95"
            >
              <FaWhatsapp className="text-[1.75rem]" aria-hidden />
            </a>
          ) : (
            <button
              type="button"
              onClick={handleOpenChat}
              className="relative size-14 overflow-hidden rounded-full border-2 border-white bg-white p-1 shadow-lg shadow-purple-500/30 ring-2 ring-violet-200 transition hover:scale-105 active:scale-95"
              aria-label={labels.button}
            >
              <img
                src={AI_AVATAR_SRC}
                alt=""
                width={56}
                height={56}
                className="size-full rounded-full object-cover object-center"
                aria-hidden="true"
              />
              <span
                aria-hidden
                className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-violet-500/90 ring-2 ring-white"
              />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
