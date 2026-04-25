import MenuSectionO from "./MenuSectionO";
import FooterO from "./FooterO";
import PromoBannerOceanic from "./PromoBannerOceanic";
import HeaderO from "./HeaderO";
import HeroO from "./HeroO";
import Bubbles from "./Bubbles";

export default function OceanicTemplate() {
  return (
    <main className="oceanic-root min-h-screen bg-background relative overflow-x-hidden font-arabic">
      <Bubbles />
      <HeaderO />
      <HeroO />
      <PromoBannerOceanic />
      <MenuSectionO />
      <FooterO />
    </main>
  );
}
