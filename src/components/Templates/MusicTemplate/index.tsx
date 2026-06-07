"use client";



import { useEffect, useMemo } from "react";

import { useLocale } from "next-intl";

import { useAppSelector } from "@/store/hooks";

import { menuTemplateFontFamily } from "@/lib/menuTemplateFont";

import { ENSFixedBanner } from "../components/ENSFixedBanner";

import { MusicProvider, useMusic } from "./MusicContext";

import { resolveMusicMood } from "./moodEnergy";

import Atmosphere from "./Atmosphere";

import Navbar from "./Navbar";

import Hero from "./Hero";

import PromoBannerMusic from "./PromoBannerMusic";

import Genres from "./Genres";

import Tracks from "./Tracks";
import Footer from "./Footer";



function MusicTemplateContent() {

  const locale = useLocale();

  const menuInfo = useAppSelector((state) => state.menu.menuInfo);

  const storeMenuItems = useAppSelector((state) => state.menu.menu) ?? [];

  const storeCategories = useAppSelector((state) => state.menu.categories) ?? [];

  const { activeCategoryId, activeItem } = useMusic();



  const mood = useMemo(

    () =>

      resolveMusicMood(

        activeCategoryId,

        storeCategories,

        activeItem,

        storeMenuItems,

      ),

    [activeCategoryId, storeCategories, activeItem, storeMenuItems],

  );



  useEffect(() => {

    document.body.classList.add("music-theme");

    return () => document.body.classList.remove("music-theme");

  }, []);



  return (

    <div

      className="music-root menu-template font-body min-h-screen antialiased transition-all duration-300"

      data-mood={mood.atmosphereMood}

      data-category-mood={mood.categoryMood}

      data-product-mood={mood.productMood}

      style={{ ...mood.style, fontFamily: menuTemplateFontFamily(locale) }}

    >

      <Atmosphere mood={mood} />



      <div className="music-shell">

        <header className="music-container music-container--header">

          <Navbar />

        </header>



        <Hero />

        <PromoBannerMusic />

        <div className="music-container music-container--body">

          <Genres categories={storeCategories} />

          <Tracks

            items={storeMenuItems}

            currency={menuInfo?.currency || "AED"}

          />

        </div>

        <Footer />

      </div>



      {menuInfo?.ownerPlanType === "free" && <ENSFixedBanner />}

    </div>

  );

}



function MusicTemplate() {

  return (

    <MusicProvider>

      <MusicTemplateContent />

    </MusicProvider>

  );

}



export default MusicTemplate;

