"use client";

import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import { FaMugHot } from "react-icons/fa6";
import { GiCoffeeBeans } from "react-icons/gi";
import { useAppSelector } from "@/store/hooks";
import { ARCANE_RED, ARCANE_WHITE } from "./ArcaneThemeContext";

const HERO_WAVE_PATH =
  "M0,32 C180,108 420,4 720,78 C980,118 1180,42 1440,88 L1440,120 L0,120 Z";

function HeroWave() {
  return (
    <div
      className="pointer-events-none relative z-20 -mb-px w-full translate-y-px leading-[0]"
      aria-hidden
    >
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="block h-12 w-full sm:h-16 md:h-20"
      >
        <path d={HERO_WAVE_PATH} fill={ARCANE_WHITE} />
      </svg>
    </div>
  );
}

function HeroCafeMotion() {
  return (
    <div
      className="relative mx-auto flex h-[152px] w-[152px] items-center justify-center sm:h-[180px] sm:w-[180px] md:h-[200px] md:w-[200px]"
      aria-hidden
    >
      <motion.div
        className="absolute inset-0 rounded-full bg-white/15 blur-2xl"
        animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.55, 0.3] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute inset-1 rounded-full border border-dashed border-white/35 sm:inset-2"
        animate={{ rotate: 360 }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        className="relative z-10 flex h-[5.75rem] w-[5.75rem] items-center justify-center rounded-full bg-white shadow-[0_18px_48px_rgba(0,0,0,0.2)] sm:h-[6.5rem] sm:w-[6.5rem] md:h-28 md:w-28"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <FaMugHot
          className="text-[2.6rem] sm:text-[2.85rem] md:text-[3rem]"
          style={{ color: ARCANE_RED }}
        />
      </motion.div>

      <motion.span
        className="absolute -top-0.5 left-1/2 z-20 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full bg-white shadow-md sm:h-10 sm:w-10"
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
      >
        <GiCoffeeBeans className="text-lg sm:text-xl" style={{ color: ARCANE_RED }} />
      </motion.span>

      <motion.span
        className="absolute bottom-3 start-1 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-md sm:bottom-4 sm:h-9 sm:w-9"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.45 }}
      >
        <GiCoffeeBeans className="text-base opacity-85" style={{ color: ARCANE_RED }} />
      </motion.span>

      <motion.span
        className="absolute bottom-5 end-1 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-md sm:bottom-6 sm:h-9 sm:w-9"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.75 }}
      >
        <FaMugHot className="text-sm sm:text-base" style={{ color: ARCANE_RED }} />
      </motion.span>
    </div>
  );
}

export default function Hero() {
  const locale = useLocale() as "ar" | "en";
  const isAr = locale === "ar";
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);

  const heroTitle = menuInfo?.name?.trim() || (isAr ? "القائمة" : "Menu");
  const heroDescription = menuInfo?.description?.trim() ?? "";

  const scrollToMenu = () => {
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
  };

  const textAlign = isAr
    ? "items-center text-center md:order-2 md:items-end md:text-end"
    : "items-center text-center md:order-1 md:items-start md:text-start";

  const visualOrder = isAr ? "md:order-1" : "md:order-2";

  return (
    <section
      id="top"
      className="relative scroll-mt-20 overflow-x-clip pb-0 pt-[calc(5.25rem+env(safe-area-inset-top,0px))] sm:pt-[calc(6.25rem+env(safe-area-inset-top,0px))]"
      style={{ backgroundColor: ARCANE_RED }}
      aria-labelledby="arcane-hero-title"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -end-20 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl sm:h-72 sm:w-72" />
        <div className="absolute -bottom-12 -start-12 h-44 w-44 rounded-full bg-black/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-6 pb-8 pt-2 sm:gap-8 sm:pb-10 sm:pt-4 md:grid-cols-2 md:gap-10 md:pb-12 md:pt-6 lg:gap-14">
          <div className={`flex min-w-0 flex-col justify-center ${textAlign}`}>
            <h1
              id="arcane-hero-title"
              className={`font-body text-balance text-2xl font-black leading-[1.12] tracking-tight text-white sm:text-3xl md:text-4xl lg:text-[2.75rem] ${!isAr ? "uppercase" : ""}`}
            >
              {heroTitle}
            </h1>

            <div
              className={`mt-3 h-1 w-12 rounded-full bg-white/90 sm:mt-4 sm:w-14 ${isAr ? "md:ms-auto" : "md:me-auto"}`}
              aria-hidden
            />

            {heroDescription ? (
              <p
                className={`mt-3 line-clamp-3 max-w-lg text-pretty text-sm leading-relaxed text-white/90 sm:mt-4 sm:text-base md:text-lg ${isAr ? "md:ms-auto" : ""}`}
              >
                {heroDescription}
              </p>
            ) : null}

            <div className={`mt-5 sm:mt-6 ${isAr ? "md:flex md:justify-end" : ""}`}>
              <button
                type="button"
                onClick={scrollToMenu}
                className="inline-flex w-full min-h-11 items-center justify-center rounded-full bg-white px-6 py-2.5 text-xs font-black uppercase tracking-wider shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition hover:opacity-95 active:scale-[0.98] sm:w-auto sm:px-8 sm:py-3 sm:text-sm"
                style={{ color: ARCANE_RED }}
              >
                {isAr ? "تصفح القائمة" : "Browse Menu"}
              </button>
            </div>
          </div>

          <div className={`flex items-center justify-center py-2 sm:py-4 ${visualOrder}`}>
            <HeroCafeMotion />
          </div>
        </div>
      </div>

      <HeroWave />
    </section>
  );
}
