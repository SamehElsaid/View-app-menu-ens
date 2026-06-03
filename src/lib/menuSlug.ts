/** Host header may include port (e.g. localhost:3001). */
export function hostnameFromHostHeader(host: string): string {
  return (host.split(":")[0] ?? host).trim().toLowerCase();
}

function isDevMenuMode(): boolean {
  const v = process.env.NEXT_PUBLIC_DEV?.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

function readConfiguredMenuSlug(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_SUB_DOMAIN?.trim();
  if (!raw) return undefined;
  return raw.replace(/^["']|["']$/g, "");
}

/**
 * Resolve public menu slug for `/public/menu/:slug`.
 * In dev, always prefer NEXT_PUBLIC_SUB_DOMAIN when set (ignore localhost host).
 */
export function resolveMenuSlug(host: string): {
  slug: string;
  devMode: boolean;
  configuredSlug: string | undefined;
  hostname: string;
} {
  const devMode = isDevMenuMode();
  const configuredSlug = readConfiguredMenuSlug();
  const hostname = hostnameFromHostHeader(host);

  if (devMode && configuredSlug) {
    return { slug: configuredSlug, devMode, configuredSlug, hostname };
  }

  const parts = hostname.split(".");
  const subdomain = parts.length >= 3 ? parts[0]! : hostname;

  if (
    (hostname === "localhost" || hostname === "127.0.0.1") &&
    configuredSlug
  ) {
    return { slug: configuredSlug, devMode, configuredSlug, hostname };
  }

  return { slug: subdomain, devMode, configuredSlug, hostname };
}
