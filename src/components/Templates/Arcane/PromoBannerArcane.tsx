"use client";

import { useState, type MouseEvent } from "react";
import { useLocale } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { useAppSelector } from "@/store/hooks";
import type { Ad } from "@/types/Ad";
import LoadImage from "@/components/ImageLoad";
import { trackAdClick } from "@/lib/trackAdClick";
import {
  ARCANE_RED,
  ARCANE_DEFAULT_SECONDARY,
  hexToRgba,
} from "./ArcaneThemeContext";
import "swiper/css";

export default function PromoBannerArcane() {
  const ads = useAppSelector((state) => state.menu.ads) ?? [];
  const locale = useLocale();
  const isAr = locale === "ar";
  const [selectedIndex, setSelectedIndex] = useState(0);

  const sortedAds = [...ads]
    .filter((ad) => ad.position === "banner" && ad.imageUrl)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  if (sortedAds.length === 0) return null;

  const handleAdClick = (ad: Ad) => {
    trackAdClick(ad.id);
    if (ad.linkUrl) {
      window.open(ad.linkUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <section
      className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6"
      aria-label={isAr ? "إعلانات" : "Advertisements"}
    >
      <Swiper
        modules={[Autoplay]}
        loop={sortedAds.length > 1}
        speed={700}
        slidesPerView={1}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        onSlideChange={(swiper) => setSelectedIndex(swiper.realIndex)}
        className="overflow-hidden rounded-2xl border-2 border-[#eeeeee] shadow-[0_16px_48px_-24px_rgba(209,40,42,0.35)]"
      >
        {sortedAds.map((ad) => {
          const title =
            isAr ? ad.titleAr || ad.title : ad.title || ad.titleAr;
          const content =
            isAr ? ad.contentAr || ad.content : ad.content || ad.contentAr;

          return (
            <SwiperSlide key={ad.id}>
              <div
                className="group relative h-[220px] w-full cursor-pointer overflow-hidden sm:h-[260px] md:h-[300px]"
                onClick={() => handleAdClick(ad)}
              >
                <div className="absolute inset-0">
                  <LoadImage
                    src={ad.imageUrl}
                    alt={title}
                    fill
                    disableLazy
                    useMenuLogoFallback={false}
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div
                  className="absolute inset-0"
                  style={{
                    background: isAr
                      ? `linear-gradient(255deg, ${hexToRgba(ARCANE_DEFAULT_SECONDARY, 0.62)} 0%, ${hexToRgba(ARCANE_RED, 0.28)} 34%, transparent 68%)`
                      : `linear-gradient(105deg, ${hexToRgba(ARCANE_DEFAULT_SECONDARY, 0.62)} 0%, ${hexToRgba(ARCANE_RED, 0.28)} 34%, transparent 68%)`,
                  }}
                />
                <div
                  className={`absolute top-3 z-20 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white ${isAr ? "start-3" : "end-3"}`}
                  style={{ backgroundColor: ARCANE_RED }}
                >
                  {isAr ? "إعلان" : "Ad"}
                </div>
                <div
                  className={`absolute inset-0 z-10 flex flex-col justify-center px-5 py-6 text-white md:px-8 ${isAr ? "items-end text-end" : "items-start text-start"}`}
                >
                  <p
                    className={`mb-2 text-[10px] font-black tracking-[0.35em] text-white/80 sm:text-xs ${isAr ? "" : "uppercase"}`}
                  >
                    {isAr ? "— عرض خاص —" : "— Special Offer —"}
                  </p>
                  <h2 className="mb-2 line-clamp-2 font-body text-xl font-black uppercase tracking-tight sm:text-2xl md:text-3xl">
                    {title}
                  </h2>
                  {content ? (
                    <p className="mb-4 line-clamp-2 max-w-lg text-sm text-white/85 sm:text-base">
                      {content}
                    </p>
                  ) : null}
                  {ad.linkUrl ? (
                    <a
                      href={ad.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e: MouseEvent) => e.stopPropagation()}
                      className="inline-flex w-fit items-center gap-2 rounded-full px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-white no-underline transition-opacity hover:opacity-90 sm:text-xs"
                      style={{ backgroundColor: ARCANE_RED }}
                    >
                      {isAr ? "اكتشف الآن" : "Discover"}
                      <span aria-hidden>{isAr ? "←" : "→"}</span>
                    </a>
                  ) : null}
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {sortedAds.length > 1 && (
        <div className="mt-3 flex justify-center gap-2">
          {sortedAds.map((_, i) => (
            <div
              key={i}
              className="h-1 rounded-full transition-all duration-500"
              style={{
                width: selectedIndex === i ? 32 : 6,
                backgroundColor:
                  selectedIndex === i ? ARCANE_RED : hexToRgba(ARCANE_RED, 0.25),
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
