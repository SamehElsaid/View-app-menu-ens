import DevSubdomainPrompt from "@/components/Global/DevSubdomainPrompt";
import DevSubdomainEditButton from "@/components/Global/DevSubdomainEditButton";
import Header from "@/components/Global/Header";
import UseDispatchMenu from "@/hooks/UseDispatchMenu";
import { DEV_SUB_DOMAIN_COOKIE_KEY } from "@/lib/devSubDomainCookie";
import { resolveMenuItemImageSrc } from "@/lib/menuItemImage";
import { resolveMenuSlug } from "@/lib/menuSlug";
import { serverGet } from "@/shared/serverApi";
import {
  MenuItem,
  MenuInfo,
  MenuCustomizations,
  Category,
  Delivery,
  MenuBranch,
} from "@/types/menu";
import { Ad } from "@/types/Ad";
import { cookies, headers } from "next/headers";
import { Metadata } from "next";
import { resolveBootstrapCatalogMeta } from "@/lib/menuCatalogApi";
import type {
  MenuBootstrapApiEnvelope,
  MenuBootstrapResponse,
} from "@/types/menuBootstrap";

import { cache } from "react";

type MenuCacheEntry = {
  expiresAt: number;
  promise: Promise<MenuBootstrapResponse | null>;
};

const MENU_BOOTSTRAP_CACHE_TTL_MS = 15_000;
const menuRequests = new Map<string, MenuCacheEntry>();

function parseMenuBootstrapPayload(
  body: MenuBootstrapApiEnvelope | MenuBootstrapResponse | undefined,
): MenuBootstrapResponse | null {
  if (!body) return null;
  if ("menu" in body && body.menu) {
    return body as MenuBootstrapResponse;
  }
  if ("data" in body && body.data?.menu) {
    return body.data;
  }
  return null;
}

async function fetchMenu(slug: string, locale: string, forwardQuery: string) {
  const menuApiPath = forwardQuery
    ? `/public/menu/${slug}?${forwardQuery}`
    : `/public/menu/${slug}`;

  const response = await serverGet<MenuBootstrapApiEnvelope | MenuBootstrapResponse>(
    menuApiPath,
    locale,
  );

  if (!response.status) return null;
  return parseMenuBootstrapPayload(response.data);
}

const getMenuBySlug = cache(
  (slug: string, locale: string, forwardQuery: string) => {
    const cacheKey = `${locale}:${slug}:${forwardQuery}`;
    const cached = menuRequests.get(cacheKey);
    const now = Date.now();

    if (cached && cached.expiresAt > now) {
      return cached.promise;
    }

    const promise = fetchMenu(slug, locale, forwardQuery)
      .then((data) => {
        if (!data) {
          menuRequests.delete(cacheKey);
        } else {
          const current = menuRequests.get(cacheKey);
          if (current?.promise === promise) {
            current.expiresAt = Date.now() + MENU_BOOTSTRAP_CACHE_TTL_MS;
          }
        }
        return data;
      })
      .catch(() => {
        menuRequests.delete(cacheKey);
        return null;
      });

    menuRequests.set(cacheKey, {
      expiresAt: Number.POSITIVE_INFINITY,
      promise,
    });

    return promise;
  },
);

const getMenu = async (locale: string) => {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const cookieStore = await cookies();
  const cookieSubdomain = cookieStore.get(DEV_SUB_DOMAIN_COOKIE_KEY)?.value;
  const { slug, needsDevSubdomain } = resolveMenuSlug(host, cookieSubdomain);
  const forwardQuery = headersList.get("x-menu-forward-query") ?? "";

  if (needsDevSubdomain || !slug) {
    return null;
  }

  return getMenuBySlug(slug, locale, forwardQuery);
};

const defaultMetadata: Record<string, { title: string; description: string }> =
  {
    en: {
      title: "ENSmenu",
      description:
        "ENSmenu is a platform for creating digital menus for restaurants and cafes",
    },
    ar: {
      title: "ENSmenu",
      description: "ENSmenu منصة لإنشاء القوائم الرقمية للمطاعم والمقاهي",
    },
  };

const DEFAULT_ICON_URL = "/favicon.svg";

function resolveMenuIconUrl(logo: string | null | undefined): string {
  const trimmed = logo?.trim();
  if (!trimmed) {
    return DEFAULT_ICON_URL;
  }
  return resolveMenuItemImageSrc(trimmed);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const lang = locale === "ar" ? "ar" : "en";
  const defaults = defaultMetadata[lang] ?? defaultMetadata.ar;
  const data = await getMenu(locale);
  const iconUrl = resolveMenuIconUrl(data?.menu?.logo);
  const menu = data?.menu;
  const title =
    lang === "ar"
      ? (menu?.nameAr ?? menu?.name ?? null)
      : (menu?.nameEn ?? menu?.name ?? null);
  const description =
    lang === "ar"
      ? (menu?.descriptionAr ?? menu?.description ?? null)
      : (menu?.descriptionEn ?? menu?.description ?? null);

  return {
    title: title ?? defaults.title,
    description: description ?? defaults.description,
    icons: {
      icon: [{ url: iconUrl }],
      shortcut: iconUrl,
      apple: iconUrl,
    },
    openGraph: {
      title: title ?? defaults.title,
      description: description ?? defaults.description,
      locale: lang === "ar" ? "ar_SA" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: title ?? defaults.title,
      description: description ?? defaults.description,
    },
    alternates: {
      languages: {
        ar: "/",
        en: "/en",
      },
    },
  };
}

export default async function MainLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const cookieStore = await cookies();
  const cookieSubdomain = cookieStore.get(DEV_SUB_DOMAIN_COOKIE_KEY)?.value;
  const { needsDevSubdomain, devMode } = resolveMenuSlug(host, cookieSubdomain);
  const data = await getMenu(locale);
  console.log(data);
  const bootstrapCatalog = data?.items
    ? resolveBootstrapCatalogMeta(data.items.length, data.totalItems)
    : null;

  return (
    <>
      {needsDevSubdomain ? <DevSubdomainPrompt locale={locale} /> : null}
      {devMode && !needsDevSubdomain ? (
        <DevSubdomainEditButton locale={locale} />
      ) : null}
      <UseDispatchMenu
        menu={(data?.items as MenuItem[]) ?? null}
        menuInfo={(data?.menu as MenuInfo) ?? null}
        ads={(data?.ads as Ad[]) ?? null}
        menuCustomizations={
          (data?.customizations as MenuCustomizations) ?? null
        }
        categories={(data?.categories as Category[]) ?? null}
        delivery={(data?.delivery as Delivery) ?? null}
        branches={(data?.branches as MenuBranch[]) ?? []}
        catalog={bootstrapCatalog}
      />
      <Header />
      {children}
    </>
  );
}
