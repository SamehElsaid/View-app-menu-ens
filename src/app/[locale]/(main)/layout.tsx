import Header from "@/components/Global/Header";
import UseDispatchMenu from "@/hooks/UseDispatchMenu";
import { axiosGet } from "@/shared/axiosCall";
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


  // memos.ensmenu.com
  const subdomain = host.split(".")[0];

  const slug = process.env.NEXT_PUBLIC_Dev
    ? process.env.NEXT_PUBLIC_SUB_DOMAIN
    : subdomain;

  const response = await axiosGet<{ data: MenuResponse }>(
    `/public/menu/${slug}`,
    locale
  );

  if (response.status) {
    return response?.data?.data;
  }
  return null;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const data = await getMenu(locale);
  const menuName = data?.menu?.name;
  return {
    title: menuName || "ENSmenu",
    description: data?.menu?.description || "ENSmenu is a platform for creating digital menus for restaurants and cafes",
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
        menuCustomizations={(data?.customizations as MenuCustomizations) ?? null}
        categories={(data?.categories as Category[]) ?? null}
      />
      <Header />
      {children}
    </>
  );
}
