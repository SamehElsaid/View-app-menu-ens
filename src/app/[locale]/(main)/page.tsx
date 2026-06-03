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
import { useTableCartAllowed } from "@/hooks/useTableCartAllowed";
import LoadImage from "@/components/ImageLoad";
import MusicTemplate from "@/components/Templates/MusicTemplate";
import Arcane from "@/components/Templates/Arcane";

export default function Page() {
  const menu = useAppSelector((state) => state.menu);
  const locale = useLocale();
  const tableCartAllowed = useTableCartAllowed();

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
      ) : (
        <>
          {menu.theme === "default" && <Default />}
          {menu.theme === "sky" && <SkyTemplate />}
          {menu.theme === "neon" && <NeonTemplate />}
          {menu.theme === "coffee" && <CoffeeTemplate />}
          {/* {menu.theme === "emerald" && <EmeraldTemplate />} */}
          {menu.theme === "noir" && <NoirTemplate />}
          {(menu.theme === "oceanic" || menu.theme === "arcane") && (
                <Arcane />
              )}
          {menu.theme === "emerald" && <MusicTemplate />}
          {tableCartAllowed ? (
            <Suspense fallback={null}>
              <RequestStaffButton />
            </Suspense>
          ) : null}
        </>
      )}
    </main>
  );
}
