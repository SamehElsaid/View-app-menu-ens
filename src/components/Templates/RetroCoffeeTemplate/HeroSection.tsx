"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import LoadImage from "@/components/ImageLoad";
import { useAppSelector } from "@/store/hooks";
import {
  RETRO_SURFACE,
  RETRO_SURFACE_BORDER,
  useCoffeeTheme,
} from "./CoffeeThemeContext";

export type HeroSectionProps = {
  title?: string;
  subtitle?: string;
  featuredImage?: string | null;
};

function pickLocalizedText(
  isAr: boolean,
  ar?: string | null,
  en?: string | null,
) {
  return (isAr ? ar : en)?.trim() || "";
}

function pickMenuText(
  isAr: boolean,
  menuInfo: {
    name?: string | null;
    nameAr?: string | null;
    nameEn?: string | null;
    description?: string | null;
    descriptionAr?: string | null;
    descriptionEn?: string | null;
  } | null,
  field: "name" | "description",
) {
  if (!menuInfo) return "";
  if (field === "name") {
    return (
      (isAr ? menuInfo.nameAr : menuInfo.nameEn)?.trim() ||
      menuInfo.name?.trim() ||
      ""
    );
  }
  return (
    (isAr ? menuInfo.descriptionAr : menuInfo.descriptionEn)?.trim() ||
    menuInfo.description?.trim() ||
    ""
  );
}

export default function HeroSection({
  title: titleProp,
  subtitle: subtitleProp,
  featuredImage: featuredImageProp,
}: HeroSectionProps) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const t = useTranslations("menu");
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);
  const customizations = useAppSelector((state) => state.menu.menuCustomizations);
  const ads = useAppSelector((state) => state.menu.ads) ?? [];
  const { colors, primary } = useCoffeeTheme();

  const title = useMemo(() => {
    if (titleProp?.trim()) return titleProp.trim();
    return (
      pickLocalizedText(
        isAr,
        customizations?.heroTitleAr,
        customizations?.heroTitleEn,
      ) ||
      pickMenuText(isAr, menuInfo, "name") ||
      t("ourMenu")
    );
  }, [
    titleProp,
    isAr,
    locale,
    customizations?.heroTitleAr,
    customizations?.heroTitleEn,
    menuInfo,
    t,
  ]);

  const subtitle = useMemo(() => {
    if (subtitleProp?.trim()) return subtitleProp.trim();
    return (
      pickLocalizedText(
        isAr,
        customizations?.heroSubtitleAr,
        customizations?.heroSubtitleEn,
      ) || pickMenuText(isAr, menuInfo, "description")
    );
  }, [
    subtitleProp,
    isAr,
    locale,
    customizations?.heroSubtitleAr,
    customizations?.heroSubtitleEn,
    menuInfo,
  ]);

  const featuredImage = useMemo(() => {
    if (featuredImageProp?.trim()) return featuredImageProp.trim();
    if (menuInfo?.logo?.trim()) return menuInfo.logo.trim();
    const bannerAd = ads.find((ad) => ad.position === "banner" && ad.imageUrl);
    return bannerAd?.imageUrl?.trim() || null;
  }, [featuredImageProp, menuInfo?.logo, ads]);

  if (!title && !subtitle && !featuredImage) return null;

  return (
    <section
      id="top"
      className="compact-hero relative scroll-mt-24 px-3 pt-[calc(var(--retro-nav-offset)+0.75rem)] sm:px-6 sm:pt-[calc(var(--retro-nav-offset)+1rem)]"
      aria-labelledby="compact-hero-title"
    >
      <div
        className="mx-auto flex max-w-6xl flex-col items-center gap-4 rounded-xl border px-4 py-4 text-center shadow-[0_6px_18px_-6px_rgba(0,0,0,0.05)] sm:flex-row sm:items-center sm:gap-6 sm:rounded-2xl sm:px-6 sm:py-5 sm:text-start"
        style={{
          backgroundColor: RETRO_SURFACE,
          borderColor: RETRO_SURFACE_BORDER,
        }}
      >
        {featuredImage ? (
          <div
            className="relative aspect-square w-14 shrink-0 overflow-hidden rounded-full border bg-white sm:w-20"
            style={{ borderColor: RETRO_SURFACE_BORDER }}
          >
            <LoadImage
              src={featuredImage}
              alt={title}
              fill
              className="object-contain p-2 sm:p-2.5"
              disableLazy
            />
          </div>
        ) : null}

        <div className="flex max-w-xl flex-col items-center sm:items-start">
          {title ? (
            <h1
              id="compact-hero-title"
              className="font-serif text-lg font-black leading-tight tracking-tight sm:text-2xl md:text-3xl"
              style={{ color: primary }}
            >
              {title}
            </h1>
          ) : null}

          {subtitle ? (
            <p
              className="mt-1.5 text-pretty text-xs font-medium leading-relaxed sm:mt-2 sm:text-sm"
              style={{ color: colors.textMuted }}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
