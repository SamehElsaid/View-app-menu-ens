"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import { usePharaonicTheme, hexToRgba } from "./PharaonicThemeContext";
import PharaonicMenuCta from "./PharaonicMenuCta";
import {
  PyramidSilhouettes,
  PapyrusTexture,
  LotusDivider,
  HieroglyphBorder,
} from "./PharaonicDecor";
import { pharaonicDisplayFont } from "./PharaonicFonts";
import MysteryWhisper from "./MysteryWhisper";
import PharaonicScrollCue from "./PharaonicScrollCue";
import { prefersReducedMotion } from "./pharaonicMystery";

export default function HeroP() {
  const locale = useLocale();
  const { primary, secondary } = usePharaonicTheme();
  const menuInfo = useAppSelector((s) => s.menu.menuInfo);
  const c = useAppSelector((s) => s.menu.menuCustomizations);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const heroTitle =
    locale === "ar"
      ? (c?.heroTitleAr?.trim() || menuInfo?.name || "")
      : (c?.heroTitleEn?.trim() || menuInfo?.name || "");
  const heroSubtitle =
    locale === "ar"
      ? (c?.heroSubtitleAr?.trim() || menuInfo?.description || "")
      : (c?.heroSubtitleEn?.trim() || menuInfo?.description || "");

  const menuLabel = menuInfo?.name?.trim() || "";
  const displayFont = pharaonicDisplayFont(locale);
  const hasSubtitle = Boolean(heroSubtitle?.trim());
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;

    const applyParallax = (clientX: number, clientY: number, scale: number) => {
      const nx = (clientX / window.innerWidth - 0.5) * 2;
      const ny = (clientY / window.innerHeight - 0.5) * 2;
      setParallax({ x: nx * scale, y: ny * scale * 0.85 });
    };

    const onMouseMove = (e: MouseEvent) => {
      applyParallax(e.clientX, e.clientY, 14);
    };

    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) applyParallax(t.clientX, t.clientY, 10);
    };

    if (finePointer) {
      window.addEventListener("mousemove", onMouseMove, { passive: true });
    }
    if (coarsePointer) {
      window.addEventListener("touchmove", onTouchMove, { passive: true });
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  return (
    <section
      id="top"
      className="relative flex min-h-[min(88vh,720px)] flex-col items-center justify-center overflow-hidden px-4 pb-24 pt-36 text-center sm:px-8"
      style={{
        background: `
          radial-gradient(ellipse 80% 50% at 50% 0%, ${hexToRgba(secondary, 0.35)}, transparent 55%),
          radial-gradient(circle at 15% 60%, ${hexToRgba(primary, 0.12)}, transparent 45%),
          linear-gradient(180deg, #14100c 0%, #0c0a08 55%, #1a140e 100%)
        `,
      }}
    >
      <PapyrusTexture />
      <div
        className="absolute inset-x-0 bottom-0 transition-transform duration-700 ease-out motion-reduce:transition-none"
        style={{
          transform: `translate3d(${parallax.x}px, ${parallax.y * 0.5}px, 0)`,
        }}
      >
        <PyramidSilhouettes />
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        {menuLabel ? (
          <p
            className="mb-5 text-sm tracking-[0.45em] uppercase opacity-0 animate-fade-up [animation-delay:0.15s] motion-reduce:opacity-100"
            style={{ color: secondary, fontFamily: displayFont }}
          >
            — {menuLabel} —
          </p>
        ) : null}

        <h1
          className="ph-mystery-title mb-5 text-[clamp(2.25rem,6.5vw,4.5rem)] font-semibold leading-[1.1] tracking-wide text-balance motion-reduce:opacity-100"
          style={{
            fontFamily: displayFont,
            color: primary,
            textShadow: `0 2px 40px ${hexToRgba(primary, 0.35)}`,
            animationDelay: "0.25s",
          }}
        >
          {heroTitle || (locale === "ar" ? "قائمة الكرم" : "Royal Menu")}
        </h1>

        <LotusDivider className="mb-6 opacity-0 animate-fade-up [animation-delay:0.5s] motion-reduce:opacity-100" />

        {hasSubtitle ? (
          <p className="mx-auto mb-6 max-w-xl text-base leading-relaxed text-[#e8dcc8]/85 opacity-0 animate-fade-up [animation-delay:0.65s] sm:text-lg motion-reduce:opacity-100">
            {heroSubtitle}
          </p>
        ) : null}

        <MysteryWhisper hidden={hasSubtitle} />

        <PharaonicMenuCta variant="hero" />
      </div>

      <PharaonicScrollCue />
      <HieroglyphBorder className="absolute bottom-0 left-0 right-0 z-10 opacity-50" />
    </section>
  );
}
