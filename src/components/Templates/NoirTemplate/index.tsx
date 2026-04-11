import Navbarn from "./Navbarn";
import MenuSectionn from "./MenuSectionn";
import Footern from "./Footern";
import { useAppSelector } from "@/store/hooks";
import PromoBannerN from "./PromoBannerN";
import BackgroundLayers from "./BackgroundLayers";
import HeroN from "./HeroN";
import {
  NoirThemeProvider,
  NOIR_DEFAULT_PRIMARY,
  NOIR_DEFAULT_SECONDARY,
} from "./NoirThemeContext";

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

  return (
    <NoirThemeProvider primary={primary} secondary={secondary}>
      <main className="bg-[#141422] text-text-primary min-h-screen" style={{ fontFamily: '"DM Sans", sans-serif' }}>
      <BackgroundLayers />
      <Navbarn />
        <HeroN />
        <PromoBannerN />
        <section id="menu" className="py-24 px-8 max-w-[1200px] mx-auto relative z-10">
        <MenuSectionn
          items={storeMenuItems ?? []}
          categories={storeCategories ?? []}
          currency={menuInfo?.currency || "AED"}
        />
        </section>
        <Footern/>
      </main>
    </NoirThemeProvider>
  );
}

export default NoirTemplate;
