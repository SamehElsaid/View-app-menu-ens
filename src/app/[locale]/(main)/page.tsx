"use client";

import { Suspense, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import RequestStaffButton from "@/components/Global/RequestStaffButton";
import DeliveryLocationModal from "@/components/Global/DeliveryLocationModal";
import OrderChatbotGate from "@/components/Global/OrderChatbotGate";
import { useTableCartAllowed } from "@/hooks/useTableCartAllowed";
import MenuNotFoundView from "@/components/Global/MenuNotFoundView";
import ThemedMaintenanceView from "@/components/Global/ThemedMaintenanceView";
import { MenuLogoFallbackProvider } from "@/context/menuLogoFallbackContext";
import { axiosGet } from "@/shared/axiosCall";
import StripInvalidTableParam from "@/components/Global/StripInvalidTableParam";
import SkyTemplate from "@/components/Templates/SkyTemplate";
import NeonTemplate from "@/components/Templates/NeonTemplate";
import CoffeeTemplate from "@/components/Templates/CoffeeTemplate";
import EmeraldTemplate from "@/components/Templates/EmeraldTemplate";
import NoirTemplate from "@/components/Templates/NoirTemplate";
import OceanicTemplate from "@/components/Templates/OceanicTemplate";
import PharaonicTemplate from "@/components/Templates/PharaonicTemplate";
import ArcaneTemplate from "@/components/Templates/Arcane";
import MusicTemplate from "@/components/Templates/MusicTemplate";
import RetroCoffeeTemplate from "@/components/Templates/RetroCoffeeTemplate";
import OneCardTemplate from "@/components/Templates/OneCardTemplate";
import { resolveMenuTheme } from "@/lib/resolveMenuTheme";
import VanillaTemplate from "@/components/Templates/VanillaTemplate";
import WaffleTemplate from "@/components/Templates/WaffleTemplate";

const menuViewRequests = new Map<string, Promise<boolean>>();

export default function Page() {
  const menu = useAppSelector((state) => state.menu);
  const locale = useLocale();
  const searchParams = useSearchParams();
  const tableCartAllowed = useTableCartAllowed();
  const delivery = useAppSelector((s) => s.menu.delivery);
  const menuLoaded = useAppSelector((s) => s.menu.menuLoaded);
  const activeTheme = resolveMenuTheme(menu.theme);

  const menuExists = Boolean(menu.menuInfo);
  const menuActive = menu.menuInfo?.isActive !== false;

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
      {!menuLoaded ? null : !menuExists ? (
        <>
          <MenuNotFoundView />
          <OrderChatbotGate />
        </>
      ) : !menuActive ? (
        <ThemedMaintenanceView
          name={menu.menuInfo!.name ?? ""}
          logo={menu.menuInfo!.logo}
          theme={activeTheme}
        />
      ) : (
        <MenuLogoFallbackProvider logo={menu.menuInfo?.logo ?? null}>
          <Suspense fallback={null}>
            <StripInvalidTableParam />
          </Suspense>
          {menu.theme === "sky" ? <SkyTemplate />
            : menu.theme === "neon" ? <NeonTemplate />
              : menu.theme === "coffee" ? <CoffeeTemplate />
                : menu.theme === "emerald" ? <EmeraldTemplate />
                  : menu.theme === "noir" ? <NoirTemplate />
                    : menu.theme === "oceanic" ? <OceanicTemplate />
                      : menu.theme === "pharaonic" ? <PharaonicTemplate />
                        : menu.theme === "arcane" ? <ArcaneTemplate />
                          : menu.theme === "music" ? <MusicTemplate />
                            : menu.theme === "retro" ? <RetroCoffeeTemplate />
                              : menu.theme === "vanilla" ? <VanillaTemplate />
                                : menu.theme === "waffle" ? <WaffleTemplate />
                                  : <OneCardTemplate />}

          {(tableCartAllowed || delivery?.deliveryOn) ? (
            <Suspense fallback={null}>
              <RequestStaffButton />
            </Suspense>
          ) : null}
          {delivery?.deliveryOn && !searchParams.get("table")?.trim() ? (
            <Suspense fallback={null}>
              <DeliveryLocationModal />
            </Suspense>
          ) : null}
          <OrderChatbotGate />
        </MenuLogoFallbackProvider>
      )}
    </main>
  );
}
