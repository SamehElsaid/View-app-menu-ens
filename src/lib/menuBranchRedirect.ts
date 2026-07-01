import { isDevMenuMode } from "@/lib/menuSlug";
import {
  sanitizeDevSubDomain,
  readDevSubDomainFromDocumentCookie,
  writeDevSubDomainToCookie,
} from "@/lib/devSubDomainCookie";

/** Navigate to another public menu slug (subdomain or dev cookie). */
export function redirectToMenuSlug(
  targetSlug: string,
  pathname: string,
  search: string,
): void {
  const slug = sanitizeDevSubDomain(targetSlug);
  if (!slug) return;

  const searchPart = search ? `?${search}` : "";
  const pathPart = pathname || "/";
  const hostname = window.location.hostname;
  const parts = hostname.split(".");

  const useCookieRedirect =
    isDevMenuMode() ||
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    parts.length < 3;

  if (useCookieRedirect) {
    writeDevSubDomainToCookie(slug);
    window.location.assign(`${pathPart}${searchPart}`);
    return;
  }

  parts[0] = slug;
  const nextHost = parts.join(".");
  window.location.assign(
    `${window.location.protocol}//${nextHost}${pathPart}${searchPart}`,
  );
}

export function readCurrentMenuSlugFromClient(): string | undefined {
  const hostname = window.location.hostname;
  const parts = hostname.split(".");
  const useCookie =
    isDevMenuMode() ||
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    parts.length < 3;

  if (useCookie) {
    return readDevSubDomainFromDocumentCookie();
  }

  if (parts.length >= 3) {
    return sanitizeDevSubDomain(parts[0] ?? "");
  }

  const envSlug = process.env.NEXT_PUBLIC_SUB_DOMAIN?.trim();
  return envSlug ? sanitizeDevSubDomain(envSlug) : undefined;
}
