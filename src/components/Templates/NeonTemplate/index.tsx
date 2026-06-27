import { useAppSelector } from "@/store/hooks";
import { Suspense } from "react";
import { useLocale } from "next-intl";
import { Navbar } from "./NavBar";
import { HeroSection } from "./HeroSection";
import { Footer } from "./Footer";
import { ENSFixedBanner } from "../components/ENSFixedBanner";
import { menuTemplateFontFamily } from "@/lib/menuTemplateFont";

function NeonTemplate() {
  const locale = useLocale();
  const menu = useAppSelector((state) => state.menu);

  const primaryColor = menu?.menuCustomizations?.primaryColor || "#14b8a6";
  const secondaryColor = menu?.menuCustomizations?.secondaryColor || "#06b6d4";

  return (
    <main
      className="menu-template font-body min-h-screen bg-white dark:bg-slate-950"
      style={{ fontFamily: menuTemplateFontFamily(locale) }}
    >
      <Navbar
        menuName={menu?.menuInfo?.name}
        logo={menu?.menuInfo?.logo ?? undefined}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      />

      <Suspense fallback={null}>
        <HeroSection
          menuData={menu || null}
          customizations={menu?.menuCustomizations || {}}
        />
      </Suspense>
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
      {menu?.menuInfo?.ownerPlanType === "free" && <ENSFixedBanner />}
    </main>
  );
}

export default NeonTemplate;
