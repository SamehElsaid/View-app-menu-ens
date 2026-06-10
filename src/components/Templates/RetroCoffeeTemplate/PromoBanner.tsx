"use client";

import { type SyntheticEvent } from "react";
import { useLocale } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import type { Ad } from "@/types/Ad";
import LoadImage from "@/components/ImageLoad";
import { trackAdClick } from "@/lib/trackAdClick";
import { useCoffeeTheme, hexToRgba } from "./CoffeeThemeContext";

const PromoBanner = () => {
  const locale = useLocale();
  const isAr = locale === "ar";
  const ads = useAppSelector((state) => state.menu.ads) ?? [];
  const { colors, primary, gradients } = useCoffeeTheme();

  const bannerAds = [...ads]
    .filter((ad) => ad.position === "banner" && ad.imageUrl)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const handleAdClick = (ad: Ad) => {
    trackAdClick(ad.id);
    if (ad.linkUrl) {
      window.open(ad.linkUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (bannerAds.length === 0) {
    return null;
  }

  const isSingle = bannerAds.length === 1;

  return (
    <section
      className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-6 sm:py-7"
      aria-label={isAr ? "إعلانات" : "Advertisements"}
    >
      <div
        className={`grid gap-5 ${isSingle ? "grid-cols-1" : "md:grid-cols-2 md:gap-6"}`}
      >
        {bannerAds.map((ad, index) => {
          const title =
            isAr ? ad.titleAr || ad.title : ad.title || ad.titleAr;
          const content =
            isAr
              ? ad.contentAr || ad.content
              : ad.content || ad.contentAr;

          return (
            <button
              key={ad.id}
              type="button"
              className="group relative w-full overflow-hidden rounded-2xl border text-start shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl sm:rounded-[2rem]"
              style={{
                borderColor: colors.border,
                boxShadow: `0 12px 40px -16px ${hexToRgba(primary, 0.32)}`,
                animationDelay: `${index * 120}ms`,
              }}
              onClick={() => handleAdClick(ad)}
            >
              <div
                className={`relative w-full ${
                  isSingle
                    ? "aspect-[3/2] min-h-[180px] sm:aspect-[21/9] sm:min-h-[240px] md:min-h-[300px]"
                    : "aspect-[4/3] min-h-[160px] sm:aspect-[16/10] sm:min-h-[220px] md:min-h-[260px]"
                }`}
              >
                <LoadImage
                  src={ad.imageUrl ?? ""}
                  alt={title || ""}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                  onError={(e: SyntheticEvent<HTMLImageElement, Event>) => {
                    e.currentTarget.style.display = "none";
                  }}
                />

                <div
                  className="absolute inset-0"
                  style={{ background: gradients.overlay }}
                  aria-hidden
                />

                {(title || content) && (
                  <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-6 md:p-7">
                    {title ? (
                      <h3 className="font-serif text-base font-bold text-white drop-shadow-md sm:text-2xl md:text-3xl">
                        {title}
                      </h3>
                    ) : null}
                    {content ? (
                      <p className="mt-2 line-clamp-2 text-sm font-semibold text-white/95 drop-shadow sm:text-base md:text-lg">
                        {content}
                      </p>
                    ) : null}
                  </div>
                )}

                <div
                  className="pointer-events-none absolute inset-0 rounded-[2rem]"
                  style={{
                    boxShadow: `inset 0 0 0 1px ${hexToRgba(primary, 0.2)}`,
                  }}
                  aria-hidden
                />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default PromoBanner;
