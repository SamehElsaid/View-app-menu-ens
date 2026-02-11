import { useAppSelector } from "@/store/hooks";
import React from "react";
import { Navbar } from "./NavBar";
import { HeroSection } from "./HeroSection";
import { Footer } from "./Footer";

function NeonTemplate() {
  const menu = useAppSelector((state) => state.menu);
  const [selectedCategory, setSelectedCategory] = React.useState("all");

  const primaryColor = menu?.menuCustomizations?.primaryColor || "#14b8a6";
  const secondaryColor = menu?.menuCustomizations?.secondaryColor || "#06b6d4";

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar
        menuName={menu?.menuInfo?.name}
        logo={menu?.menuInfo?.logo ?? undefined}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      />

      <HeroSection
        menuData={menu || null}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        customizations={menu?.menuCustomizations || {}}
      />
      <Footer
        menuName={menu?.menuInfo?.name || ""}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        menuLogo={menu?.menuInfo?.logo || ""}
        footerLogo={menu?.menuInfo?.footerLogo || ""}
        footerDescriptionEn={menu?.menuInfo?.footerDescriptionEn || ""}
        footerDescriptionAr={menu?.menuInfo?.footerDescriptionAr || ""}
        socialFacebook={menu?.menuInfo?.socialFacebook || ""}
        socialInstagram={menu?.menuInfo?.socialInstagram || ""}
        socialTwitter={menu?.menuInfo?.socialTwitter || ""}
        socialWhatsapp={menu?.menuInfo?.socialWhatsapp || ""}
        addressEn={menu?.menuInfo?.addressEn || ""}
        addressAr={menu?.menuInfo?.addressAr || ""}
        phone={menu?.menuInfo?.phone || ""}
        workingHours={menu?.menuInfo?.workingHours || undefined}
      />
    </main>
  );
}

export default NeonTemplate;
