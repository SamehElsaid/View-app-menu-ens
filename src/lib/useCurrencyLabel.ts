"use client";

import { useTranslations } from "next-intl";

/** ISO codes with entries in messages/{locale}.json → currencyISO */
const KNOWN_CODES = new Set([
  "AED",
  "SAR",
  "USD",
  "EUR",
  "GBP",
  "EGP",
  "KWD",
  "QAR",
  "BHD",
  "OMR",
  "IQD",
  "JOD",
  "TRY",
  "MAD",
  "YER",
  "TND",
  "SDG",
  "LBP",
  "DZD",
]);

/**
 * Returns a locale-aware currency label (symbol / name) for `menuInfo.currency` ISO codes.
 * Unknown codes are returned uppercase unchanged.
 */
export function useCurrencyLabel() {
  const t = useTranslations("currencyISO");
  return (raw?: string | null) => {
    const code = (raw ?? "AED").trim().toUpperCase();
    if (code.length < 2) return (raw ?? "").trim();
    if (!KNOWN_CODES.has(code)) return code;
    return t(code);
  };
}
