import Header from "@/components/Global/Header";
import UseDispatchMenu from "@/hooks/UseDispatchMenu";
import { resolveMenuSlug } from "@/lib/menuSlug";
import { serverGet } from "@/shared/serverApi";
import { MenuItem, MenuInfo, MenuCustomizations, Category } from "@/types/menu";
import { Ad } from "@/types/Ad";
import { headers } from "next/headers";
import { Metadata } from "next";

type MenuResponse = {
  menu: MenuInfo;
  items: MenuItem[];
  ads: Ad[];
  customizations: MenuCustomizations | null;
  categories: Category[];
};

const getMenu = async (locale: string) => {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const { slug, devMode, configuredSlug, hostname } = resolveMenuSlug(host);

  const response = await serverGet<{ data: MenuResponse }>(
    `/public/menu/${slug}`,
    locale,
  );

  const menuData = response.status ? response?.data?.data ?? null : null;

  // #region agent log
  fetch("http://127.0.0.1:7773/ingest/063f37bd-1e27-42ea-99bc-275a715baf43", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "2f5282",
    },
    body: JSON.stringify({
      sessionId: "2f5282",
      hypothesisId: "H1-H2",
      location: "layout.tsx:getMenu",
      message: "server menu fetch",
      data: {
        host,
        hostname,
        configuredSlug: configuredSlug ?? null,
        devMode,
        slug,
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL ?? null,
        apiOk: response.status,
        httpStatus: response.httpStatus ?? null,
        fetchError: response.fetchError ?? null,
        hasMenu: Boolean(menuData?.menu),
        theme: menuData?.menu?.theme ?? null,
        itemCount: menuData?.items?.length ?? 0,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return menuData;
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const lang = locale === "ar" ? "ar" : "en";
  const defaults = defaultMetadata[lang] ?? defaultMetadata.ar;
  const data = await getMenu(locale);
  const title = data?.menu?.name ?? defaults.title;
  const description = data?.menu?.description ?? defaults.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      locale: lang === "ar" ? "ar_SA" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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
