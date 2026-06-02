"use client";

import { useLocale, useTranslations } from "next-intl";
import { useAppSelector } from "@/store/hooks";

interface HeroSectionProps {
  menuName?: string;
  menuDescription?: string;
  compact?: boolean;
}

export default function HeroSection({
  menuName: menuNameProp,
  menuDescription: menuDescriptionProp,
  compact = false,
}: HeroSectionProps) {
  const locale = useLocale();
  const t = useTranslations("menu");
  const menuInfo = useAppSelector((s) => s.menu.menuInfo);
  const customizations = useAppSelector((s) => s.menu.menuCustomizations);

  const menuName =
    menuNameProp ??
    (locale === "ar"
      ? customizations?.heroTitleAr?.trim() || menuInfo?.name
      : customizations?.heroTitleEn?.trim() || menuInfo?.name);

  const menuDescription =
    menuDescriptionProp ??
    (locale === "ar"
      ? customizations?.heroSubtitleAr?.trim() || menuInfo?.description
      : customizations?.heroSubtitleEn?.trim() || menuInfo?.description);

  const displayName = menuName?.trim() || t("ourMenu");
  const displayDescription = menuDescription?.trim() || "";

  return (
    <section className="relative grid w-full min-h-[34svh] place-items-center overflow-hidden px-4 pb-11 pt-24 md:min-h-[60vh] md:pb-30 md:pt-28">
      <div className="absolute inset-0 bg-linear-to-b from-(--bg-main)/10 via-white to-transparent" />

      {/* Large Decorative Circles */}
      <div className="absolute top-[-10%] end-[-5%] w-160 h-80 bg-(--bg-main)/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] end-0 w-100 h-80 bg-(--bg-main)/10 rounded-full blur-[80px]" />
      <div className="relative z-10 w-full min-w-0 max-w-4xl text-center">
        <div className="w-full min-w-0">
          <h1
            className={`font-black mb-3 md:mb-8 tracking-tighter text-(--bg-main) leading-[1.1] text-balance wrap-break-word ${
              compact
                ? "!text-3xl md:!text-5xl"
                : "!text-4xl md:text-6xl!"
            }`}
          >
            {displayName}
          </h1>
          <div className="w-14 md:w-16 h-1.5 bg-(--bg-main) mx-auto mb-4 md:mb-10 rounded-full" />
          {displayDescription ? (
            <p
              className={`w-full max-w-2xl mx-auto text-[#2b1d58] mb-2 md:mb-12 font-medium leading-relaxed text-balance wrap-break-word ${
                compact ? "text-base md:text-base" : "text-lg md:text-xl"
              }`}
            >
              {displayDescription}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
