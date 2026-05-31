export type ConversationState =
  | "browsing"
  | "ordering"
  | "waiting_for_name"
  | "waiting_for_confirmation"
  | "order_completed";

export type LocalIntent =
  | "checkout"
  | "confirm"
  | "add_more"
  | "edit_cancel_unclear"
  | "customer_name"
  | "none";

/** Normalize Arabic/English for phrase matching. */
export function normalizeArabicInput(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .toLowerCase();
}

function phraseMatchesNormalized(normalized: string, phrase: string): boolean {
  if (!phrase) return false;
  if (normalized === phrase) return true;
  if (
    normalized.startsWith(`${phrase} `) ||
    normalized.endsWith(` ${phrase}`) ||
    normalized.includes(` ${phrase} `)
  ) {
    return true;
  }
  /** Avoid "شيكولاته" matching checkout "اه". */
  if (phrase.length <= 2) return false;
  return normalized.includes(phrase);
}

function matchesAnyPhrase(normalized: string, phrases: readonly string[]): boolean {
  if (!normalized) return false;
  const normalizedPhrases = phrases
    .map((p) => normalizeArabicInput(p))
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  return normalizedPhrases.some((phrase) =>
    phraseMatchesNormalized(normalized, phrase),
  );
}

/** Explicit checkout — not ambiguous words like «تمام» or bare «اطلب». */
const CHECKOUT_STRONG_PHRASES = [
  "اكد",
  "أكد",
  "تأكيد",
  "اكد الطلب",
  "أكد الطلب",
  "ابعت الطلب",
  "ابعت الاوردر",
  "ابعتلى الطلب",
  "ابعتلي الطلب",
  "خلص",
  "خلصت",
  "كفاية",
  "كفايه",
  "مش عايز حاجة تاني",
  "مش عايز حاجه تاني",
  "لا",
  "لأ",
  "لا شكرا",
  "لا شكراً",
  "خلاص",
  "خلاص كده",
  "اشطا",
  "ابعت",
  "أبعت",
  "جاهز",
  "انتهيت",
  "انهيت",
] as const;

/** Short acknowledgements — only count as confirm at final confirmation step. */
const CHECKOUT_CONFIRM_ACK_PHRASES = [
  "تمام",
  "تمام كده",
  "كده تمام",
  "موافق",
  "اوك",
  "ok",
  "yes",
  "اه",
  "ايوه",
  "أيوه",
  "ماشي",
  "نعم",
] as const;

const ADD_MORE_PHRASES = [
  "عايز كمان",
  "ضيف كمان",
  "زود",
  "كمان",
  "حاجة تاني",
  "حاجه تاني",
  "عايز اضيف",
  "اضيف حاجة",
  "اضيف حاجه",
  "وريني تاني",
  "رشحلي تاني",
  "كمل",
  "كمل طلب",
  "اضيف",
  "أضيف",
  "اضافة",
  "عايز اطلب تاني",
  "عايز اطلب تانيه",
  "اطلب تاني",
  "اطلب تانيه",
  "عايز اطلب",
  "عايز اطلب كمان",
  "اطلب كمان",
  "طلب تاني",
  "تاني",
  "order again",
  "add more",
] as const;

const ORDER_ACK_PHRASES = [
  "تمام",
  "تمام كده",
  "اوك",
  "ok",
  "ماشي",
  "اه",
  "ايوه",
  "أيوه",
] as const;

const GREETING_PHRASES = [
  "اهلا",
  "أهلا",
  "اهلا وسهلا",
  "السلام عليكم",
  "سلام عليكم",
  "سلام",
  "صباح الخير",
  "مساء الخير",
  "هلا",
  "هاي",
  "مرحبا",
  "مرحباً",
  "hi",
  "hello",
  "hey",
  "good morning",
  "good evening",
  "ازيك",
  "اخبارك",
  "كيفك",
  "كيف حالك",
] as const;

