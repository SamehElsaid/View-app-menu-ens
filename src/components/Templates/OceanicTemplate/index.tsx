import MenuSectionO from "./MenuSectionO";
import FooterO from "./FooterO";
import PromoBannerOceanic from "./PromoBannerOceanic";
import HeaderO from "./HeaderO";
import HeroO, { OceanicBubbles } from "./HeroO";

export default function OceanicTemplate() {
  return (
    <main className="oceanic-root min-h-screen bg-background relative overflow-hidden font-arabic">
      <OceanicBubbles />
      <HeaderO />
      <HeroO />
      <PromoBannerOceanic />
      <MenuSectionO />
      <FooterO />
    </main>
  );
}
