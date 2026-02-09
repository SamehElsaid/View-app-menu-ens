import Header from "@/components/Global/Header";
import UseDispatchMenu from "@/hooks/UseDispatchMenu";
import { axiosGet } from "@/shared/axiosCall";
import { MenuItem, MenuInfo, MenuCustomizations, Category } from "@/types/menu";
import { Ad } from "@/types/Ad";

type MenuResponse = {
  menu: MenuInfo;
  items: MenuItem[];
  ads: Ad[];
  customizations: MenuCustomizations | null;
  categories: Category[];
};

const getMenu = async (locale: string) => {
  const slug = process.env.NEXT_PUBLIC_Dev
    ? process.env.NEXT_PUBLIC_SUB_DOMAIN
    : "menu-ar";
  const response = await axiosGet<{ data: MenuResponse }>(`/public/menu/${slug}`, locale)

  if (response.status) {
    return response?.data?.data;
  }
  return null;
};

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
