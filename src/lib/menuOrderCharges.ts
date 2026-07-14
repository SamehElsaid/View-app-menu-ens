export type MenuChargeSettings = {
  taxEnabled?: boolean | null;
  taxPercent?: number | null;
  serviceEnabled?: boolean | null;
  servicePercent?: number | null;
};

export type MenuOrderChargesBreakdown = {
  subtotal: number;
  taxAmount: number;
  serviceAmount: number;
  chargesTotal: number;
  grandTotal: number;
};

function percentOf(base: number, percent: number | null | undefined): number {
  const p = Number(percent);
  if (!Number.isFinite(p) || p <= 0) return 0;
  return Math.round(base * (p / 100) * 100) / 100;
}

/** Apply optional tax/service on subtotal, then optional delivery fee. */
export function applyMenuOrderCharges(
  subtotal: number,
  settings: MenuChargeSettings | null | undefined,
  deliveryFee = 0,
): MenuOrderChargesBreakdown {
  const base = Math.round(Number(subtotal) * 100) / 100 || 0;
  const taxAmount =
    settings?.taxEnabled === true ? percentOf(base, settings.taxPercent) : 0;
  const serviceAmount =
    settings?.serviceEnabled === true
      ? percentOf(base, settings.servicePercent)
      : 0;
  const fee =
    Number.isFinite(Number(deliveryFee)) && Number(deliveryFee) > 0
      ? Number(deliveryFee)
      : 0;
  const chargesTotal = Math.round((taxAmount + serviceAmount) * 100) / 100;
  const grandTotal =
    Math.round((base + chargesTotal + fee) * 100) / 100;

  return {
    subtotal: base,
    taxAmount,
    serviceAmount,
    chargesTotal,
    grandTotal,
  };
}
