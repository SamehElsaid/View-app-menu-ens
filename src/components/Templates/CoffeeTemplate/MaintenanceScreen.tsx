"use client";

import { useLocale } from "next-intl";
import { MdOutlineBuild } from "react-icons/md";
import { menuTemplateFontFamily } from "@/lib/menuTemplateFont";
import Navbar from "./NavBar";

type Props = {
  name: string;
  logo?: string | null;
};

export default function CoffeeMaintenanceScreen({ name, logo }: Props) {
  const locale = useLocale();
  const displayName = name.trim() || (locale === "ar" ? "قائمتنا" : "Our Menu");

  return (
    <main
      className="menu-template font-body min-h-screen bg-[#17120F] flex flex-col"
      style={{ fontFamily: menuTemplateFontFamily(locale) }}
    >
      <Navbar
        menuName={displayName}
        menuLogo={logo ?? undefined}
      />

      <div className="flex flex-1 items-center justify-center px-6 py-24">
        <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-[#3B332E] bg-[#1E1712] shadow-xl">
          <div className="h-1 bg-linear-to-r from-[#F2B705] via-[#D4A017] to-[#F2B705]" />

          <div className="flex flex-col items-center px-8 pb-10 pt-8 text-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2A2118] text-[#F2B705]">
              <MdOutlineBuild className="text-3xl" aria-hidden />
            </div>

            <div className="flex flex-col gap-1.5">
              <h2 className="text-lg font-bold tracking-tight text-[#F2B705]">
                {displayName}
              </h2>
              <p className="text-sm text-[#B6AA99]">
                {locale === "ar"
                  ? "الموقع تحت الصيانة، سنعود قريباً"
                  : "Site under maintenance, we'll be back soon"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