const THANKS_PHRASES = [
  "شكرا",
  "شكراً",
  "متشكر",
  "تسلم",
  "يعطيك العافيه",
  "يعطيك العافية",
  "thanks",
  "thank you",
  "thx",
] as const;

const MENU_DISCOVERY_PHRASES = [
  "منيو",
  "المنيو",
  "القائمه",
  "القائمة",
  "menu",
  "الاصناف",
  "الأصناف",
  "اصناف",
  "ايه المتاح",
  "ايش المتاح",
  "ماذا متاح",
  "ما المتاح",
  "المتاح",
  "عندكم ايه",
  "عندك ايه",
  "ايش عندكم",
  "ايه عندكم",
  "رشح",
  "رشحلي",
  "رشح لي",
  "اقترح",
  "اقترحلي",
  "اقترح لي",
  "اقتراح",
  "اقتراحات",
  "ترشيح",
  "اختار",
  "اختارلي",
  "اختار لي",
  "اختاري",
  "مشروبات",
  "مشروب",
  "اكل",
  "طعام",
  "اكلات",
  "حلويات",
  "حلو",
  "حلى",
  "مقبلات",
  "قهوه",
  "قهوة",
  "عصير",
  "عصائر",
  "فطار",
  "فطور",
  "breakfast",
  "dessert",
  "desserts",
  "coffee",
  "juice",
  "recommendation",
  "recommendations",
  "suggestion",
  "suggestions",
  "drinks",
  "drink",
  "food",
  "dishes",
  "وريني",
  "وريني المنيو",
  "اظهر",
  "اعرض",
  "اعرض المنيو",
  "عايز اكل",
  "عايز اشرب",
  "عايز عصير",
  "عايز فطار",
  "عايز قهوه",
  "عايز قهوة",
  "ايه الاكل",
  "ايه المشروبات",
  "اطلب ايه",
  "ايه اطلب",
  "تفتكر اطلب",
  "تفتكرلي",
  "تفتكر لي",
  "تنصحني",
  "نصحني",
  "مش جايلي",
  "مش جايبلي",
  "مش جاي",
  "مش لاقي",
  "مش لاقيه",
  "مش عارف اطلب",
  "مش عارفه اطلب",
  "مش عارفه",
  "مش عارف",
  "مش عايز نفس",
  "مش عايزه نفس",
  "حاجه تانيه",
  "حاجة تانية",
  "حاجة تانيه",
  "حاجه تانية",
  "ايه تختار",
  "اختارلي ايه",
  "اختار لي ايه",
  "ايه تاكل",
  "ايه تشرب",
  "what should i order",
  "what to order",
] as const;

const EDIT_CANCEL_PHRASES = [
  "عدل",
  "تعديل",
  "غير",
  "شيل",
  "احذف",
  "امسح",
  "الغي",
  "إلغاء",
  "الغاء",
  "مش عايزه",
  "مش عايز ده",
  "بدل",
  "رجع",
  "نقص",
] as const;

export function isCheckoutIntent(
  message: string,
  cartNotEmpty: boolean,
  state: ConversationState = "ordering",
): boolean {
  if (!cartNotEmpty) return false;
  const normalized = normalizeArabicInput(message);
  if (matchesAnyPhrase(normalized, CHECKOUT_STRONG_PHRASES)) return true;
  if (
    state === "waiting_for_confirmation" &&
    matchesAnyPhrase(normalized, CHECKOUT_CONFIRM_ACK_PHRASES)
  ) {
    return true;
  }
  return false;
}

export function isConfirmIntent(
  message: string,
  state: ConversationState = "ordering",
): boolean {
  if (state !== "waiting_for_confirmation") return false;
  const normalized = normalizeArabicInput(message);
  return (
    matchesAnyPhrase(normalized, CHECKOUT_STRONG_PHRASES) ||
    matchesAnyPhrase(normalized, CHECKOUT_CONFIRM_ACK_PHRASES)
  );
}

