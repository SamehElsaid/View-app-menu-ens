"use client";

import { RETRO_CREAM } from "./CoffeeThemeContext";

const RETRO_BG_DESKTOP = "/images/bg/retro.png";
const RETRO_BG_MOBILE = "/images/bg/retroM.png";

export default function CoffeePaperBackground() {
  return (
    <>
  
      <div
        className="retro-page-bg retro-page-bg--mobile pointer-events-none fixed inset-0 z-0 md:hidden"
        style={{
          backgroundColor: RETRO_CREAM,
          backgroundImage: `url(${RETRO_BG_MOBILE})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "100% 100%",
        }}
        aria-hidden
      />

      <div
        className="retro-page-bg retro-page-bg--desktop pointer-events-none fixed inset-0 z-0 hidden md:block"
        style={{
          backgroundColor: RETRO_CREAM,
          backgroundImage: `url(${RETRO_BG_DESKTOP})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "cover",
        }}
        aria-hidden
      />
    </>
  );
}
