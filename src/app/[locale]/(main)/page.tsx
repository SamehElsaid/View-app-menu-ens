"use client";

import { Suspense, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import Default from "@/components/Templates/Default";
import SkyTemplate from "@/components/Templates/SkyTemplate";
import NeonTemplate from "@/components/Templates/NeonTemplate";
import CoffeeTemplate from "@/components/Templates/CoffeeTemplate";
import EmeraldTemplate from "@/components/Templates/EmeraldTemplate";
import NoirTemplate from "@/components/Templates/NoirTemplate";
import OceanicTemplate from "@/components/Templates/OceanicTemplate";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import RequestStaffButton from "@/components/Global/RequestStaffButton";
import OrderChatbotGate from "@/components/Global/OrderChatbotGate";
import { useTableCartAllowed } from "@/hooks/useTableCartAllowed";
import LoadImage from "@/components/ImageLoad";
import { MenuLogoFallbackProvider } from "@/context/menuLogoFallbackContext";
import LinkTo from "@/components/Global/LinkTo";
import { axiosGet } from "@/shared/axiosCall";

const menuViewRequests = new Map<string, Promise<boolean>>();

export default function Page() {
  const menu = useAppSelector((state) => state.menu);
  const locale = useLocale();
  const searchParams = useSearchParams();
  const tableCartAllowed = useTableCartAllowed();

  const showTemplates =
    menu.menuInfo?.isActive !== false && Boolean(menu.theme);

  useEffect(() => {
    const slug = menu.menuInfo?.slug;

    if (!slug) return;

    const searchParamsString = searchParams.toString();
    const isQrView = searchParams.get("src") === "qr";
    const trackingKey = `${slug}:${searchParamsString}`;

    const trackMenuView = async () => {
      let request = menuViewRequests.get(trackingKey);

      if (!request) {
        request = axiosGet(
          `/public/menu/${slug}/view`,
          locale,
          undefined,
          isQrView ? { qr: true } : undefined,
          true,
        )
          .then((response) => response.status)
          .catch(() => false);

        menuViewRequests.set(trackingKey, request);
      }

      const tracked = await request;

      if (!tracked) {
        menuViewRequests.delete(trackingKey);
        return;
      }
    };

    void trackMenuView();
  }, [locale, menu.menuInfo?.slug, searchParams]);

  return (
    <main className="menu-template font-body">
      {menu.menuInfo?.isActive === false ? (
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-md rounded-xl border bg-white p-6 text-center shadow-md space-y-4">
            {menu.menuInfo.logo && (
              <div className="mb-2 flex justify-center">
                <LoadImage
                  src={menu.menuInfo.logo}
                  alt={menu.menuInfo.name}
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-full object-cover"
                  disableLazy
                />
              </div>
            )}
            <h1 className="text-xl font-bold">{menu.menuInfo.name}</h1>
            <p className="text-base text-gray-700">
              {locale === "ar"
                ? "الموقع تحت الصيانة"
                : "Site under maintenance"}
            </p>
          </div>
        </div>
      ) : showTemplates ? (
        <MenuLogoFallbackProvider logo={menu.menuInfo?.logo ?? null}>
          {menu.theme === "default" && <Default />}
          {menu.theme === "sky" && <SkyTemplate />}
          {menu.theme === "neon" && <NeonTemplate />}
          {menu.theme === "coffee" && <CoffeeTemplate />}
          {menu.theme === "emerald" && <EmeraldTemplate />}
          {menu.theme === "noir" && <NoirTemplate />}
          {menu.theme === "oceanic" && <OceanicTemplate />}
          {tableCartAllowed ? (
            <Suspense fallback={null}>
              <RequestStaffButton />
            </Suspense>
          ) : null}
          <OrderChatbotGate />
        </MenuLogoFallbackProvider>
      ) : (
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 text-center shadow-md space-y-3">
            <h1 className="text-lg font-bold text-zinc-800">
              {locale === "ar"
                ? "هاذا المنيو غير موجود"
                : "This menu is not found"}
            </h1>
            <p className="text-sm text-zinc-600 leading-relaxed">
              {locale === "ar"
                ? " يمكنك حجز من خلال تواصلنا من خلال الرابط التالي"
                : "You can book through our contact link below"}
            </p>
            <LinkTo
              href="https://ensmenu.com/"
              className="text-sm text-zinc-600 leading-relaxed"
            >
              {locale === "ar" ? "ُENSMenu" : "ENSMenu"}
            </LinkTo>
          </div>
          <OrderChatbotGate />
        </div>
      )}
    </main>
  );
}
