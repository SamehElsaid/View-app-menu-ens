"use client";

import { Suspense, type CSSProperties } from "react";
import { useLocale } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import { menuTemplateFontFamily } from "@/lib/menuTemplateFont";
import { sortCategories } from "@/lib/menuCategoryOrder";
import { ENSFixedBanner } from "../components/ENSFixedBanner";
import {
  OneCardThemeProvider,
  useOneCardThemeFromStore,
} from "../OneCardTemplate/OneCardThemeContext";
import WorkingHoursSection from "../OneCardTemplate/WorkingHoursSection";
import MenuFooterGate from "@/components/Global/MenuFooterGate";
import AdVBanner from "@/components/Templates/components/AdBanner";
import NavBar from "./NavBar";
import MenuSection from "./MenuSection";
import SocialSection from "./SocialSection";
import Footer from "./Footer";

const VANILLA_GOLD = "#b8893a";

function VanillaTemplateContent() {
  const locale = useLocale();
  const menu = useAppSelector((state) => state.menu);
  const menuInfo = menu.menuInfo;
  const storeCategories = sortCategories(menu.categories ?? []);

  return (
    <main
      className="vanilla-root menu-template font-body relative min-h-screen w-full overflow-x-hidden bg-[radial-gradient(120%_80%_at_50%_0%,#f3ecfb_0%,#efe6f8_45%,#ece3f6_100%)] antialiased"
      style={
        {
          fontFamily: menuTemplateFontFamily(locale),
          "--vanilla-gold": VANILLA_GOLD,
        } as CSSProperties
      }
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <div className="mx-auto w-full  px-3 pb-10 pt-3 sm:px-4">
        <div className="rounded-[34px] bg-[rgba(255,255,255,0.55)] p-3 shadow-[0_24px_70px_-30px_rgba(70,25,110,0.4)] ring-1 ring-white/60 backdrop-blur-sm sm:p-4 border border-(--vanilla-gold,#b8893a)">
          <NavBar />

          <div className="mt-4">
            <AdVBanner compact />
          </div>

          <div className="mt-4">
            <Suspense fallback={null}>
              <MenuSection
                categories={storeCategories}
                currency={menuInfo?.currency || "EGP"}
              />
            </Suspense>
          </div>

          <WorkingHoursSection />

          <SocialSection />

          <MenuFooterGate>
            <Footer />
          </MenuFooterGate>
        </div>
      </div>

      {menuInfo?.ownerPlanType === "free" && <ENSFixedBanner />}
    </main>
  );
}

export default function VanillaTemplate() {
  const { primary, secondary } = useOneCardThemeFromStore();

  return (
    <OneCardThemeProvider primary={primary} secondary={secondary}>
      <VanillaTemplateContent />
    </OneCardThemeProvider>
  );
}
