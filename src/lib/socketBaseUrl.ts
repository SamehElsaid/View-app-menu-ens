/**
 * Socket.IO runs on the same Node process as the REST API (no `/api` path).
 *
 * Prefer `NEXT_PUBLIC_SOCKET_URL` in production (e.g. https://api.ensmenu.com).
 *
 * If `NEXT_PUBLIC_BASE_URL` points at the marketing domain (ensmenu.com) instead
 * of the API subdomain, we remap known apex hosts to `api.*` so WebSocket hits
 * the backend that actually serves Socket.IO.
 */
const API_HOST_BY_SITE_HOST: Record<string, string> = {
  "ensmenu.com": "api.ensmenu.com",
  "www.ensmenu.com": "api.ensmenu.com",
  "ensmenu.ens.eg": "api.ensmenu.ens.eg",
  "www.ensmenu.ens.eg": "api.ensmenu.ens.eg",
};

function remapToApiOrigin(originWithoutApi: string): string {
  try {
    const u = new URL(originWithoutApi);
    const apiHost = API_HOST_BY_SITE_HOST[u.hostname];
    if (apiHost) {
      u.hostname = apiHost;
      return u.origin;
    }
  } catch {
    return originWithoutApi;
  }
  return originWithoutApi;
}

export function getSocketBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SOCKET_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const base = (process.env.NEXT_PUBLIC_BASE_URL || "").trim().replace(/\/$/, "");
  if (!base) return "";

  const withoutApi = base.replace(/\/api\/?$/i, "");
  return remapToApiOrigin(withoutApi);
}
