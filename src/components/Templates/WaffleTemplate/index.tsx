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
import VanillaFooter from "../VanillaTemplate/Footer";
import VanillaSocialSection from "../VanillaTemplate/SocialSection";
import NavBar from "./NavBar";
import MenuSection from "./MenuSection";
import { WaffleBackgroundDecor } from "./WaffleDecorations";

const WAFFLE_GOLD = "#b8893a";

function WaffleTemplateContent() {
  const locale = useLocale();
  const menu = useAppSelector((state) => state.menu);
  const menuInfo = menu.menuInfo;
  const storeCategories = sortCategories(menu.categories ?? []);

  return (
    <main
      className="waffle-root menu-template font-body relative min-h-screen w-full overflow-x-hidden bg-[#1a0533] antialiased"
      style={
        {
          fontFamily: menuTemplateFontFamily(locale),
          backgroundImage:
            "radial-gradient(ellipse 120% 80% at 50% -10%, #5a189a 0%, #3c096c 28%, #240046 58%, #1a0533 100%)",
          "--vanilla-gold": WAFFLE_GOLD,
        } as CSSProperties
      }
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <WaffleBackgroundDecor />

      <div className="relative z-10 mx-auto w-full px-3.5 pb-8 pt-0 sm:px-4">
        <NavBar />

        <div className="mt-1">
          <Suspense fallback={null}>
            <MenuSection
              categories={storeCategories}
              currency={menuInfo?.currency || "EGP"}
            />
          </Suspense>
        </div>

        <WorkingHoursSection />

        <VanillaSocialSection />

        <MenuFooterGate>
          <VanillaFooter />
        </MenuFooterGate>
      </div>

      {menuInfo?.ownerPlanType === "free" && <ENSFixedBanner />}
    </main>
  );
}

export default function WaffleTemplate() {
  const { primary, secondary } = useOneCardThemeFromStore();

  return (
    <OneCardThemeProvider primary={primary} secondary={secondary}>
      <WaffleTemplateContent />
    </OneCardThemeProvider>
  );
}
