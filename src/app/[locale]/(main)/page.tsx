"use client";

import { Suspense, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import RequestStaffButton from "@/components/Global/RequestStaffButton";
import DeliveryLocationModal from "@/components/Global/DeliveryLocationModal";
import MenuGeoRedirect from "@/components/Global/MenuGeoRedirect";
import OrderChatbotGate from "@/components/Global/OrderChatbotGate";
import { useTableCartAllowed } from "@/hooks/useTableCartAllowed";
import { useMenuTableParam } from "@/hooks/useMenuTableParam";
import MaintenanceView from "@/components/Global/MaintenanceView";
import MenuNotFoundView from "@/components/Global/MenuNotFoundView";
import { MenuLogoFallbackProvider } from "@/context/menuLogoFallbackContext";
import { axiosGet } from "@/shared/axiosCall";
import StripInvalidTableParam from "@/components/Global/StripInvalidTableParam";
import StripLegacyDeliveryParams from "@/components/Global/StripLegacyDeliveryParams";
import { templates } from "@/shared/theme.config";
import { hasTableSessionInSearch } from "@/lib/menuTable";

const menuViewRequests = new Map<string, Promise<boolean>>();

export default function Page() {
  const menu = useAppSelector((state) => state.menu);
  const locale = useLocale();
  const searchParams = useSearchParams();
  const tableParam = useMenuTableParam();
  const tableCartAllowed = useTableCartAllowed();
  const delivery = useAppSelector((s) => s.menu.delivery);
  const hasTableSession = hasTableSessionInSearch(searchParams);

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

  if (menu.menuInfo?.isActive === false) {
    return (
      <MaintenanceView
        name={menu.menuInfo?.name ?? ""}
        logo={menu.menuInfo?.logo ?? null}
      />
    );
  }

  return (
    <main className="menu-template font-body">
      <MenuLogoFallbackProvider logo={menu.menuInfo?.logo ?? null}>
        <Suspense fallback={null}>
          <StripLegacyDeliveryParams />
          <StripInvalidTableParam />
        </Suspense>

        {renderTemplate(menu.theme ?? "", Boolean(menu?.menu))}

        {!tableParam ? (
          <Suspense fallback={null}>
            <MenuGeoRedirect />
          </Suspense>
        ) : null}
        {tableCartAllowed || delivery?.deliveryOn ? (
          <Suspense fallback={null}>
            <RequestStaffButton />
          </Suspense>
        ) : null}
        {delivery?.deliveryOn && !tableParam ? (
          <Suspense fallback={null}>
            <DeliveryLocationModal />
          </Suspense>
        ) : null}
        <OrderChatbotGate />
      </MenuLogoFallbackProvider>
    </main>
  );
}

const renderTemplate = (theme: string, showTemplates: boolean) => {
  if (!showTemplates) return <MenuNotFoundView />;

  const Template = templates[theme];

  return Template ? <Template /> : theme ? <templates.default /> : null;
};
