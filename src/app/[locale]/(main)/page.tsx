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
import RequestStaffButton from "@/components/Global/RequestStaffButton";
import OrderChatbotGate from "@/components/Global/OrderChatbotGate";
import { useTableCartAllowed } from "@/hooks/useTableCartAllowed";
import LoadImage from "@/components/ImageLoad";

export default function Page() {
  const menu = useAppSelector((state) => state.menu);
  const locale = useLocale();
  const tableCartAllowed = useTableCartAllowed();

  useEffect(() => {
    // #region agent log
    fetch("http://127.0.0.1:7773/ingest/063f37bd-1e27-42ea-99bc-275a715baf43", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "2f5282",
      },
      body: JSON.stringify({
        sessionId: "2f5282",
        hypothesisId: "H3-H4",
        location: "page.tsx:client",
        message: "redux menu state",
        data: {
          theme: menu.theme,
          hasMenuInfo: Boolean(menu.menuInfo),
          menuActive: menu.menuInfo?.isActive,
          itemCount: menu.menu?.length ?? 0,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, [menu.theme, menu.menuInfo, menu.menu]);

  const showTemplates =
    menu.menuInfo?.isActive !== false && Boolean(menu.theme);

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
        <>
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
        </>
      ) : (
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 text-center shadow-md space-y-3">
            <h1 className="text-lg font-bold text-zinc-800">
              {locale === "ar" ? "تعذّر تحميل المنيو" : "Menu could not load"}
            </h1>
            <p className="text-sm text-zinc-600 leading-relaxed">
              {locale === "ar"
                ? "تأكد أن سيرفر الـ API يعمل وأن إعدادات NEXT_PUBLIC_SUB_DOMAIN صحيحة في ملف .env"
                : "Ensure the API server is running and NEXT_PUBLIC_SUB_DOMAIN is set in .env"}
            </p>
          </div>
          <OrderChatbotGate />
        </div>
      )}
    </main>
  );
}
