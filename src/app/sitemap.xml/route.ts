import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getSitemapMenuSuffix(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITEMAP_MENU_URL?.trim();
  if (fromEnv) return fromEnv.startsWith(".") ? fromEnv : `.${fromEnv}`;
  return ".ensmenu.com";
}

/** Map dev host (e.g. test.localhost:3001) → production menu origin. */
function menuProductionOrigin(request: NextRequest): string {
  const hostHeader = request.headers.get("host") ?? "";
  const hostname = hostHeader.split(":")[0].toLowerCase();

  if (!hostname || hostname === "localhost" || hostname === "www.ensmenu.com") {
    return "https://www.ensmenu.com";
  }

  const suffix = getSitemapMenuSuffix();
  const slug = hostname.endsWith(".localhost")
    ? hostname.slice(0, -".localhost".length)
    : hostname.endsWith(suffix)
      ? hostname.slice(0, -suffix.length)
      : hostname.split(".")[0];

  if (!slug) return "https://www.ensmenu.com";
  return `https://${slug}${suffix}`;
}

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const origin = menuProductionOrigin(request);
  const lastmod = new Date().toISOString().slice(0, 10);
  const ar = `${origin}/`;
  const en = `${origin}/en`;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="${SITEMAP_NS}">
  <url>
    <loc>${escapeXml(ar)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${escapeXml(en)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
