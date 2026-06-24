"use client";

import LoadImage from "@/components/ImageLoad";
import { useAppSelector } from "@/store/hooks";
import { hexToRgba, useOneCardTheme } from "./OneCardThemeContext";
import styles from "./HeaderLogo.module.css";

export default function HeaderLogo() {
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);
  const { primary } = useOneCardTheme();
  const displayName = menuInfo?.name?.trim() ?? "";

  if (!menuInfo?.logo && !displayName) return null;

  return (
    <div className="relative z-20 -mb-14 flex justify-center sm:-mb-16">
      <div className="relative -mt-8 h-40 w-40">
        <div
          className={`${styles.borderRingDelayed} pointer-events-none absolute -inset-2 z-20 rounded-full border-2 border-solid`}
          style={{ borderColor: hexToRgba(primary, 0.55) }}
          aria-hidden
        />
        <div
          className={`${styles.borderRing} pointer-events-none absolute inset-0 z-20 rounded-full border-[3px] border-solid border-white`}
          aria-hidden
        />
        <div className="relative z-10 h-full w-full overflow-hidden rounded-full shadow-[0_16px_40px_-12px_rgba(0,0,0,0.45)]">
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
    </div>
  );
}
