"use client";

import React, {
  type CSSProperties,
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
import "react-phone-number-input/style.css";
import { FiCheck, FiChevronDown, FiSend, FiX } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import arPhoneLabels from "react-phone-number-input/locale/ar";
import enPhoneLabels from "react-phone-number-input/locale/en";
import { useAppSelector } from "@/store/hooks";
import { axiosPost } from "@/shared/axiosCall";
import {
  buildSkyCartLineKey,
  getCartQuantityForMenuItem,
  notifySkyCartUpdated,
  readSkyCartFromCookie,
  subscribeSkyCartUpdated,
  type SkyCart,
  updateSkyCartLineQuantity,
  upsertSkyCartFromMenuItemWithOptions,
  writeSkyCartToCookie,
} from "@/lib/skyTemplateCart";
import {
  applyCartActions,
  enrichAiSuggestions,
  increaseCartLineQuantity,
  removeCartItem,
  setCartLineQuantity,
  toRequestCartLines,
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
  clearLastCartLineKey,
  parseIncreaseDeltaFromMessage,
  readLastCartItemId,
  readLastCartLineKey,
  writeLastCartItemId,
  writeLastCartLineKey,
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
import MenuItemDetailModal from "@/components/Global/MenuItemDetailModal";
import SkyCartLineItem from "@/components/Global/SkyCartLineItem";
import DeliveryOrderAreaSection, {
  useDeliveryAreaReady,
} from "@/components/Global/DeliveryOrderAreaSection";
import type { MenuItemCartOptions } from "@/components/Global/MenuItemDetailModal";
import { capSuggestionList } from "@/lib/aiOrderSuggestions";
import { buildAiMenuCatalog } from "@/lib/aiOrderMenuCatalog";
import {
  getMenuItemMinPrice,
  hasMenuItemOptions,
} from "@/lib/menuItemOptions";
import { useCurrencyLabel } from "@/lib/useCurrencyLabel";
import {
  buildAllCategoryQuickChips,
  type QuickChip,
} from "@/lib/aiOrderQuickChips";
import { isFreeMenuPlan } from "@/lib/menuPlan";
import { useAiChatCanOrder } from "@/hooks/useAiChatCanOrder";
import { useAiChatCatalogBrowse } from "@/hooks/useAiChatCatalogBrowse";
import { useIsOrderingEnabled } from "@/hooks/useIsOrderingEnabled";
import { useIsMenuCornerDockSession } from "@/hooks/useIsMenuCornerDockSession";
import { MENU_MOBILE_TAB_BAR_CLEARANCE_CLASS } from "@/lib/menuFabLayout";
import {
  sendAiDiscoveryMessage,
  sendAiOrderMessage,
} from "@/lib/aiOrderWebhook";
import {
  DEFAULT_AI_ORDER_CURRENCY,
  resolveAiOrderMenuIdentity,
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

const NAME_STORAGE_KEY = "ensmenu_ai_order_customer_name";
const NOTES_STORAGE_KEY = "ensmenu_ai_order_customer_notes";
const PHONE_STORAGE_KEY = "ensmenu_ai_order_customer_phone";
const ADDRESS_STORAGE_KEY = "ensmenu_ai_order_customer_address";
const BETA_NOTICE_SESSION_KEY = "ensmenu_ai_order_beta_notice_v4";
const AI_AVATAR_SRC = "/images/AiAvatar.png";

const FAB_PHRASES_AR = [
  "كيف أقدر أساعدك؟ ✨",
  "اسألني عن المنيو 🍽️",
  "مساعدك الذكي 🤖",
  "جرّبني الآن 👋",
  "ازعجتك؟ اسحبني للدائرة الحمرا 🤫",
];

const FAB_PHRASES_EN = [
  "How can I help? ✨",
  "Ask about the menu 🍽️",
  "Your AI assistant 🤖",
  "Try me now 👋",
  "Annoying? Drag me to the X 🤫",
];

const PHRASE_MIN_MS = 1800;
const PHRASE_MAX_MS = 3800;
const PHRASE_FADE_MS = 350;

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

export default function OrderChatbot({
  mode = "ordering",
}: {
  mode?: OrderChatbotMode;
}) {
  const localeFromIntl = useLocale();
  const menuInfo = useAppSelector((s) => s.menu.menuInfo);
  const menuItems = useAppSelector((s) => s.menu.menu) ?? [];
  const storeCategories = useAppSelector((s) => s.menu.categories);
  const currencyLabel = useCurrencyLabel();
  const canOrderViaChat = useAiChatCanOrder();
  const {
    isDeliveryOrder,
    isDistanceDelivery,
    tableNumber: orderingTableNumber,
    governorateId,
    deliveryBranchId,
    deliveryLat,
    deliveryLng,
  } = useIsOrderingEnabled();
  const isMenuCornerDockSession = useIsMenuCornerDockSession();
  const deliveryAreaReady = useDeliveryAreaReady();
  const catalogBrowse = useAiChatCatalogBrowse();

  const isFreePlan = isFreeMenuPlan(menuInfo?.ownerPlanType);

  /** Free → LINAENSMENUFREE; paid → ai-order webhook. */
  const useDiscoveryWebhook = isFreePlan;

  /** No Add/checkout until table or delivery session unlocks ordering. */
  const isBrowseOnly = !canOrderViaChat;

  const chatSessionStorageKey = useMemo(
    () => buildChatSessionStorageKey(menuInfo?.id ?? 0, useDiscoveryWebhook),
    [menuInfo?.id, useDiscoveryWebhook],
  );

  /** Clear ENS fixed banner (~52px) on free-plan menus. */


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
          customerNameLabel: "اسم العميل",
          customerNamePlaceholder: "اكتب اسمك",
          phoneLabel: "رقم الهاتف",
          phoneRequired: "ادخل رقم الهاتف",
          phoneInvalid: "رقم الهاتف غير صحيح",
          addressLabel: "تفاصيل العنوان",
          addressPlaceholder: "الشارع، المبنى، الدور، علامة مميزة…",
          addressRequired: "ادخل العنوان",
          deliveryAreaRequired: "يرجى اختيار منطقة التوصيل",
          notesLabel: "ملاحظات",
          notesPlaceholder: "ملاحظات إضافية",
          step2Title: "الخطوة 2: بيانات الطلب",
          sendOrder: "تأكيد الطلب",
          customerNameRequired: "ادخل الاسم",
          backToSummary: "رجوع",
          askDelivery: "فعّل التوصيل من المنيو أولاً عشان تقدر تطلب.",
          quickChipsAria: "فئات المنيو",
          showMore: "عرض المزيد",
          loadingProducts: "جاري تحميل المنتجات...",
          emptyCategory: "مفيش منتجات في الفئة دي حالياً.",
          completeOrder: "إكمال الطلب",
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
          customerNameLabel: "Customer name",
          customerNamePlaceholder: "Enter your name",
          phoneLabel: "Phone number",
          phoneRequired: "Enter your phone number",
          phoneInvalid: "Invalid phone number",
          addressLabel: "Address details",
          addressPlaceholder: "Street, building, floor, landmark…",
          addressRequired: "Enter your address",
          deliveryAreaRequired: "Please select a delivery area",
          notesLabel: "Notes",
          notesPlaceholder: "Additional notes",
          step2Title: "Step 2: Order details",
          sendOrder: "Confirm order",
          customerNameRequired: "Enter your name",
          backToSummary: "Back",
          askDelivery: "Enable delivery from the menu first to place an order.",
          quickChipsAria: "Menu categories",
          showMore: "Show more",
          loadingProducts: "Loading products...",
          emptyCategory: "No products in this category right now.",
          completeOrder: "Complete order",
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
        customerNameLabel: "اسم العميل",
        customerNamePlaceholder: "اكتب اسمك",
        phoneLabel: "رقم الهاتف",
        phoneRequired: "ادخل رقم الهاتف",
        phoneInvalid: "رقم الهاتف غير صحيح",
        addressLabel: "تفاصيل العنوان",
        addressPlaceholder: "الشارع، المبنى، الدور، علامة مميزة…",
        addressRequired: "ادخل العنوان",
        deliveryAreaRequired: "يرجى اختيار منطقة التوصيل",
        notesLabel: "ملاحظات",
        notesPlaceholder: "ملاحظات إضافية",
        step2Title: "الخطوة 2: بيانات الطلب",
        sendOrder: "تأكيد الطلب",
        customerNameRequired: "ادخل الاسم",
        backToSummary: "رجوع",
        askDelivery: "فعّل التوصيل من المنيو أولاً عشان تقدر تطلب.",
        quickChipsAria: "فئات المنيو",
        showMore: "عرض المزيد",
        loadingProducts: "جاري تحميل المنتجات...",
        emptyCategory: "مفيش منتجات في الفئة دي حالياً.",
        completeOrder: "إكمال الطلب",
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
        customerNameLabel: "Customer name",
        customerNamePlaceholder: "Enter your name",
        phoneLabel: "Phone number",
        phoneRequired: "Enter your phone number",
        phoneInvalid: "Invalid phone number",
        addressLabel: "Address details",
        addressPlaceholder: "Street, building, floor, landmark…",
        addressRequired: "Enter your address",
        deliveryAreaRequired: "Please select a delivery area",
        notesLabel: "Notes",
        notesPlaceholder: "Additional notes",
        step2Title: "Step 2: Order details",
        sendOrder: "Confirm order",
        customerNameRequired: "Enter your name",
        backToSummary: "Back",
        askDelivery: "Enable delivery from the menu first to place an order.",
        quickChipsAria: "Menu categories",
        showMore: "Show more",
        loadingProducts: "Loading products...",
        emptyCategory: "No products in this category right now.",
        completeOrder: "Complete order",
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
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [checkoutAddress, setCheckoutAddress] = useState("");
  const [checkoutOrderNotes, setCheckoutOrderNotes] = useState("");
  const [checkoutFieldErrors, setCheckoutFieldErrors] = useState<{
    name?: string;
    phone?: string;
    address?: string;
    govArea?: string;
  }>({});
  const [conversationState, setConversationState] =
    useState<ConversationState>("browsing");
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [cartSnapshot, setCartSnapshot] = useState<SkyCart>(() =>
    readSkyCartFromCookie(),
  );
  const [lastCartItemId, setLastCartItemId] = useState<number | null>(null);
  const [lastCartLineKey, setLastCartLineKey] = useState<string | null>(null);
  const [optionsPickerItem, setOptionsPickerItem] = useState<MenuItem | null>(
    null,
  );
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
  const [fabPos, setFabPos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isOverDeleteZone, setIsOverDeleteZone] = useState(false);
  const [isFabDismissed, setIsFabDismissed] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  const [fabPhraseIndex, setFabPhraseIndex] = useState(0);
  const [fabPhraseVisible, setFabPhraseVisible] = useState(true);
  const betaShownThisOpenRef = useRef(false);
  const lastQtyMessageIdRef = useRef("catalog_browse");
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const orderSummaryPanelRef = useRef<HTMLDivElement>(null);
  const checkoutNameInputRef = useRef<HTMLInputElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const fabRef = useRef<HTMLDivElement>(null);
  const deleteZoneRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef({
    active: false,
    hasMoved: false,
    isOverDelete: false,
    originPx: 0,
    originPy: 0,
    originFx: 0,
    originFy: 0,
  });

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
    catalogBrowse.items.length,
    catalogBrowse.loading,
    catalogBrowse.loadingMore,
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
      setOptionsPickerItem(null);
      catalogBrowse.clearBrowse();
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
  }, [open, showBetaCard, catalogBrowse.clearBrowse]);

  useEffect(() => {
    const sid = readOrCreateSessionId(chatSessionStorageKey);
    setSessionId(sid);
    const storedName = localStorage.getItem(NAME_STORAGE_KEY) || "";
    const storedNotes = localStorage.getItem(NOTES_STORAGE_KEY) || "";
    const storedPhone = localStorage.getItem(PHONE_STORAGE_KEY) || "";
    const storedAddress = localStorage.getItem(ADDRESS_STORAGE_KEY) || "";
    setCustomerName(storedName);
    setCheckoutNameInput(storedName);
    setCheckoutPhone(storedPhone);
    setCheckoutAddress(storedAddress);
    setCheckoutOrderNotes(storedNotes);
    setCheckoutFieldErrors({});
    setLastCartItemId(readLastCartItemId());
    setLastCartLineKey(readLastCartLineKey());
    setMessages([]);
    setOptionsPickerItem(null);

    if (isBrowseOnly) {
      return;
    }

    const sync = () => {
      const nextCart = readSkyCartFromCookie();
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

  const aiMenuCatalog = useMemo(
    () => buildAiMenuCatalog(menuItems),
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
    setQuickChips(
      buildAllCategoryQuickChips(menuItems, isArabic, storeCategories),
    );
    setQuickChipsEpoch((n) => n + 1);
  }, [menuItems, isArabic, storeCategories]);

  useEffect(() => {
    if (!open) return;
    refreshQuickChips();
  }, [open, refreshQuickChips]);

  const suggestionContext = useMemo(
    () => ({
      validMenuIds,
      localMenuById,
      displayName: displayNameForItem,
      defaultCurrency: menuCurrencyCode,
      locale: isArabic ? "ar" : "en",
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

  const fabPhrases = isArabic ? FAB_PHRASES_AR : FAB_PHRASES_EN;

  useEffect(() => {
    if (open) return;
    let fadeTimer: number;
    let cycleTimer: number;

    const scheduleNext = () => {
      const delay = PHRASE_MIN_MS + Math.random() * (PHRASE_MAX_MS - PHRASE_MIN_MS);
      cycleTimer = window.setTimeout(() => {
        setFabPhraseVisible(false);
        fadeTimer = window.setTimeout(() => {
          setFabPhraseIndex((i) => (i + 1) % fabPhrases.length);
          setFabPhraseVisible(true);
          scheduleNext();
        }, PHRASE_FADE_MS);
      }, delay);
    };

    scheduleNext();

    return () => {
      window.clearTimeout(cycleTimer);
      window.clearTimeout(fadeTimer);
    };
  }, [open, fabPhrases.length]);

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

  const persistLastCartLine = (itemId: number, lineKey?: string) => {
    if (!validMenuIds.has(itemId)) return;
    setLastCartItemId(itemId);
    writeLastCartItemId(itemId);
    if (lineKey?.trim()) {
      setLastCartLineKey(lineKey);
      writeLastCartLineKey(lineKey);
    }
  };

  const syncCartFromCookie = () => {
    const nextCart = readSkyCartFromCookie();
    setCartSnapshot(nextCart);
    setConversationState((prev) =>
      syncStateWithCart(prev, Object.keys(nextCart).length > 0),
    );
  };

  const applyValidatedCart = (
    candidateCart: AiOrderCart | undefined,
  ): boolean => {
    if (!candidateCart || typeof candidateCart !== "object") return false;
    const next: SkyCart = {};

    for (const [key, value] of Object.entries(candidateCart)) {
      const id = Number(value?.id ?? key);
      const quantity = Number(value?.quantity);

      if (!Number.isInteger(id) || id <= 0) continue;
      if (!validMenuIds.has(id)) continue;
      if (!Number.isFinite(quantity) || quantity <= 0) continue;

      const localItem = localMenuById.get(id);
      if (!localItem) continue;
      if (hasMenuItemOptions(localItem)) continue;

      const lineKey = String(id);
      next[lineKey] = {
        lineKey,
        id,
        quantity: Math.floor(quantity),
        name: displayNameForItem(localItem),
        price: localItem.price,
        image: localItem.image ?? "",
      };
    }

    writeSkyCartToCookie(next);
    notifySkyCartUpdated();
    setCartSnapshot(next);
    setConversationState(
      Object.keys(next).length > 0 ? "ordering" : "browsing",
    );
    const lastLine = Object.values(next).pop();
    if (lastLine) persistLastCartLine(lastLine.id, lastLine.lineKey);
    return true;
  };

  const openOrderDetailsStep = () => {
    const currentCart = readSkyCartFromCookie();
    const items = Object.values(currentCart).filter((item) =>
      validMenuIds.has(item.id),
    );
    if (!items.length) {
      setErrorText(labels.emptyCart);
      setConversationState("browsing");
      return;
    }
    if (!canOrderViaChat) {
      setErrorText(isDeliveryOrder ? labels.askDelivery : labels.askTable);
      return;
    }
    if (!isDeliveryOrder && !orderingTableNumber) {
      setErrorText(labels.askTable);
      return;
    }
    setErrorText("");
    setCheckoutFieldErrors({});
    setCheckoutNameInput(customerName.trim());
    setShowInlineCartEditor(false);
    catalogBrowse.clearBrowse();
    setPendingOrderSubmit(true);
    setConversationState("waiting_for_name");
    setOrderSummarySheetOpen(true);
  };

  const beginCheckoutFlow = () => {
    openOrderDetailsStep();
  };

  const submitOrderToStaff = async (
    nameOverride?: string,
    notesOverride?: string,
  ): Promise<boolean> => {
    setErrorText("");
    const currentCart = readSkyCartFromCookie();
    const items = Object.values(currentCart).filter((item) =>
      validMenuIds.has(item.id),
    );
    const resolvedName = (nameOverride ?? customerName).trim();
    const resolvedNotes = (notesOverride ?? checkoutOrderNotes).trim();
    const resolvedPhone = checkoutPhone.trim();
    const resolvedAddress = checkoutAddress.trim();

    if (!canOrderViaChat) {
      setErrorText(isDeliveryOrder ? labels.askDelivery : labels.askTable);
      return false;
    }
    if (!isDeliveryOrder && !orderingTableNumber) {
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
    if (isDeliveryOrder) {
      if (!resolvedPhone) {
        setCheckoutFieldErrors({ phone: labels.phoneRequired });
        return false;
      }
      if (!isValidPhoneNumber(resolvedPhone)) {
        setCheckoutFieldErrors({ phone: labels.phoneInvalid });
        return false;
      }
      if (!resolvedAddress) {
        setCheckoutFieldErrors({ address: labels.addressRequired });
        return false;
      }
    }

    setIsSending(true);
    try {
      const payload: StaffCallPayload = {
        menuId: menuInfo.id,
        type: isDeliveryOrder ? "delivery" : "table",
        tableNumber: isDeliveryOrder ? "" : orderingTableNumber,
        customerName: resolvedName,
        ...(isDeliveryOrder
          ? {
              customerPhone: resolvedPhone,
              customerAddress: resolvedAddress,
            }
          : resolvedPhone
            ? { customerPhone: resolvedPhone }
            : {}),
        ...(resolvedNotes ? { orderNotes: resolvedNotes } : {}),
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
        items: items.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity,
          price: item.price,
          size: item.size ?? null,
          variant: item.variant ?? null,
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
      setCheckoutOrderNotes("");
      setCheckoutPhone("");
      setCheckoutAddress("");
      localStorage.removeItem(NOTES_STORAGE_KEY);
      localStorage.removeItem(PHONE_STORAGE_KEY);
      localStorage.removeItem(ADDRESS_STORAGE_KEY);
      catalogBrowse.clearBrowse();
      setExpandedSuggestionQtyKeys(new Set());
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
    setCheckoutNameInput(trimmed);
    localStorage.setItem(NAME_STORAGE_KEY, trimmed);

    if (pendingOrderSubmit) {
      // Keep user on step-2 form; chat only prefills the name field.
      setOrderSummarySheetOpen(true);
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

  const handleCategoryChipClick = (chip: QuickChip) => {
    if (isSending) return;

    if (typeof chip.categoryId === "number") {
      appendMessage("user", chip.message);
      void catalogBrowse.startBrowse({
        categoryId: chip.categoryId,
        title: chip.message,
      });
      scrollMessagesToBottom("smooth");
      return;
    }

    void sendMessage(chip.message);
  };

  const applyInlineCartLineQuantity = (lineKey: string, nextQty: number) => {
    const line = readSkyCartFromCookie()[lineKey];
    if (!line) return;
    if (nextQty <= 0) {
      updateSkyCartLineQuantity(lineKey, -line.quantity);
    } else {
      setCartLineQuantity(line.id, nextQty, suggestionContext, {
        size: line.size ?? null,
        variant: line.variant ?? null,
      });
    }
    syncLastCartItemAfterCartChange();
    syncCartFromCookie();
    if (!Object.keys(readSkyCartFromCookie()).length) {
      setShowInlineCartEditor(false);
      setConversationState("browsing");
    }
    scrollMessagesToBottom("smooth");
  };

  const handleInlineCartIncrease = (lineKey: string) => {
    const current = readSkyCartFromCookie()[lineKey]?.quantity ?? 0;
    if (current <= 0) return;
    applyInlineCartLineQuantity(lineKey, current + 1);
  };

  const handleInlineCartDecrease = (lineKey: string) => {
    const current = readSkyCartFromCookie()[lineKey]?.quantity ?? 0;
    if (current <= 0) return;
    applyInlineCartLineQuantity(lineKey, current - 1);
  };

  const clearN8nPendingState = () => {
    clearPendingSelection();
    clearPendingSuggestions();
  };

  const resolveChatMenuItem = (itemId: number): MenuItem | null => {
    return (
      localMenuById.get(itemId) ??
      catalogBrowse.items.find((item) => item.id === itemId) ??
      null
    );
  };

  const openOptionsPicker = (itemId: number) => {
    const menuItem = resolveChatMenuItem(itemId);
    if (!menuItem || !hasMenuItemOptions(menuItem)) return;
    setOptionsPickerItem(menuItem);
  };

  const closeOptionsPicker = () => {
    setOptionsPickerItem(null);
  };

  const handleModalAddToCart = (
    item: MenuItem,
    quantity: number,
    options?: MenuItemCartOptions,
  ) => {
    const size = options?.size ?? null;
    const variant = options?.variant ?? null;
    upsertSkyCartFromMenuItemWithOptions(item, quantity, {
      locale: isArabic ? "ar" : "en",
      size,
      variant,
    });
    persistLastCartLine(
      item.id,
      buildSkyCartLineKey(item.id, size, variant),
    );
    openSuggestionQty(lastQtyMessageIdRef.current, item.id);
    syncCartFromCookie();
    setConversationState("ordering");
    closeOptionsPicker();
    scrollMessagesToBottom("smooth");
  };

  const handleCompleteOrder = () => {
    openOrderDetailsStep();
  };

  const syncLastCartItemAfterCartChange = () => {
    const remaining = readSkyCartFromCookie();
    const lines = Object.values(remaining).filter((line) =>
      validMenuIds.has(line.id),
    );
    if (lines.length) {
      const last = lines[lines.length - 1]!;
      persistLastCartLine(last.id, last.lineKey);
    } else {
      setLastCartItemId(null);
      setLastCartLineKey(null);
      clearLastCartItemId();
      clearLastCartLineKey();
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
    getCartQuantityForMenuItem(cartSnapshot, itemId);

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

  const handleSuggestionAddClick = (messageId: string, itemId: number) => {
    const menuItem = resolveChatMenuItem(itemId);
    if (!menuItem) return;

    lastQtyMessageIdRef.current = messageId;

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

    if (hasMenuItemOptions(menuItem)) {
      openOptionsPicker(itemId);
      return;
    }

    openSuggestionQty(messageId, itemId);
    handleSuggestionCartAdjust(messageId, itemId, 1);
  };

  const handleSuggestionCartAdjust = (
    messageId: string,
    itemId: number,
    delta: number,
  ) => {
    const menuItem = resolveChatMenuItem(itemId);
    if (!menuItem) return;

    lastQtyMessageIdRef.current = messageId;

    const current = getSuggestionCartQty(itemId);
    const locale = isArabic ? "ar" : "en";

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

    // Sizes / add-ons: first + opens the popup; later +/- adjust the last line.
    if (hasMenuItemOptions(menuItem)) {
      if (delta > 0 && current <= 0) {
        openOptionsPicker(itemId);
        return;
      }

      const lines = Object.values(readSkyCartFromCookie()).filter(
        (line) => line.id === itemId,
      );
      const line =
        lines.find((l) => l.lineKey === lastCartLineKey) ??
        lines[lines.length - 1];

      if (!line) {
        if (delta > 0) openOptionsPicker(itemId);
        return;
      }

      updateSkyCartLineQuantity(line.lineKey, delta);
      const nextCart = readSkyCartFromCookie();
      if (!nextCart[line.lineKey]) {
        collapseSuggestionQty(messageId, itemId);
      } else {
        openSuggestionQty(messageId, itemId);
        persistLastCartLine(itemId, line.lineKey);
      }
      syncLastCartItemAfterCartChange();
      syncCartFromCookie();
      setConversationState(
        Object.keys(readSkyCartFromCookie()).length > 0
          ? "ordering"
          : "browsing",
      );
      return;
    }

    const nextQty = current + delta;
    if (nextQty <= 0) {
      if (current > 0) {
        removeCartItem(itemId, { validMenuIds });
        syncLastCartItemAfterCartChange();
        syncCartFromCookie();
      }
      collapseSuggestionQty(messageId, itemId);
      setConversationState(
        Object.keys(readSkyCartFromCookie()).length > 0
          ? "ordering"
          : "browsing",
      );
      return;
    }

    // Use the resolved menu item (browse API) — do not require Redux id maps.
    upsertSkyCartFromMenuItemWithOptions(menuItem, delta, { locale });
    persistLastCartLine(itemId, buildSkyCartLineKey(itemId, null, null));
    openSuggestionQty(messageId, itemId);
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
      const candidateLineKey = lastCartLineKey ?? readLastCartLineKey();
      const lineFromKey =
        candidateLineKey && cart[candidateLineKey]
          ? cart[candidateLineKey]
          : null;

      if (lineFromKey && increaseCartLineQuantity(lineFromKey.lineKey, delta)) {
        persistLastCartLine(lineFromKey.id, lineFromKey.lineKey);
        syncCartFromCookie();
        setConversationState("ordering");
        return true;
      }

      const candidateId = lastCartItemId ?? readLastCartItemId();
      const linesForItem =
        candidateId && validMenuIds.has(candidateId)
          ? Object.values(cart).filter((line) => line.id === candidateId)
          : [];
      const fallbackLine = linesForItem[linesForItem.length - 1];
      if (
        fallbackLine &&
        increaseCartLineQuantity(fallbackLine.lineKey, delta)
      ) {
        persistLastCartLine(fallbackLine.id, fallbackLine.lineKey);
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
      currentCartLines: canOrderViaChat
        ? toRequestCartLines(readSkyCartFromCookie())
        : [],
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
        const { changed, lastItemId, lastLineKey, needsOptions } =
          applyCartActions(cartActions, suggestionContext);
        if (changed) {
          syncCartFromCookie();
          if (lastItemId) persistLastCartLine(lastItemId, lastLineKey);
          setConversationState("ordering");
        }
        if (needsOptions?.itemId) {
          openOptionsPicker(needsOptions.itemId);
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
    openOrderDetailsStep();
  };

  const submitOrderWithDetails = async () => {
    const name = checkoutNameInput.trim();
    const errors: {
      name?: string;
      phone?: string;
      address?: string;
      govArea?: string;
    } = {};
    if (!name) {
      errors.name = labels.customerNameRequired;
    }
    if (isDeliveryOrder) {
      if (!deliveryAreaReady) {
        errors.govArea = labels.deliveryAreaRequired;
      }
      if (!checkoutPhone.trim()) {
        errors.phone = labels.phoneRequired;
      } else if (!isValidPhoneNumber(checkoutPhone.trim())) {
        errors.phone = labels.phoneInvalid;
      }
      if (!checkoutAddress.trim()) {
        errors.address = labels.addressRequired;
      }
    }
    if (Object.keys(errors).length) {
      setCheckoutFieldErrors(errors);
      if (errors.name) checkoutNameInputRef.current?.focus();
      return;
    }
    setCheckoutFieldErrors({});
    setErrorText("");
    setCustomerName(name);
    localStorage.setItem(NAME_STORAGE_KEY, name);
    localStorage.setItem(NOTES_STORAGE_KEY, checkoutOrderNotes.trim());
    localStorage.setItem(PHONE_STORAGE_KEY, checkoutPhone.trim());
    localStorage.setItem(ADDRESS_STORAGE_KEY, checkoutAddress.trim());
    setPendingOrderSubmit(false);
    setConversationState("waiting_for_confirmation");
    await submitOrderToStaff(name, checkoutOrderNotes);
  };

  const handleCheckoutNameFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    void submitOrderWithDetails();
  };

  if (isFabDismissed) return null;

  const FAB_SIZE = 56;

  const handleFabPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (open) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = fabRef.current?.getBoundingClientRect();
    dragStateRef.current = {
      active: true,
      hasMoved: false,
      isOverDelete: false,
      originPx: e.clientX,
      originPy: e.clientY,
      originFx: fabPos?.x ?? (rect?.left ?? 0),
      originFy: fabPos?.y ?? (rect?.top ?? 0),
    };
    setIsDragging(true);
  };

  const handleFabPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const ds = dragStateRef.current;
    if (!ds.active) return;
    const dx = e.clientX - ds.originPx;
    const dy = e.clientY - ds.originPy;
    if (!ds.hasMoved && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      ds.hasMoved = true;
    }
    if (!ds.hasMoved) return;
    const FAB_MARGIN = 12;
    const newX = Math.max(FAB_MARGIN, Math.min(window.innerWidth - FAB_SIZE - FAB_MARGIN, ds.originFx + dx));
    const newY = Math.max(FAB_MARGIN, Math.min(window.innerHeight - FAB_SIZE - FAB_MARGIN, ds.originFy + dy));
    setFabPos({ x: newX, y: newY });
    if (deleteZoneRef.current) {
      const dz = deleteZoneRef.current.getBoundingClientRect();
      const over =
        e.clientX >= dz.left &&
        e.clientX <= dz.right &&
        e.clientY >= dz.top &&
        e.clientY <= dz.bottom;
      ds.isOverDelete = over;
      setIsOverDeleteZone(over);
    }
  };

  const handleFabPointerUp = () => {
    const ds = dragStateRef.current;
    if (!ds.active) return;
    const wasMoved = ds.hasMoved;
    const wasOverDelete = ds.isOverDelete;
    ds.active = false;
    ds.hasMoved = false;
    ds.isOverDelete = false;
    setIsDragging(false);
    setIsOverDeleteZone(false);
    if (wasOverDelete) {
      setIsFabDismissed(true);
    } else if (!wasMoved) {
      handleOpenChat();
    } else {
      const SNAP_MARGIN = 16;
      const svw = window.innerWidth;
      const svh = window.innerHeight;
      setFabPos((prev) => {
        if (!prev) return prev;
        const cx = prev.x + FAB_SIZE / 2;
        const cy = prev.y + FAB_SIZE / 2;
        return {
          x: cx < svw / 2 ? SNAP_MARGIN : svw - FAB_SIZE - SNAP_MARGIN,
          y: cy < svh / 2 ? SNAP_MARGIN : svh - FAB_SIZE - SNAP_MARGIN,
        };
      });
      setIsSnapping(true);
      window.setTimeout(() => setIsSnapping(false), 400);
    }
  };

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Chat panel dimensions (approximate)
  const CHAT_W = Math.min(vw * 0.92, 390);
  const CHAT_H = Math.min(vh * 0.88, 620);
  const EDGE_GAP = 12;

  /**
   * Resolves the wrapper position:
   * - FAB closed + custom pos  → exact dragged position
   * - Chat open + no custom pos → CSS default (bottom corner)
   * - Chat open + custom pos   → follow FAB position, clamp so panel fits fully on screen
   */
  const resolvedPos = (() => {
    if (!fabPos) return null;
    if (open) {
      return {
        x: Math.max(EDGE_GAP, Math.min(fabPos.x, vw - CHAT_W - EDGE_GAP)),
        y: Math.max(EDGE_GAP, Math.min(fabPos.y, vh - CHAT_H - EDGE_GAP)),
      };
    }
    return fabPos;
  })();

  const fabWrapperClass = resolvedPos
    ? `fixed z-99992`
    : isMenuCornerDockSession
      ? `fixed ${MENU_MOBILE_TAB_BAR_CLEARANCE_CLASS} start-4 z-99992 md:bottom-6`
      : `fixed bottom-[calc(1.75rem+env(safe-area-inset-bottom,0px))] start-4 z-99992 md:bottom-6`;

  const fabWrapperStyle: CSSProperties = resolvedPos
    ? {
      left: resolvedPos.x,
      top: resolvedPos.y,
      ...(isSnapping
        ? { transition: "left 380ms cubic-bezier(0.34,1.56,0.64,1), top 380ms cubic-bezier(0.34,1.56,0.64,1)" }
        : {}),
    }
    : {};

  return (
    <>
      <div
        ref={fabRef}
        className={fabWrapperClass}
        style={fabWrapperStyle}
        dir={direction}
      >
        {open ? (
          <div className="font-body w-[min(92vw,390px)] rounded-3xl border border-zinc-200/80 bg-white shadow-[0_20px_45px_rgba(2,6,23,0.15)] ring-1 ring-black/5 overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95">
            <div className="relative overflow-hidden bg-linear-to-br from-violet-600 via-violet-500 to-fuchsia-500 px-4 py-4 text-white">
              <div className="absolute -top-10 -end-10 h-24 w-24 rounded-full bg-white/15 blur-2xl" />
              <div className="absolute -bottom-6 start-0 h-16 w-16 rounded-full bg-fuchsia-300/20 blur-xl" />
              <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-base sm:text-[17px] font-semibold leading-snug tracking-tight">
                    {labels.title}
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-sm font-medium text-white/90">
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
                            className={`rounded-2xl px-3.5 py-3 text-[13px] leading-[1.65] shadow-[0_2px_10px_rgba(2,6,23,0.06)] ${m.role === "user"
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
                                  const showQty =
                                    cartQty > 0 ||
                                    isSuggestionQtyVisible(m.id, s.id);

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
                                            handleSuggestionAddClick(m.id, s.id)
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
                {catalogBrowse.isBrowsing ? (
                  <div className="rounded-xl border border-violet-200/90 bg-white p-3 shadow-[0_4px_14px_rgba(124,58,237,0.08)]">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-semibold text-zinc-800">
                        {catalogBrowse.title}
                      </p>
                      <button
                        type="button"
                        onClick={() => catalogBrowse.clearBrowse()}
                        className="shrink-0 rounded-md px-2 py-1 text-[11px] font-medium text-zinc-500 transition hover:bg-zinc-100"
                      >
                        {isArabic ? "إغلاق" : "Close"}
                      </button>
                    </div>
                    {catalogBrowse.loading && !catalogBrowse.items.length ? (
                      <p className="py-3 text-center text-xs text-zinc-500">
                        {labels.loadingProducts}
                      </p>
                    ) : null}
                    {!catalogBrowse.loading &&
                    !catalogBrowse.items.length ? (
                      <p className="py-3 text-center text-xs text-zinc-500">
                        {labels.emptyCategory}
                      </p>
                    ) : null}
                    {catalogBrowse.items.length > 0 ? (
                      <div className="grid max-h-64 gap-2 overflow-y-auto pe-0.5">
                        {catalogBrowse.items.map((item) => {
                          const name = displayNameForItem(item);
                          const price = getMenuItemMinPrice(item);
                          const cartQty = getSuggestionCartQty(item.id);
                          const showQty =
                            cartQty > 0 ||
                            isSuggestionQtyVisible("catalog_browse", item.id);
                          return (
                            <div
                              key={`browse_${item.id}`}
                              className="flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200 bg-white p-2 shadow-[0_1px_6px_rgba(2,6,23,0.06)]"
                            >
                              <LoadImage
                                src={item.image ?? ""}
                                alt={name}
                                className="h-11 w-11 shrink-0 rounded-lg object-cover border border-zinc-200"
                                width={44}
                                height={44}
                              />
                              <div className="min-w-0 flex-1 basis-0 grow">
                                <p className="truncate text-xs font-semibold text-zinc-800">
                                  {name}
                                </p>
                                <p className="text-[11px] text-zinc-500">
                                  {price.toFixed(2)} {currencyDisplay}
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
                                      disabled={cartQty <= 0 || isSending}
                                      onClick={() => {
                                        if (cartQty <= 0) return;
                                        handleSuggestionCartAdjust(
                                          "catalog_browse",
                                          item.id,
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
                                      disabled={cartQty >= 999 || isSending}
                                      onClick={() =>
                                        handleSuggestionCartAdjust(
                                          "catalog_browse",
                                          item.id,
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
                                      collapseSuggestionQty(
                                        "catalog_browse",
                                        item.id,
                                      )
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
                                    handleSuggestionAddClick(
                                      "catalog_browse",
                                      item.id,
                                    )
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
                    ) : null}
                    {catalogBrowse.hasMore ? (
                      <button
                        type="button"
                        disabled={
                          catalogBrowse.loadingMore || catalogBrowse.loading
                        }
                        onClick={() => void catalogBrowse.loadMore()}
                        className="mt-2 w-full rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-800 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {catalogBrowse.loadingMore
                          ? labels.loadingProducts
                          : labels.showMore}
                      </button>
                    ) : null}
                  </div>
                ) : null}
                {!isBrowseOnly && optionsPickerItem ? (
                  <MenuItemDetailModal
                    item={optionsPickerItem}
                    currencyLabel={currencyDisplay}
                    isTableOrder={canOrderViaChat}
                    cartQuantity={getSuggestionCartQty(optionsPickerItem.id)}
                    primary="#7c3aed"
                    secondary="#d946ef"
                    onClose={closeOptionsPicker}
                    onAddToCart={handleModalAddToCart}
                  />
                ) : null}
                {!isBrowseOnly && showInlineCartEditor && cartItems.length > 0 ? (
                  <div className="rounded-xl border border-(--bg-main)/15 bg-white p-3 shadow-[0_4px_14px_rgba(124,58,237,0.08)]">
                    <p className="mb-2 text-base font-semibold text-(--bg-main)">
                      {labels.inlineCartTitle}
                    </p>
                    <ul className="max-h-56 space-y-2 overflow-y-auto pe-0.5">
                      {cartItems.map((item) => (
                        <SkyCartLineItem
                          key={item.lineKey}
                          item={item}
                          isArabic={isArabic}
                          currencyLabel={currencyDisplay}
                          editable
                          onDecrease={handleInlineCartDecrease}
                          onIncrease={handleInlineCartIncrease}
                          decreaseLabel={
                            isArabic ? "تقليل الكمية" : "Decrease quantity"
                          }
                          increaseLabel={
                            isArabic ? "زيادة الكمية" : "Increase quantity"
                          }
                        />
                      ))}
                    </ul>
                    <div className="mt-3 flex items-center justify-between border-t border-(--bg-main)/15 pt-2 text-base">
                      <span className="font-medium text-zinc-600">
                        {isArabic ? "الإجمالي" : "Total"}
                      </span>
                      <strong className="text-base text-(--bg-main)">
                        {totalPrice.toFixed(2)} {currencyDisplay}
                      </strong>
                    </div>
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
                  className="absolute inset-x-0 bottom-0 z-20 flex max-h-[min(78vh,520px)] flex-col rounded-t-2xl border border-violet-200/90 border-b-0 bg-white shadow-[0_-10px_28px_rgba(124,58,237,0.2)]"
                  role="dialog"
                  aria-modal="true"
                  aria-label={
                    showCheckoutNameStep
                      ? labels.step2Title
                      : labels.orderSummaryTitle
                  }
                >
                  <div className="flex shrink-0 flex-col items-center border-b border-violet-100/80 px-3 pb-2 pt-2.5">
                    <div
                      className="mb-2 h-1 w-10 shrink-0 rounded-full bg-zinc-300"
                      aria-hidden
                    />
                    <div className="flex w-full items-center justify-between gap-2">
                      <p className="text-base font-semibold text-(--bg-main)">
                        {showCheckoutNameStep
                          ? labels.step2Title
                          : labels.orderSummaryTitle}
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
                  <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-2.5">
                    {cartItems.length ? (
                      <>
                        <ul className="space-y-2 pe-0.5">
                          {cartItems.map((item) => (
                            <SkyCartLineItem
                              key={item.lineKey}
                              item={item}
                              isArabic={isArabic}
                              currencyLabel={currencyDisplay}
                            />
                          ))}
                        </ul>
                        <div className="flex items-center justify-between border-t border-(--bg-main)/15 pt-2 text-base">
                          <span className="font-medium text-zinc-600">
                            {isArabic ? "الإجمالي" : "Total"}
                          </span>
                          <strong className="text-base text-(--bg-main)">
                            {totalPrice.toFixed(2)} {currencyDisplay}
                          </strong>
                        </div>
                      </>
                    ) : (
                      <p className="rounded-lg border border-dashed border-zinc-300 p-4 text-center text-base text-zinc-500">
                        {labels.emptyCart}
                      </p>
                    )}
                    {showCheckoutNameStep ? (
                      <form
                        onSubmit={handleCheckoutNameFormSubmit}
                        className="space-y-4 border-t border-(--bg-main)/15 pt-3"
                      >
                        <div>
                          <label
                            htmlFor="checkout-customer-name"
                            className="mb-2 block text-base font-semibold text-(--bg-main)"
                          >
                            {labels.customerNameLabel} *
                          </label>
                          <input
                            id="checkout-customer-name"
                            ref={checkoutNameInputRef}
                            type="text"
                            value={checkoutNameInput}
                            onChange={(e) => {
                              setCheckoutNameInput(e.target.value);
                              if (checkoutFieldErrors.name) {
                                setCheckoutFieldErrors((prev) => ({
                                  ...prev,
                                  name: undefined,
                                }));
                              }
                            }}
                            placeholder={labels.customerNamePlaceholder}
                            autoComplete="name"
                            disabled={isSending}
                            className={`w-full rounded-lg border px-3 py-2 text-base outline-none transition focus:ring-2 ${
                              checkoutFieldErrors.name
                                ? "border-rose-400 ring-rose-200 focus:ring-rose-300"
                                : "border-(--bg-main)/30 ring-(--bg-main)/30 focus:ring-2"
                            }`}
                          />
                          {checkoutFieldErrors.name ? (
                            <p className="mt-1.5 flex items-center gap-1 text-sm text-rose-500">
                              <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-rose-100 text-[10px] font-bold text-rose-500">
                                !
                              </span>
                              {checkoutFieldErrors.name}
                            </p>
                          ) : null}
                        </div>
                        {isDeliveryOrder ? (
                          <>
                            <DeliveryOrderAreaSection
                              currencyLabel={currencyDisplay}
                              error={checkoutFieldErrors.govArea}
                              onClearError={() =>
                                setCheckoutFieldErrors((prev) => ({
                                  ...prev,
                                  govArea: undefined,
                                }))
                              }
                            />
                            <div>
                              <label
                                htmlFor="checkout-customer-phone"
                                className="mb-2 block text-base font-semibold text-(--bg-main)"
                              >
                                {labels.phoneLabel} *
                              </label>
                              <div
                                className={`w-full rounded-lg border px-3 py-2 text-base transition focus-within:ring-2 ${
                                  checkoutFieldErrors.phone
                                    ? "border-rose-400 focus-within:ring-rose-200"
                                    : "border-(--bg-main)/30 focus-within:ring-(--bg-main)/25"
                                }`}
                              >
                                <PhoneInput
                                  id="checkout-customer-phone"
                                  labels={
                                    isArabic ? arPhoneLabels : enPhoneLabels
                                  }
                                  defaultCountry="EG"
                                  value={checkoutPhone}
                                  onChange={(val) => {
                                    setCheckoutPhone(val ?? "");
                                    if (checkoutFieldErrors.phone) {
                                      setCheckoutFieldErrors((prev) => ({
                                        ...prev,
                                        phone: undefined,
                                      }));
                                    }
                                  }}
                                  className="phone-input-cart"
                                  disabled={isSending}
                                />
                              </div>
                              {checkoutFieldErrors.phone ? (
                                <p className="mt-1.5 flex items-center gap-1 text-sm text-rose-500">
                                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-rose-100 text-[10px] font-bold text-rose-500">
                                    !
                                  </span>
                                  {checkoutFieldErrors.phone}
                                </p>
                              ) : null}
                            </div>
                            <div>
                              <label
                                htmlFor="checkout-customer-address"
                                className="mb-2 block text-base font-semibold text-(--bg-main)"
                              >
                                {labels.addressLabel} *
                              </label>
                              <textarea
                                id="checkout-customer-address"
                                value={checkoutAddress}
                                onChange={(e) => {
                                  setCheckoutAddress(e.target.value);
                                  if (checkoutFieldErrors.address) {
                                    setCheckoutFieldErrors((prev) => ({
                                      ...prev,
                                      address: undefined,
                                    }));
                                  }
                                }}
                                placeholder={labels.addressPlaceholder}
                                rows={3}
                                disabled={isSending}
                                className={`w-full resize-none rounded-lg border px-3 py-2 text-base outline-none transition focus:ring-2 ${
                                  checkoutFieldErrors.address
                                    ? "border-rose-400 ring-rose-200 focus:ring-rose-300"
                                    : "border-(--bg-main)/30 ring-(--bg-main)/30"
                                }`}
                              />
                              {checkoutFieldErrors.address ? (
                                <p className="mt-1.5 flex items-center gap-1 text-sm text-rose-500">
                                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-rose-100 text-[10px] font-bold text-rose-500">
                                    !
                                  </span>
                                  {checkoutFieldErrors.address}
                                </p>
                              ) : null}
                            </div>
                          </>
                        ) : null}
                        <div>
                          <label
                            htmlFor="checkout-order-notes"
                            className="mb-2 block text-base font-semibold text-(--bg-main)"
                          >
                            {labels.notesLabel}
                          </label>
                          <textarea
                            id="checkout-order-notes"
                            value={checkoutOrderNotes}
                            onChange={(e) =>
                              setCheckoutOrderNotes(e.target.value)
                            }
                            placeholder={labels.notesPlaceholder}
                            rows={3}
                            disabled={isSending}
                            className="w-full resize-none rounded-lg border border-(--bg-main)/30 px-3 py-2 text-base outline-none ring-(--bg-main)/30 transition focus:ring-2"
                          />
                        </div>
                        <div className="space-y-2 pb-0.5">
                          <button
                            type="submit"
                            disabled={isSending}
                            className="w-full rounded-lg bg-(--bg-main) px-4 py-2.5 text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {labels.sendOrder}
                          </button>
                          <button
                            type="button"
                            onClick={handleEditOrder}
                            disabled={isSending}
                            className="w-full rounded-lg border border-(--bg-main)/20 px-4 py-2.5 text-base font-medium text-(--bg-main) transition hover:bg-(--bg-main)/10 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {labels.backToSummary}
                          </button>
                        </div>
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
                      onClick={handleCompleteOrder}
                      disabled={isSending}
                      className="inline-flex min-w-46 items-center justify-center gap-2 rounded-full border border-emerald-200/80 bg-linear-to-r from-white via-emerald-50/90 to-white px-5 py-2.5 text-sm font-semibold tracking-tight text-emerald-900 shadow-[0_2px_12px_rgba(16,185,129,0.14)] ring-1 ring-emerald-100/80 transition hover:border-emerald-300 hover:shadow-[0_4px_16px_rgba(16,185,129,0.2)] hover:ring-emerald-200/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55"
                    >
                      <span>{labels.completeOrder}</span>
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
                            onClick={() => handleCategoryChipClick(chip)}
                            disabled={isSending || catalogBrowse.loading}
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
          (() => {
            const showLabelAbove = fabPos ? fabPos.y >= vh / 2 : true;
            const fabOnLeftSide = fabPos ? (fabPos.x + FAB_SIZE / 2) < vw / 2 : !isArabic;
            return (
              <div dir="ltr" className="relative size-14 overflow-visible">
              {!isDragging && (
                <span
                  dir={isArabic ? "rtl" : "ltr"}
                  className="pointer-events-none select-none absolute whitespace-nowrap rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-semibold text-violet-700 shadow-sm ring-1 ring-violet-200/60 backdrop-blur-sm"
                  style={{
                      opacity: fabPhraseVisible ? 1 : 0,
                      transition: `opacity ${PHRASE_FADE_MS}ms ease`,
                      ...(fabOnLeftSide ? { left: 0 } : { right: 0 }),
                      ...(showLabelAbove
                        ? { bottom: "calc(100% + 10px)" }
                        : { top: "calc(100% + 10px)" }),
                    }}
                  >
                    {fabPhrases[fabPhraseIndex]}
                  </span>
                )}
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
                    onPointerDown={handleFabPointerDown}
                    onPointerMove={handleFabPointerMove}
                    onPointerUp={handleFabPointerUp}
                    style={{ touchAction: "none", cursor: isDragging ? "grabbing" : "grab" }}
                    className="relative size-14 overflow-hidden rounded-full border-2 border-white bg-white p-1 shadow-lg shadow-purple-500/30 ring-2 ring-violet-200 transition select-none"
                    aria-label={labels.button}
                  >
                    <img
                      src={AI_AVATAR_SRC}
                      alt=""
                      width={56}
                      height={56}
                      className="size-full rounded-full object-cover object-center pointer-events-none"
                      aria-hidden="true"
                      draggable={false}
                    />
                    <span
                      aria-hidden
                      className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-violet-500/90 ring-2 ring-white"
                    />
                  </button>
                )}
              </div>
            );
          })()
        )}
      </div>

      {isDragging && (
        <div className="fixed inset-x-0 bottom-10 z-99993 flex justify-center pointer-events-none">
          <div
            ref={deleteZoneRef}
            className={`pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full border-2 transition-all duration-150 ${isOverDeleteZone
                ? "border-red-400 bg-red-500 scale-125 shadow-[0_0_24px_rgba(239,68,68,0.55)]"
                : "border-red-300/80 bg-red-500/85 scale-100 shadow-lg"
              }`}
          >
            <FiX className="h-7 w-7 text-white stroke-[2.5]" aria-hidden />
          </div>
        </div>
      )}
    </>
  );
}