export function isOrderAcknowledgement(message: string): boolean {
  return matchesAnyPhrase(normalizeArabicInput(message), ORDER_ACK_PHRASES);
}

export function isAddMoreIntent(message: string): boolean {
  return matchesAnyPhrase(normalizeArabicInput(message), ADD_MORE_PHRASES);
}

export function isEditCancelIntent(message: string): boolean {
  return matchesAnyPhrase(normalizeArabicInput(message), EDIT_CANCEL_PHRASES);
}

export function isGreetingOrSmallTalk(message: string): boolean {
  return matchesAnyPhrase(normalizeArabicInput(message), GREETING_PHRASES);
}

export function isThanksMessage(message: string): boolean {
  return matchesAnyPhrase(normalizeArabicInput(message), THANKS_PHRASES);
}

export function isMenuDiscoveryIntent(message: string): boolean {
  return matchesAnyPhrase(normalizeArabicInput(message), MENU_DISCOVERY_PHRASES);
}

export function messageMentionsMenuItem(
  message: string,
  items: Array<{ nameAr?: string; name?: string; nameEn?: string }>,
): boolean {
  const normalized = normalizeArabicInput(message);
  if (normalized.length < 3) return false;

  for (const item of items) {
    for (const raw of [item.nameAr, item.name, item.nameEn]) {
      const name = normalizeArabicInput(raw ?? "");
      if (name.length >= 3 && normalized.includes(name)) return true;
    }
  }
  return false;
}

/** Next message while waiting_for_name (not checkout / add-more / small talk). */
export function isNameCaptureMessage(message: string): boolean {
  const trimmed = message.trim();
  if (trimmed.length < 2 || trimmed.length > 48) return false;
  if (isCheckoutIntent(trimmed, true, "waiting_for_name")) return false;
  if (isAddMoreIntent(trimmed)) return false;
  if (isOrderAcknowledgement(trimmed)) return false;
  if (isGreetingOrSmallTalk(trimmed) || isThanksMessage(trimmed)) return false;
  if (isMenuDiscoveryIntent(trimmed)) return false;
  if (/^\d+$/.test(trimmed)) return false;
  return true;
}

/** @deprecated Use isNameCaptureMessage */
export function looksLikeCustomerName(message: string): boolean {
  return isNameCaptureMessage(message);
}

export function syncStateWithCart(
  state: ConversationState,
  cartNotEmpty: boolean,
): ConversationState {
  if (
    state === "waiting_for_name" ||
    state === "waiting_for_confirmation" ||
    state === "order_completed"
  ) {
    return state;
  }
  return cartNotEmpty ? "ordering" : "browsing";
}

export function resolveLocalIntent(
  message: string,
  state: ConversationState,
  cartNotEmpty: boolean,
  menuItems: Array<{ nameAr?: string; name?: string; nameEn?: string }>,
): LocalIntent {
  const trimmed = message.trim();
  if (!trimmed) return "none";

  if (state === "waiting_for_name") {
    if (isAddMoreIntent(trimmed)) return "add_more";
    if (isNameCaptureMessage(trimmed)) return "customer_name";
  }

  if (state === "waiting_for_confirmation") {
    if (isAddMoreIntent(trimmed)) return "add_more";
    if (isConfirmIntent(trimmed, state)) return "confirm";
  }

  if (isAddMoreIntent(trimmed)) return "add_more";

  if (isEditCancelIntent(trimmed)) {
    if (messageMentionsMenuItem(trimmed, menuItems)) return "none";
    return "edit_cancel_unclear";
  }

  if (isCheckoutIntent(trimmed, cartNotEmpty, state)) return "checkout";

  return "none";
}

const MATH_CALC_PHRASES = [
  "كام يساوي",
  "كم يساوي",
  "احسب",
  "احسبلي",
  "احسب لي",
  "كام يطلع",
  "كام النتيجه",
  "كام النتيجة",
  "كم يطلع",
] as const;

