import { parseCartActions } from "@/lib/aiOrderCartApply";
import type { AiCartAction, AiOrderResponse } from "@/types/aiOrder";

export function normalizeAiOrderResponse(
  raw: unknown,
  fallbackText: string,
): AiOrderResponse {
  let parsed: unknown = raw;

  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return {
        reply: raw,
        action: "reply",
        requiresConfirmation: false,
      };
    }
  }

  if (!parsed || typeof parsed !== "object") {
    return {
      reply: fallbackText,
      action: "error",
      requiresConfirmation: false,
    };
  }

  const obj = parsed as Record<string, unknown>;
  const cartActions = parseCartActions(obj.cartActions);

  return {
    ...(obj as AiOrderResponse),
    cartActions: cartActions.length ? cartActions : undefined,
    cart:
      obj.cart && typeof obj.cart === "object"
        ? (obj.cart as AiOrderResponse["cart"])
        : undefined,
    suggestions: Array.isArray(obj.suggestions)
      ? (obj.suggestions as AiOrderResponse["suggestions"])
      : undefined,
  };
}

export function pickReplyText(
  response: AiOrderResponse | undefined,
  rawText: string,
  fallbackText: string,
): string {
  const fromObject =
    response?.reply ||
    response?.message ||
    response?.output ||
    response?.text ||
    "";
  if (fromObject.trim()) return fromObject;

  const plainText = rawText?.trim() || "";
  if (plainText && !isLikelyJsonText(plainText)) return plainText;

  return fallbackText;
}

function isLikelyJsonText(value: string): boolean {
  const text = value.trim();
  return (
    (text.startsWith("{") && text.endsWith("}")) ||
    (text.startsWith("[") && text.endsWith("]"))
  );
}

/** Line looks like a numbered/bulleted product list entry (Arabic or Western digits). */
function isNumberedOrBulletListLine(line: string): boolean {
  const t = line.trim();
  if (!t) return false;
  return (
    /^[\d\u0660-\u0669]+[\.\-\):：]\s/.test(t) ||
    /^[\d\u0660-\u0669]+\s*[-–—]\s/.test(t) ||
    /^[-*•▪︎]\s/.test(t) ||
    /^(?:اختيار|خيار)\s*[\d\u0660-\u0669]+/i.test(t)
  );
}

function stripListLinesFromReply(text: string): string {
  const lines = text.split(/\r?\n/);
  const kept: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (kept.length > 0 && kept[kept.length - 1] !== "") kept.push("");
      continue;
    }
    if (isNumberedOrBulletListLine(trimmed)) continue;
    kept.push(line);
  }

  return kept
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stripInlineNumberedItems(text: string): string {
  return text
    .replace(
      /(?:^|\s)[\d\u0660-\u0669]+[\.\-\):：]\s*[^\n\d\u0660-\u0669]+(?=\s*[\d\u0660-\u0669]+[\.\-\):：]|$)/g,
      " ",
    )
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Extract numeric ids from raw n8n suggestions for reply cleanup. */
export function extractSuggestionIdsFromRaw(
  raw: unknown[] | undefined,
): number[] {
  if (!raw?.length) return [];
  const ids: number[] = [];
  const seen = new Set<number>();
  for (const entry of raw) {
    let id: number | null = null;
    if (typeof entry === "number" && Number.isInteger(entry) && entry > 0) {
      id = entry;
    } else if (typeof entry === "string" && entry.trim()) {
      const parsed = Number(entry.trim());
      if (Number.isInteger(parsed) && parsed > 0) id = parsed;
    } else if (entry && typeof entry === "object") {
      const row = entry as Record<string, unknown>;
      const candidate =
        row.itemId != null
          ? Number(row.itemId)
          : row.id != null
            ? Number(row.id)
            : NaN;
      if (Number.isInteger(candidate) && candidate > 0) id = candidate;
    }
    if (id != null && !seen.has(id)) {
      seen.add(id);
      ids.push(id);
    }
  }
  return ids;
}

function stripSuggestionIdsFromReply(
  text: string,
  suggestionIds: readonly number[],
): string {
  let result = text;

  // e.g. زي: ["211", "227", "233"] or [211, 227, 233]
  result = result.replace(
    /(?:زي|مثل|مثلاً|مثلا|ids?|item\s*ids?|الأرقام|أرقام|رقم)\s*[:：]?\s*\[[^\]]*\]/gi,
    "",
  );
  result = result.replace(/\[(?:\s*["']?\d+["']?\s*,?)+\s*\]/g, "");

  for (const id of suggestionIds) {
    result = result.replace(new RegExp(`["']?${id}["']?`, "g"), "");
  }

  return result
    .replace(/[،,]\s*[،,]+/g, ",")
    .replace(/\(\s*\)/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/[:：]\s*$/gm, "")
    .trim();
}

function removeSuggestionNamesFromReply(
  text: string,
  suggestionNames: readonly string[],
): string {
  let result = text;
  const sorted = [...suggestionNames]
    .map((n) => n.trim())
    .filter((n) => n.length >= 2)
    .sort((a, b) => b.length - a.length);

  for (const name of sorted) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(new RegExp(escaped, "gi"), "");
  }

  return result
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function looksLikeProductList(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;

  const lines = trimmed.split(/\r?\n/).filter((l) => l.trim());
  const listLineCount = lines.filter((l) => isNumberedOrBulletListLine(l)).length;
  if (listLineCount >= 2) return true;
  if (listLineCount >= 1 && lines.length <= listLineCount + 1) return true;

  const numberedMarkers = trimmed.match(
    /[\d\u0660-\u0669]+[\.\-\):：]\s/g,
  );
  return (numberedMarkers?.length ?? 0) >= 2;
}

/**
 * Sanitize reply when suggestion cards are also shown: strip ids/lists, keep general intro.
 * Returns empty only when reply is empty or purely a product list (cards carry the list).
 */
export function compactReplyWhenSuggestionsExist(
  text: string,
  _fallbackText: string,
  suggestionNames: readonly string[] = [],
  suggestionIds: readonly number[] = [],
): string {
  const trimmed = text.trim();
  if (!trimmed) return "";

  let cleaned = stripListLinesFromReply(trimmed);
  cleaned = stripInlineNumberedItems(cleaned);
  if (suggestionIds.length) {
    cleaned = stripSuggestionIdsFromReply(cleaned, suggestionIds);
  }

  const listStartMatch = cleaned.match(
    /(\n\s*[-*•]\s)|(\n\s*[\d\u0660-\u0669]+[\.\-\)]\s)/,
  );
  if (listStartMatch?.index != null) {
    cleaned = cleaned.slice(0, listStartMatch.index).trim();
  }

  if (looksLikeProductList(cleaned) && suggestionNames.length) {
    cleaned = removeSuggestionNamesFromReply(cleaned, suggestionNames);
    cleaned = stripListLinesFromReply(cleaned);
    cleaned = stripInlineNumberedItems(cleaned);
    if (suggestionIds.length) {
      cleaned = stripSuggestionIdsFromReply(cleaned, suggestionIds);
    }
  }

  if (cleaned.trim()) return cleaned.trim();

  if (!looksLikeProductList(trimmed)) {
    let light = stripListLinesFromReply(trimmed);
    light = stripInlineNumberedItems(light);
    if (suggestionIds.length) {
      light = stripSuggestionIdsFromReply(light, suggestionIds);
    }
    return light.trim();
  }

  return "";
}

export function resolveCartActions(
  response: AiOrderResponse,
): AiCartAction[] {
  return response.cartActions ?? [];
}
