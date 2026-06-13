import { Suspense } from "react";
import { useLocale } from "next-intl";
import Navbar from "./Navbar";
import MenuSection from "./MenuSection";
import Footer from "./Footer";
import { useAppSelector } from "@/store/hooks";
import PromoBannerF from "./PromoBannerF";
import {
  FunnyThemeProvider,
  FUNNY_DEFAULT_PRIMARY,
  FUNNY_DEFAULT_SECONDARY,
} from "./FunnyThemeContext";
import { ENSFixedBanner } from "../components/ENSFixedBanner";
import { menuTemplateFontFamily } from "@/lib/menuTemplateFont";

function FunnyTemplate() {
  const locale = useLocale();
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);
  const storeMenuItems = useAppSelector((state) => state.menu.menu);
  const storeCategories = useAppSelector((state) => state.menu.categories);
  const menuCustomizations = useAppSelector(
    (state) => state.menu.menuCustomizations,
  );

  const primary =
    menuCustomizations?.primaryColor?.trim() || FUNNY_DEFAULT_PRIMARY;
  const secondary =
    menuCustomizations?.secondaryColor?.trim() || FUNNY_DEFAULT_SECONDARY;

  return (
    <FunnyThemeProvider primary={primary} secondary={secondary}>
      <main
        className="funny-root menu-template font-body relative min-h-screen overflow-x-clip text-white antialiased scroll-baseooth pt-24 md:pb-0"
        style={
          {
            fontFamily: menuTemplateFontFamily(locale),
            backgroundColor: secondary,
            "--funny-primary": primary,
            "--funny-secondary": secondary,
          } as React.CSSProperties
        }
      >
        <div className="funny-root-content">
          <Navbar />
          <PromoBannerF />
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
          {menuInfo?.ownerPlanType === "free" && <ENSFixedBanner />}
        </div>
      </main>
    </FunnyThemeProvider>
  );
}

export default FunnyTemplate;
