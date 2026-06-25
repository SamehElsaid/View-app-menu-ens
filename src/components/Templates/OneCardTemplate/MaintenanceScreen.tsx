"use client";

import { useState, type SyntheticEvent } from "react";
import { useLocale } from "next-intl";
import { MdOutlineBuild } from "react-icons/md";
import { menuTemplateFontFamily } from "@/lib/menuTemplateFont";
import LoadImage from "@/components/ImageLoad";
import {
  OneCardThemeProvider,
  useOneCardThemeFromStore,
} from "./OneCardThemeContext";
import NavBar from "./NavBar";
import {
  ONECARD_CARD_SHELL,
  ONECARD_CONTENT_INNER,
  ONECARD_PAGE_PADDING,
} from "./OneCardLayout";

type Props = {
  name: string;
  logo?: string | null;
};

function OneCardMaintenanceContent({ name, logo }: Props) {
  const locale = useLocale();
  const logoSrc = logo?.trim() || null;
  const [logoFailed, setLogoFailed] = useState(false);
  const showLogo = Boolean(logoSrc) && !logoFailed;
  const displayName = name.trim() || (locale === "ar" ? "قائمتنا" : "Our Menu");

  return (
    <main
      className="relative w-full min-h-screen overflow-x-hidden bg-[linear-gradient(135deg,var(--onecard-secondary,#5a00c2),var(--onecard-primary,#6b0fd6))] onecard-root menu-template font-body antialiased"
      style={{ fontFamily: menuTemplateFontFamily(locale) }}
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <NavBar />

      <div
        className={`relative z-20 pt-[70px] px-5 pb-[30px] bg-[#fdfdfd] rounded-[80px_80px_30px_30px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] max-[380px]:-mt-[52px] max-[380px]:rounded-[60px_60px_24px_24px] ${ONECARD_PAGE_PADDING}`}
      >
        <div className="absolute left-1/2 top-[-65px] z-100 w-[130px] h-[130px] -translate-x-1/2 pointer-events-none">
          <div
            className="relative w-full h-full overflow-hidden rounded-full border-8 border-white bg-white shadow-[0_0_10px_0_rgba(0,0,0,0.1)]"
            style={!showLogo ? { background: "var(--onecard-primary, #6b0fd6)" } : undefined}
          >
            {showLogo ? (
              <LoadImage
                src={logoSrc!}
                alt={displayName}
                fill
                className="object-cover"
                disableLazy
                useMenuLogoFallback={false}
                onError={(e: SyntheticEvent<HTMLImageElement, Event>) => {
                  setLogoFailed(true);
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-white text-2xl font-bold leading-none">
                  {displayName.slice(0, 2)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className={`w-full ${ONECARD_CONTENT_INNER}`}>
          <div className={ONECARD_CARD_SHELL}>
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-500 shadow-sm">
                <MdOutlineBuild className="text-3xl" aria-hidden />
              </div>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-lg font-bold tracking-tight text-zinc-800">
                  {displayName}
                </h2>
                <p className="text-sm text-zinc-500">
                  {locale === "ar"
                    ? "الموقع تحت الصيانة، سنعود قريباً"
                    : "Site under maintenance, we'll be back soon"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function OneCardMaintenanceScreen({ name, logo }: Props) {
  const { primary, secondary } = useOneCardThemeFromStore();

  return (
    <OneCardThemeProvider primary={primary} secondary={secondary}>
      <OneCardMaintenanceContent name={name} logo={logo} />
    </OneCardThemeProvider>
  );
}

export default OneCardMaintenanceScreen;
