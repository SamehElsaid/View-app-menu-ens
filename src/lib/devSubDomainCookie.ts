export const DEV_SUB_DOMAIN_COOKIE_KEY = "ens_dev_sub_domain";

export const DEV_SUB_DOMAIN_COOKIE_DAYS = 365;

export function sanitizeDevSubDomain(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^["']|["']$/g, "")
    .replace(/[^a-z0-9-]/g, "");
}

export function readDevSubDomainFromDocumentCookie(): string | undefined {
  if (typeof document === "undefined") return undefined;

  const entry = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${DEV_SUB_DOMAIN_COOKIE_KEY}=`));

  if (!entry) return undefined;

  const value = decodeURIComponent(entry.split("=")[1] || "");
  const sanitized = sanitizeDevSubDomain(value);
  return sanitized || undefined;
}

export function writeDevSubDomainToCookie(subdomain: string): void {
  const sanitized = sanitizeDevSubDomain(subdomain);
  if (!sanitized) return;

  const expires = new Date(
    Date.now() + DEV_SUB_DOMAIN_COOKIE_DAYS * 24 * 60 * 60 * 1000,
  );

  document.cookie = `${DEV_SUB_DOMAIN_COOKIE_KEY}=${encodeURIComponent(
    sanitized,
  )}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
}
