"use client";

import NavBar from "./NavBar";
import { globalStyles } from "./style";
import HeroSection from "../components/HeroSection";
import AdVBanner from "../components/AdBanner";
import MenuSection from "./MenuSection";
import Footer from "../components/Footer";
import { ENSFixedBanner } from "../components/ENSFixedBanner";
import { useAppSelector } from "@/store/hooks";

function Default() {
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);

  return (
    <>
      <style jsx global>
        {globalStyles}
      </style>
      <NavBar
        logo={menuInfo?.logo || null}
        menuName={menuInfo?.name || null}
        whatsappUrl={menuInfo?.socialWhatsapp || null}
        whatsapp={menuInfo?.socialWhatsapp || null}
      />
      <HeroSection />
      <AdVBanner />
      <MenuSection currency={menuInfo?.currency || "AED"} />
      <Footer
        workingHours={menuInfo?.workingHours || null}
        menuInfo={menuInfo || null}
      />
      {menuInfo?.ownerPlanType === "free" && <ENSFixedBanner />}
    </>
  );
}

export default Default;
