"use client";

import { Suspense } from "react";
import { useLocale } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import { menuTemplateFontFamily } from "@/lib/menuTemplateFont";
import { sortCategories } from "@/lib/menuCategoryOrder";
import { ENSFixedBanner } from "../components/ENSFixedBanner";
import {
  CoffeeThemeProvider,
  useCoffeeTheme,
} from "./CoffeeThemeContext";
import { CoffeeProvider } from "./CoffeeContext";
import CoffeePaperBackground from "./CoffeePaperBackground";
import Navbar from "./NavBar";
import HeroSection from "./HeroSection";
import PromoBanner from "./PromoBanner";
import CoffeeCategoryTabs from "./CoffeeCategoryTabs";
import ProductGrid from "./ProductGrid";
import Footer from "./Footer";

function RetroCoffeeTemplateContent() {
  const locale = useLocale();
  const menu = useAppSelector((state) => state.menu);
  const menuInfo = menu.menuInfo;
  const storeItems = menu.menu ?? [];
  const storeCategories = sortCategories(menu.categories ?? []);
  const { colors } = useCoffeeTheme();

  return (
    <main
      className="retro-root menu-template font-body relative isolate min-h-screen antialiased"
      style={{
        fontFamily: menuTemplateFontFamily(locale),
        color: colors.text,
      }}
    >
      <CoffeePaperBackground />

      <div className="relative z-[1] flex min-h-screen flex-col">
        <Navbar />
        <HeroSection />
        <PromoBanner />

        <section
          id="menu"
          className="relative mx-auto w-full max-w-6xl flex-1 scroll-mt-[var(--retro-nav-offset)] px-3 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] pt-2 sm:px-6 sm:pb-20 sm:pt-3"
        >
          <CoffeeCategoryTabs categories={storeCategories} />
          <Suspense fallback={null}>
            <ProductGrid
              items={storeItems}
              categories={storeCategories}
              currency={menuInfo?.currency || "AED"}
            />
          </Suspense>
        </section>

        <Footer />
        {menuInfo?.ownerPlanType === "free" && <ENSFixedBanner />}
      </div>
    </main>
  );
}

function RetroCoffeeTemplate() {
  return (
    <CoffeeThemeProvider>
      <CoffeeProvider>
        <RetroCoffeeTemplateContent />
      </CoffeeProvider>
    </CoffeeThemeProvider>
  );
}

export default RetroCoffeeTemplate;
