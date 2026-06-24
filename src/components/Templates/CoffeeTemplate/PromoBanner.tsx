"use client";

import { type SyntheticEvent } from "react";
import { useLocale } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import type { Ad } from "@/types/Ad";
import LoadImage from "@/components/ImageLoad";
import { trackAdClick } from "@/lib/trackAdClick";

const PromoBanner = () => {
  const locale = useLocale();
  const ads = useAppSelector((state) => state.menu.ads) ?? [];

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

  return (
    <div
      className="py-5"
      aria-label={locale === "ar" ? "إعلانات" : "Advertisements"}
    >
      <div className="grid gap-4 md:grid-cols-2 md:gap-5">
        {bannerAds.map((ad, index) => {
          const title =
            locale === "ar" ? ad.titleAr || ad.title : ad.title || ad.titleAr;
          const content =
            locale === "ar"
              ? ad.contentAr || ad.content
              : ad.content || ad.contentAr;

          return (
            <div
              key={ad.id}
              className={`group relative overflow-hidden cursor-pointer shadow-xl ring-1 ring-black/10 ring-offset-1 ring-offset-stone-100
                min-h-[240px] md:min-h-[300px] 
                rounded-3xl 
                transition-all duration-500
                ${bannerAds.length === 1 ? "col-span-full max-w-full" : "w-full"} 
              `}
              style={{ animationDelay: `${index * 150}ms` }}
              onClick={() => handleAdClick(ad)}
            >
              <div className="absolute inset-0 h-full w-full">
                {ad.imageUrl ? (
                  <LoadImage
                    src={ad.imageUrl}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    onError={(e: SyntheticEvent<HTMLImageElement, Event>) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#4c1121] to-[#9b2545]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-[#4c1121]/55 to-black/20" />
                <div className="absolute inset-0 flex flex-col justify-center p-5 md:p-6">
                  <h3 className="font-body !text-lg md:!text-xl font-bold text-[#F4EEE7] mb-1.5 [text-shadow:0_4px_24px_rgba(0,0,0,0.75)]">
                    {title}
                  </h3>
                  {content && (
                    <p className="text-base md:text-base font-semibold text-[#F2B705] [text-shadow:0_2px_14px_rgba(0,0,0,0.6)] line-clamp-2">
                      {content}
                    </p>
                  )}
                </div>
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#F2B705]/50 rounded-xl transition-colors duration-300" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PromoBanner;
