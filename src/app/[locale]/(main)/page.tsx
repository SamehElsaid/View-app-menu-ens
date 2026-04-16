"use client";

import { Suspense } from "react";
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

export default function Page() {
  const menu = useAppSelector((state) => state.menu);
  const locale = useLocale();

  return (
    <main>
      {menu.menuInfo?.isActive === false ? (
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-md rounded-xl border bg-white p-6 text-center shadow-md space-y-4">
            {menu.menuInfo.logo && (
              <div className="mb-2 flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={menu.menuInfo.logo}
                  alt={menu.menuInfo.name}
                  className="h-20 w-20 rounded-full object-cover"
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
      ) : (
        <>
          {menu.theme === "default" && <Default />}
          {menu.theme === "sky" && <SkyTemplate />}
          {menu.theme === "neon" && <NeonTemplate />}
          {menu.theme === "coffee" && <CoffeeTemplate />}
          {menu.theme === "emerald" && <EmeraldTemplate />}
          {menu.theme === "noir" && <NoirTemplate />}
          {menu.theme === "oceanic" && <OceanicTemplate />}
          {menu.menuInfo?.ownerPlanType !== "free" &&
            menu.menuInfo?.ownerPlanType !== null && (
              <Suspense fallback={null}>
                <RequestStaffButton />
              </Suspense>
            )}
        </>
      )}
    </main>
  );
}
