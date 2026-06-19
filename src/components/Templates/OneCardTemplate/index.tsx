"use client";

import { Suspense } from "react";
import { useLocale } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import { menuTemplateFontFamily } from "@/lib/menuTemplateFont";
import { sortCategories } from "@/lib/menuCategoryOrder";
import { ENSFixedBanner } from "../components/ENSFixedBanner";
import AdVBanner from "../components/AdBanner";
import {
  OneCardThemeProvider,
  hexToRgba,
  useOneCardThemeFromStore,
} from "./OneCardThemeContext";
import NavBar from "./NavBar";
import HeaderLogo from "./HeaderLogo";
import MenuSection from "./MenuSection";
import Footer from "./Footer";

function OneCardTemplateContent() {
  const locale = useLocale();
  const menu = useAppSelector((state) => state.menu);
  const menuInfo = menu.menuInfo;
  const storeItems = menu.menu ?? [];
  const storeCategories = sortCategories(menu.categories ?? []);
  const { primary, secondary } = useOneCardThemeFromStore();

  return (
    <main
      className="onecard-root menu-template font-body relative min-h-screen antialiased"
      style={{
        fontFamily: menuTemplateFontFamily(locale),
        background: `linear-gradient(160deg, ${primary} 0%, ${secondary} 55%, ${hexToRgba(
          secondary,
          0.92,
        )} 100%)`,
        backgroundAttachment: "fixed",
      }}
    >
      <div className="mx-auto flex w-full  flex-col px-3   sm:px-4">
        <NavBar />
        <HeaderLogo />

        <div className="overflow-hidden rounded-[6rem] bg-white px-2 pb-5 pt-16 shadow-[0_24px_70px_-28px_rgba(0,0,0,0.55)] sm:px-3 sm:pt-20">
          {/* <AdVBanner compact /> */}
          <Suspense fallback={null}>
            <MenuSection
              items={storeItems}
              categories={storeCategories}
              currency={menuInfo?.currency || "EGP"}
            />
          </Suspense>
        </div>

        <Footer />
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
