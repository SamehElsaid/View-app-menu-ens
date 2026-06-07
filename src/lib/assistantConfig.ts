export const ALLOWED_CONTACT = {
  whatsappUrl: "https://wa.me/971586551491",
} as const;

export function buildWhatsAppUrl(raw: string | null | undefined): string | null {
  const digits = raw?.replace(/[^0-9]/g, "") ?? "";
  return digits ? `https://wa.me/${digits}` : null;
}
