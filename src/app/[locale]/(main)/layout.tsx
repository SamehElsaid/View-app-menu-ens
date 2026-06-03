import Header from "@/components/Global/Header";
import UseDispatchMenu from "@/hooks/UseDispatchMenu";
import { resolveMenuSlug } from "@/lib/menuSlug";
import { serverGet } from "@/shared/serverApi";
import { MenuItem, MenuInfo, MenuCustomizations, Category } from "@/types/menu";
import { Ad } from "@/types/Ad";
import { headers } from "next/headers";
import { Metadata } from "next";
import { cache } from "react";

type MenuResponse = {
  menu: MenuInfo;
  items: MenuItem[];
  ads: Ad[];
  customizations: MenuCustomizations | null;
  categories: Category[];
};

type MenuCacheEntry = {
  expiresAt: number;
  promise: Promise<MenuResponse | null>;
};

const MENU_BOOTSTRAP_CACHE_TTL_MS = 15_000;
const menuRequests = new Map<string, MenuCacheEntry>();

async function fetchMenu(slug: string, locale: string) {
  const response = await serverGet<{ data: MenuResponse }>(
    `/public/menu/${slug}`,
    locale,
  );

  return response.status ? response?.data?.data ?? null : null;
}

const getMenuBySlug = cache((slug: string, locale: string) => {
  const cacheKey = `${locale}:${slug}`;
  const cached = menuRequests.get(cacheKey);
  const now = Date.now();

  if (cached && cached.expiresAt > now) {
    return cached.promise;
  }

  const promise = fetchMenu(slug, locale)
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
});

const getMenu = async (locale: string) => {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const { slug } = resolveMenuSlug(host);

  return getMenuBySlug(slug, locale);
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

  if (trimmed.startsWith("data:")) {
    return trimmed;
  }

  const baseApi = process.env.NEXT_PUBLIC_BASE_URL;
  const baseHost = baseApi?.replace(/\/api\/?$/, "") ?? "";

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    const uploadsIndex = trimmed.indexOf("/uploads/");
    if (uploadsIndex !== -1 && baseHost) {
      return `${baseHost}${trimmed.slice(uploadsIndex)}`;
    }
    return trimmed;
  }

  if (!baseHost) {
    return trimmed;
  }

  if (trimmed.startsWith(baseHost)) {
    return trimmed;
  }

  const normalizedPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${baseHost}${normalizedPath}`;
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

  return {
    title: defaults.title,
    description: defaults.description,
    icons: {
      icon: [{ url: iconUrl }],
      shortcut: iconUrl,
      apple: iconUrl,
    },
    openGraph: {
      title: defaults.title,
      description: defaults.description,
      locale: lang === "ar" ? "ar_SA" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: defaults.title,
      description: defaults.description,
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
  const data = await getMenu(locale);

  return (
    <>
      <UseDispatchMenu
        menu={(data?.items as MenuItem[]) ?? null}
        menuInfo={(data?.menu as MenuInfo) ?? null}
        ads={(data?.ads as Ad[]) ?? null}
        menuCustomizations={
          (data?.customizations as MenuCustomizations) ?? null
        }
        categories={(data?.categories as Category[]) ?? null}
      />
      <Header />
      {children}
    </>
  );
}
