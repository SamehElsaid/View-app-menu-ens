import Navbar from "./Navbar";
import MenuSection from "./MenuSection";
import Footer from "./Footer";
import { useAppSelector } from "@/store/hooks";
import PromoBannerE from "./PromoBannerE";
import {
  EmeraldThemeProvider,
  EMERALD_DEFAULT_PRIMARY,
  EMERALD_DEFAULT_SECONDARY,
} from "./EmeraldThemeContext";

function EmeraldTemplate() {
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);
  const storeMenuItems = useAppSelector((state) => state.menu.menu);
  const storeCategories = useAppSelector((state) => state.menu.categories);
  const menuCustomizations = useAppSelector(
    (state) => state.menu.menuCustomizations,
  );

  const primary =
    menuCustomizations?.primaryColor?.trim() || EMERALD_DEFAULT_PRIMARY;
  const secondary =
    menuCustomizations?.secondaryColor?.trim() || EMERALD_DEFAULT_SECONDARY;

  return (
    <EmeraldThemeProvider primary={primary} secondary={secondary}>
      <main className="min-h-screen bg-[#fafaf9] text-stone-900 antialiased scroll-smooth  pt-24  md:pb-0">
        <Navbar />
        <PromoBannerE />
        <section
          id="menu"
          className="py-8 md:py-16 max-w-6xl mx-auto px-6"
          aria-labelledby="menu-heading"
        >
          <MenuSection
            items={storeMenuItems ?? []}
            categories={storeCategories ?? []}
            currency={menuInfo?.currency || "AED"}
          />
        </section>

        <Footer />
      </main>
    </EmeraldThemeProvider>
  );
}

export default EmeraldTemplate;
