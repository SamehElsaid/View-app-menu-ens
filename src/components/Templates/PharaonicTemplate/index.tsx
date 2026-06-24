import { Suspense } from "react";
import { useLocale } from "next-intl";
import NavBar from "./NavBar";
import HeroP from "./HeroP";
import PromoBannerP from "./PromoBannerP";
import MenuSectionP from "./MenuSectionP";
import FooterP from "./FooterP";
import PharaonicFonts from "./PharaonicFonts";
import PharaonicAmbient from "./PharaonicAmbient";
import PharaonicCursorAura from "./PharaonicCursorAura";
import PharaonicMenuVeil from "./PharaonicMenuVeil";
import PharaonicTouchGlow from "./PharaonicTouchGlow";
import PharaonicMobileFAB from "./PharaonicMobileFAB";
import { useAppSelector } from "@/store/hooks";
import {
  PharaonicThemeProvider,
  PHARAONIC_DEFAULT_PRIMARY,
  PHARAONIC_DEFAULT_SECONDARY,
} from "./PharaonicThemeContext";
import { ENSFixedBanner } from "../components/ENSFixedBanner";
import { menuTemplateFontFamily } from "@/lib/menuTemplateFont";

function PharaonicTemplate() {
  const locale = useLocale();
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);
  const storeMenuItems = useAppSelector((state) => state.menu.menu);
  const storeCategories = useAppSelector((state) => state.menu.categories);
  const menuCustomizations = useAppSelector(
    (state) => state.menu.menuCustomizations,
  );

  const primary =
    menuCustomizations?.primaryColor?.trim() || PHARAONIC_DEFAULT_PRIMARY;
  const secondary =
    menuCustomizations?.secondaryColor?.trim() || PHARAONIC_DEFAULT_SECONDARY;

  return (
    <PharaonicThemeProvider primary={primary} secondary={secondary}>
      <PharaonicFonts />
      <main
        className="pharaonic-root menu-template font-body relative min-h-screen text-[#e8dcc8] antialiased scroll-baseooth"
        style={{
          fontFamily: menuTemplateFontFamily(locale),
          background: "linear-gradient(180deg, #14100c 0%, #0c0a08 100%)",
          ["--ph-cursor-x" as string]: "50%",
          ["--ph-cursor-y" as string]: "40%",
          ["--ph-cursor-opacity" as string]: "0",
          ["--ph-touch-x" as string]: "50%",
          ["--ph-touch-y" as string]: "50%",
          ["--ph-touch-opacity" as string]: "0",
        }}
      >
        <PharaonicAmbient />
        <PharaonicCursorAura />
        <PharaonicTouchGlow />
        <PharaonicMobileFAB />
        <NavBar />
        <HeroP />
        <PromoBannerP />
        <section
          id="menu"
          className="relative z-10 mx-auto max-w-[1200px] px-4 py-16 sm:px-8 md:py-20"
        >
          <PharaonicMenuVeil>
            <Suspense fallback={null}>
              <MenuSectionP
                items={storeMenuItems ?? []}
                categories={storeCategories ?? []}
                currency={menuInfo?.currency || "AED"}
              />
            </Suspense>
          </PharaonicMenuVeil>
        </section>
        <FooterP />
        {menuInfo?.ownerPlanType === "free" && <ENSFixedBanner />}
      </main>
    </PharaonicThemeProvider>
  );
}

export default PharaonicTemplate;
