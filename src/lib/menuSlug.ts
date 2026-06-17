import { sanitizeDevSubDomain } from "@/lib/devSubDomainCookie";

/** Host header may include port (e.g. localhost:3001). */
export function hostnameFromHostHeader(host: string): string {
  return (host.split(":")[0] ?? host).trim().toLowerCase();
}

export function isDevMenuMode(): boolean {
  const v = process.env.NEXT_PUBLIC_DEV?.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

function readEnvMenuSlug(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_SUB_DOMAIN?.trim();
  if (!raw) return undefined;
  return sanitizeDevSubDomain(raw);
}

function readCookieMenuSlug(cookieSubdomain?: string | null): string | undefined {
  if (!cookieSubdomain) return undefined;
  const sanitized = sanitizeDevSubDomain(cookieSubdomain);
  return sanitized || undefined;
}

/**
 * Resolve public menu slug for `/public/menu/:slug`.
 * In dev, use cookie subdomain (prompt on first visit); ignore localhost host.
 */
export function resolveMenuSlug(
  host: string,
  cookieSubdomain?: string | null,
): {
  slug: string;
  devMode: boolean;
  configuredSlug: string | undefined;
  hostname: string;
  needsDevSubdomain: boolean;
} {
  const devMode = isDevMenuMode();
  const envSlug = readEnvMenuSlug();
  const cookieSlug = readCookieMenuSlug(cookieSubdomain);
  const hostname = hostnameFromHostHeader(host);

  if (devMode) {
    if (cookieSlug) {
      return {
        slug: cookieSlug,
        devMode,
        configuredSlug: cookieSlug,
        hostname,
        needsDevSubdomain: false,
      };
    }

    return {
      slug: "",
      devMode,
      configuredSlug: undefined,
      hostname,
      needsDevSubdomain: true,
    };
  }

  const configuredSlug = envSlug;
  const parts = hostname.split(".");
  const subdomain = parts.length >= 3 ? parts[0]! : hostname;

  if (
    (hostname === "localhost" || hostname === "127.0.0.1") &&
    configuredSlug
  ) {
    return {
      slug: configuredSlug,
      devMode,
      configuredSlug,
      hostname,
      needsDevSubdomain: false,
    };
  }

  return {
    slug: subdomain,
    devMode,
    configuredSlug,
    hostname,
    needsDevSubdomain: false,
  };
}
