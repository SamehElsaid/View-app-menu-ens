"use client";

import { Suspense, useEffect } from "react";
import { useLocale } from "next-intl";
import Navbar from "./Navbar";
import Hero from "./Hero";
import Menu from "./Menu";
import Footer from "./Footer";
import { useAppSelector } from "@/store/hooks";
import {
  ArcaneThemeProvider,
  ARCANE_DEFAULT_PRIMARY,
  ARCANE_DEFAULT_SECONDARY,
} from "./ArcaneThemeContext";
import { ENSFixedBanner } from "../components/ENSFixedBanner";
import { menuTemplateFontFamily } from "@/lib/menuTemplateFont";

function ArcaneTemplate() {
  const locale = useLocale();
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);
  const storeMenuItems = useAppSelector((state) => state.menu.menu);
  const storeCategories = useAppSelector((state) => state.menu.categories);
  const menuCustomizations = useAppSelector(
    (state) => state.menu.menuCustomizations,
  );

  const primary =
    menuCustomizations?.primaryColor?.trim() || ARCANE_DEFAULT_PRIMARY;
  const secondary =
    menuCustomizations?.secondaryColor?.trim() || ARCANE_DEFAULT_SECONDARY;

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.body.classList.add("arcane-theme");
    try {
      localStorage.setItem("theme", "light");
    } catch {
      /* ignore storage errors */
    }

    const observer = new MutationObserver(() => {
      if (document.documentElement.classList.contains("dark")) {
        document.documentElement.classList.remove("dark");
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
      document.body.classList.remove("arcane-theme");
    };
  }, []);

  return (
    <ArcaneThemeProvider primary={primary} secondary={secondary}>
      <main
        className="arcane-root menu-template relative z-10 min-h-screen overflow-x-clip scroll-smooth bg-white font-body text-[#111111] antialiased md:pb-0"
        style={{ fontFamily: menuTemplateFontFamily(locale) }}
      >
        <Navbar />
        <Hero />
        <Suspense fallback={null}>
          <Menu
            items={storeMenuItems ?? []}
            categories={storeCategories ?? []}
            currency={menuInfo?.currency || "AED"}
          />
        </Suspense>
        <Footer />
        {menuInfo?.ownerPlanType === "free" && <ENSFixedBanner />}
      </main>
    </ArcaneThemeProvider>
  );
}

export default ArcaneTemplate;
