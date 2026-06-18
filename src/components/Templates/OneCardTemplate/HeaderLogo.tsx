"use client";

import LoadImage from "@/components/ImageLoad";
import { useAppSelector } from "@/store/hooks";
import { useOneCardTheme } from "./OneCardThemeContext";

export default function HeaderLogo() {
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);
  const { primary } = useOneCardTheme();
  const displayName = menuInfo?.name?.trim() ?? "";

  if (!menuInfo?.logo && !displayName) return null;

  return (
    <div className="relative z-20 -mb-14 flex justify-center sm:-mb-16">
      <div
        className="relative -mt-8 h-28 w-28 overflow-hidden rounded-full border-[3px] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.45)] sm:h-32 sm:w-32"
        style={{ borderColor: primary }}
      >
        {menuInfo?.logo ? (
          <LoadImage
            src={menuInfo.logo}
            alt={displayName || "Logo"}
            fill
            className="object-cover"
            disableLazy
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-2xl font-black text-white">
            {displayName.charAt(0)}
          </div>
        )}
      </div>
    </div>
  );
}
