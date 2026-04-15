import type { CSSProperties } from "react";
import NavBar from "./NavBar";
import MenuSectionn from "./MenuSectionn";
import Footer from "./Footer";
import { useAppSelector } from "@/store/hooks";
import PromoBannerN from "./PromoBannerN";
import BackgroundLayers from "./BackgroundLayers";
import HeroN from "./HeroN";
import {
  NoirThemeProvider,
  NOIR_DEFAULT_PRIMARY,
  NOIR_DEFAULT_SECONDARY,
} from "./NoirThemeContext";
import { ENSFixedBanner } from "../components/ENSFixedBanner";

function NoirTemplate() {
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);
  const storeMenuItems = useAppSelector((state) => state.menu.menu);
  const storeCategories = useAppSelector((state) => state.menu.categories);
  const menuCustomizations = useAppSelector(
    (state) => state.menu.menuCustomizations,
  );

  const primary =
    menuCustomizations?.primaryColor?.trim() || NOIR_DEFAULT_PRIMARY;
  const secondary =
    menuCustomizations?.secondaryColor?.trim() || NOIR_DEFAULT_SECONDARY;

  const mainStyle: CSSProperties = {
    fontFamily: '"DM Sans", sans-serif',
    // Tailwind @theme noir tokens (text-violet, text-cyan, text-lavender, …)
    ["--color-violet" as string]: primary,
    ["--color-cyan" as string]: secondary,
    ["--color-lavender" as string]: `color-mix(in srgb, ${primary} 78%, white)`,
    ["--color-lavender-dim" as string]: `color-mix(in srgb, ${primary} 62%, white)`,
  };

  return (
    <NoirThemeProvider primary={primary} secondary={secondary}>
      <main
        id="top"
        className="bg-[#141422] text-text-primary min-h-screen"
        style={mainStyle}
      >
        <BackgroundLayers />
        <NavBar />
        <HeroN />
        <PromoBannerN />
        <section
          id="menu"
          className="py-24 px-8 max-w-[1200px] mx-auto relative z-10"
        >
          <MenuSectionn
            items={storeMenuItems ?? []}
            categories={storeCategories ?? []}
            currency={menuInfo?.currency || "AED"}
          />
        </section>
        <Footer />
        {menuInfo &&
          (!menuInfo.ownerPlanType ||
            menuInfo.ownerPlanType === "free") && <ENSFixedBanner />}
      </main>
    </NoirThemeProvider>
  );
}

export default NoirTemplate;
