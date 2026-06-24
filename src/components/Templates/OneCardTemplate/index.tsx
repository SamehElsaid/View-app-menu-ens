"use client";

import { Suspense } from "react";
import { useLocale } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import { menuTemplateFontFamily } from "@/lib/menuTemplateFont";
import { sortCategories } from "@/lib/menuCategoryOrder";
import { ENSFixedBanner } from "../components/ENSFixedBanner";
import {
  OneCardThemeProvider,
  useOneCardThemeFromStore,
} from "./OneCardThemeContext";
import NavBar from "./NavBar";
import MenuSection from "./MenuSection";
import WorkingHoursSection from "./WorkingHoursSection";
import Footer from "./Footer";
import MenuFooterGate from "@/components/Global/MenuFooterGate";
import {
  ONECARD_CARD_SHELL,
  ONECARD_CONTENT_INNER,
  ONECARD_PAGE_PADDING,
} from "./OneCardLayout";
import LoadImage from "@/components/ImageLoad";
import AdVBanner from "@/components/Templates/components/AdBanner";

function OneCardTemplateContent() {
  const locale = useLocale();
  const menu = useAppSelector((state) => state.menu);
  const menuInfo = menu.menuInfo;
  const storeCategories = sortCategories(menu.categories ?? []);

  const displayName = menuInfo?.name?.trim() ?? "";
  const showLogo = Boolean(menuInfo?.logo || displayName);

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
        {showLogo ? (
          <div className="absolute left-1/2 top-[-65px] z-100 w-[130px] h-[130px] -translate-x-1/2 pointer-events-none">
            <div className="relative w-full h-full overflow-hidden rounded-full border-8 border-white bg-white shadow-[0_0_10px_0_rgba(0,0,0,0.1)]">
              {menuInfo?.logo ? (
                <LoadImage
                  src={menuInfo.logo}
                  alt={displayName || "Logo"}
                  fill
                  className="object-cover"
                  disableLazy
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 p-4 text-center text-white">
                  <span
                    className="text-[1.35rem] font-bold leading-[1.2] tracking-[0.02em]"
                    aria-hidden
                  >
                    {displayName.slice(0, 2) || "☕"}
                  </span>
                  <span className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] uppercase before:content-[''] before:w-3 before:h-px before:bg-white/75 after:content-[''] after:w-3 after:h-px after:bg-white/75">
                    {displayName || "Cafe"}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : null}
        <div className={`w-full ${ONECARD_CONTENT_INNER}`}>
          <AdVBanner compact />

          <div className={ONECARD_CARD_SHELL}>
            <Suspense fallback={null}>
              <MenuSection
                categories={storeCategories}
                currency={menuInfo?.currency || "EGP"}
              />
            </Suspense>
          </div>

          <WorkingHoursSection />

          <MenuFooterGate>
            <Footer />
          </MenuFooterGate>
        </div>
      </div>

      {menuInfo?.ownerPlanType === "free" && <ENSFixedBanner />}
    </main>
  );
}

function OneCardTemplate() {
  const { primary, secondary } = useOneCardThemeFromStore();

  return (
    <OneCardThemeProvider primary={primary} secondary={secondary}>
      <OneCardTemplateContent />
    </OneCardThemeProvider>
  );
}

export default OneCardTemplate;
