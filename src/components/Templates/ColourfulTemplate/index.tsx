import { Suspense } from "react";
import { useLocale } from "next-intl";
import Navbar from "./Navbar";
import MenuSection from "./MenuSection";
import Footer from "./Footer";
import { useAppSelector } from "@/store/hooks";
import PromoBannerC from "./PromoBannerC";
import ColourfulBackground from "./ColourfulBackground";
import {
  ColourfulThemeProvider,
  COLOURFUL_DEFAULT_PRIMARY,
  COLOURFUL_DEFAULT_SECONDARY,
} from "./ColourfulThemeContext";
import { ENSFixedBanner } from "../components/ENSFixedBanner";
import { menuTemplateFontFamily } from "@/lib/menuTemplateFont";
import { isFreeMenuPlan } from "@/lib/menuPlan";

function ColourfulTemplate() {
  const locale = useLocale();
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);
  const storeMenuItems = useAppSelector((state) => state.menu.menu);
  const storeCategories = useAppSelector((state) => state.menu.categories);
  const menuCustomizations = useAppSelector(
    (state) => state.menu.menuCustomizations,
  );

  const primary =
    menuCustomizations?.primaryColor?.trim() || COLOURFUL_DEFAULT_PRIMARY;
  const secondary =
    menuCustomizations?.secondaryColor?.trim() || COLOURFUL_DEFAULT_SECONDARY;

  return (
    <ColourfulThemeProvider primary={primary} secondary={secondary}>
      <main
        className="colourful-root menu-template font-body relative min-h-screen overflow-x-clip text-stone-900 antialiased scroll-baseooth pt-24 md:pb-0"
        style={
          {
            fontFamily: menuTemplateFontFamily(locale),
            "--colourful-primary": primary,
            "--colourful-secondary": secondary,
          } as React.CSSProperties
        }
      >
        <ColourfulBackground />
        <div className="colourful-root-content">
          <Navbar />
          <PromoBannerC />
          <section
            id="menu"
            className="py-8 md:py-16 max-w-6xl mx-auto px-6"
            aria-labelledby="menu-heading"
          >
            <Suspense fallback={null}>
              <MenuSection
                items={storeMenuItems ?? []}
                categories={storeCategories ?? []}
                currency={menuInfo?.currency || "AED"}
              />
            </Suspense>
          </section>

          <Footer />
          {isFreeMenuPlan(menuInfo?.ownerPlanType) && <ENSFixedBanner />}
        </div>
      </main>
    </ColourfulThemeProvider>
  );
}

export default ColourfulTemplate;