const OUT_OF_SCOPE_PHRASES = [
  "الاهلي",
  "الأهلي",
  "الزمالك",
  "كسب كام",
  "كسب كم",
  "ماتش",
  "مباراه",
  "مباراة",
  "اخبار",
  "أخبار",
  "سياسه",
  "سياسة",
  "رئيس امريكا",
  "رئيس أمريكا",
  "الطقس",
  "حالة الجو",
  "اعمللي كود",
  "اعمل كود",
  "اكتبلي كود",
  "اكتب كود",
  "برمج",
  "برمجة",
] as const;

const GENERAL_KNOWLEDGE_STARTERS = [
  "مين ",
  "متى ",
  "اين ",
  "أين ",
  "ازاي ",
  "كيف ",
  "اشرحلي",
  "اشرح لي",
  "اشرح ",
  "لماذا ",
  "ليه ",
  "why ",
  "who ",
  "when ",
  "where ",
  "how to ",
] as const;

function isMathCalculation(message: string): boolean {
  const trimmed = message.trim();
  const normalized = normalizeArabicInput(trimmed);
  const compact = trimmed.replace(/\s+/g, "");

  if (MATH_CALC_PHRASES.some((p) => normalized.includes(normalizeArabicInput(p)))) {
    return true;
  }

  if (/^\d+[\+\-\*\/]\d+=?$/.test(compact)) return true;
  if (/\d+\s*[\+\-\*\/]\s*\d+/.test(trimmed)) return true;
  if (/=\s*$/.test(trimmed) && /\d\s*[\+\-\*\/]\s*\d+/.test(trimmed)) return true;

  return false;
}

function isGeneralKnowledgeQuestion(message: string): boolean {
  const normalized = normalizeArabicInput(message);
  return GENERAL_KNOWLEDGE_STARTERS.some((starter) => {
    const s = normalizeArabicInput(starter);
    return normalized.startsWith(s) || normalized.includes(` ${s.trim()}`);
  });
}

/**
 * Unrelated to menu ordering — block AI when obvious math / trivia / general Q&A
 * and no menu item is referenced.
 */
export function isOutOfScopeMessage(
  message: string,
  menuItems: Array<{ nameAr?: string; name?: string; nameEn?: string }>,
): boolean {
  const trimmed = message.trim();
  if (!trimmed) return false;

  if (messageMentionsMenuItem(trimmed, menuItems)) return false;
  if (isMenuDiscoveryIntent(trimmed)) return false;
  if (isAddMoreIntent(trimmed)) return false;

  if (isMathCalculation(trimmed)) return true;
  if (matchesAnyPhrase(normalizeArabicInput(trimmed), OUT_OF_SCOPE_PHRASES)) {
    return true;
  }
  if (isGeneralKnowledgeQuestion(trimmed)) return true;

  return false;
}

export const OUT_OF_SCOPE_REPLY =
  "🙂 أقدر أساعدك في اختيار الأصناف من المنيو أو تجهيز طلبك فقط.";

export function shouldCallAi(
  state: ConversationState,
  message: string,
  cartNotEmpty: boolean,
  menuItems: Array<{ nameAr?: string; name?: string; nameEn?: string }>,
): boolean {
  if (isOutOfScopeMessage(message, menuItems)) return false;
  return resolveLocalIntent(message, state, cartNotEmpty, menuItems) === "none";
}

/** @deprecated Use isAddMoreIntent */
export function isContinueShoppingIntent(message: string): boolean {
  return isAddMoreIntent(message);
}

export function buildWelcomeMessage(restaurantName: string | undefined): string {
  const name = restaurantName?.trim();
  if (!name) {
    return "👋 أهلاً بيك";
  }
  return `👋 أهلاً بيك في ${name}\n\nممكن تطلب بطريقتك العادية، وأنا أساعدك تختار من المنيو وأجهز طلبك.`;
}
