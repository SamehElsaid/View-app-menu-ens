import Header from "@/components/Global/Header";
import UseDispatchMenu from "@/hooks/UseDispatchMenu";
import { axiosGet } from "@/shared/axiosCall";
import { MenuItem } from "@/types/menu";

const getMenu = async (locale: string) => {
  const slug = process.env.NEXT_PUBLIC_Dev
    ? process.env.NEXT_PUBLIC_SUB_DOMAIN
    : "menu-ar";
  const response = await axiosGet<{ data: MenuItem[] }>(`/public/menu/${slug}`, locale)

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
  const menu = await getMenu(locale);

  return (
    <>
      <UseDispatchMenu menu={menu as MenuItem[] | null} />
      <Header />
      {children}

    </>
  );
}
