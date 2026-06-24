import MenuSectionO from "./MenuSectionO";
import FooterO from "./FooterO";
import PromoBannerOceanic from "./PromoBannerOceanic";
import HeaderO from "./HeaderO";
import HeroO from "./HeroO";
import Bubbles from "./Bubbles";
import { useLocale } from "next-intl";
import { menuTemplateFontFamily } from "@/lib/menuTemplateFont";
import { ENSFixedBanner } from "../components/ENSFixedBanner";
import { SET_MENU_INFO } from "@/store/authMenu/authMenu";
import { useAppSelector } from "@/store/hooks";

export default function OceanicTemplate() {
  const locale = useLocale();

  return (
    <main
      className="menu-template font-body oceanic-root min-h-screen bg-background relative overflow-x-hidden"
      style={{ fontFamily: menuTemplateFontFamily(locale) }}
    >
      <HeaderO />
      <HeroO />
      <section className="relative overflow-hidden bg-linear-to-b from-[#f5fcff]/93 via-[#fafefe]/88 to-[#fdfdfd]/85">
        <Bubbles className="absolute inset-0" count={100} variant="section" />
        <div className="relative z-10">
          <PromoBannerOceanic />
          <MenuSectionO />
        </div>
      </section>
      <FooterO />
      {useAppSelector((state) => state.menu.menuInfo)?.ownerPlanType ===
        "free" && <ENSFixedBanner />}
    </main>
  );
}
