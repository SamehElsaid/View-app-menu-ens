import MenuSectionO from "./MenuSectionO";
import FooterO from "./FooterO";
import PromoBannerOceanic from "./PromoBannerOceanic";
import HeaderO from "./HeaderO";
import HeroO from "./HeroO";
import Bubbles from "./Bubbles";

export default function OceanicTemplate() {
  return (
    <main className="menu-template-root oceanic-root min-h-screen bg-background relative overflow-x-hidden">
      <Bubbles />
      <HeaderO />
      <HeroO />
      <PromoBannerOceanic />
      <MenuSectionO />
      <FooterO />
    </main>
  );
}
