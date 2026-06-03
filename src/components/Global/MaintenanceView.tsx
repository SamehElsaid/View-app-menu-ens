"use client";

import { useState, type SyntheticEvent } from "react";
import { useLocale } from "next-intl";
import { MdOutlineBuild } from "react-icons/md";
import LoadImage from "@/components/ImageLoad";

type MaintenanceViewProps = {
  name: string;
  logo?: string | null;
};

function nameFontSize(name: string): string {
  if (name.length > 24) return "text-xs";
  if (name.length > 16) return "text-sm";
  if (name.length > 10) return "text-base";
  return "text-xl";
}

export default function MaintenanceView({ name, logo }: MaintenanceViewProps) {
  const locale = useLocale();
  const logoSrc = logo?.trim() || null;
  const [logoFailed, setLogoFailed] = useState(false);
  const showLogo = Boolean(logoSrc) && !logoFailed;
  const displayName = name.trim() || (locale === "ar" ? "قائمتنا" : "Our Menu");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-50 via-white to-zinc-100 px-4 py-10">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xl shadow-zinc-200/60">
        <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />

        <div className="flex flex-col items-center px-8 pb-9 pt-8 text-center">
          {showLogo ? (
            <div className="mb-5 h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-lg ring-2 ring-zinc-100">
              <LoadImage
                src={logoSrc!}
                alt={displayName}
                width={96}
                height={96}
                className="h-full w-full object-cover"
                disableLazy
                useMenuLogoFallback={false}
                onError={(e: SyntheticEvent<HTMLImageElement, Event>) => {
                  setLogoFailed(true);
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          ) : (
            <div
              className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 px-3 shadow-lg ring-4 ring-white"
              aria-label={displayName}
            >
              <span
                className={`font-bold leading-snug text-white ${nameFontSize(displayName)}`}
              >
                {displayName}
              </span>
            </div>
          )}

          {showLogo ? (
            <h1 className="mb-4 text-xl font-bold tracking-tight text-zinc-800">
              {displayName}
            </h1>
          ) : null}

          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <MdOutlineBuild className="text-2xl" aria-hidden />
          </div>

          <p className="text-base font-medium text-zinc-600">
            {locale === "ar" ? "الموقع تحت الصيانة" : "Site under maintenance"}
          </p>
        </div>
      </div>
    </div>
  );
}
