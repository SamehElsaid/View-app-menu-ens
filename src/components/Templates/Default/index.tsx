"use client";

import { Suspense } from "react";
import NavBar from "./NavBar";
import { globalStyles } from "./style";
import HeroSection from "../components/HeroSection";
import AdVBanner from "../components/AdBanner";
import MenuSection from "./MenuSection";
import Footer from "../components/Footer";
import { ENSFixedBanner } from "../components/ENSFixedBanner";
import MenuFooterGate from "@/components/Global/MenuFooterGate";
import { useAppSelector } from "@/store/hooks";
import { CategoryNavProvider } from "./CategoryNavContext";

function Default() {
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);

  return (
    <CategoryNavProvider>
      <div className="menu-template font-body min-h-dvh">
        <style jsx global>
          {globalStyles}
        </style>
        <NavBar
          logo={menuInfo?.logo || null}
          menuName={menuInfo?.name || null}
        />
        <HeroSection compact />
        <AdVBanner compact />
        <Suspense fallback={null}>
          <MenuSection currency={menuInfo?.currency || "AED"} />
        </Suspense>
        <MenuFooterGate>
          <Footer
            workingHours={menuInfo?.workingHours || null}
            menuInfo={menuInfo || null}
          />
        </MenuFooterGate>
        {menuInfo?.ownerPlanType === "free" && <ENSFixedBanner />}
      </div>
    </CategoryNavProvider>
  );
}

export default Default;
