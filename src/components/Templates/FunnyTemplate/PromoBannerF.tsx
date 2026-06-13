"use client";

import { useState } from "react";

import { useLocale } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { useAppSelector } from "@/store/hooks";
import type { Ad } from "@/types/Ad";
import { useFunnyTheme } from "./FunnyThemeContext";
import LoadImage from "@/components/ImageLoad";
import { trackAdClick } from "@/lib/trackAdClick";
import "swiper/css";
import "swiper/css/pagination";

export default function PromoBannerF() {
  const ads = useAppSelector((state) => state.menu.ads) ?? [];
  const locale = useLocale();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { primary } = useFunnyTheme();

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

  const overlayStart = "rgba(0,0,0,0.78)";
  const overlayMid = "rgba(0,0,0,0.45)";

  return (
    <section
      className="py-6 px-4 max-w-[1200px] mx-auto"
      aria-label={locale === "ar" ? "إعلانات" : "Advertisements"}
    >
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        loop={sortedAds.length > 1}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        onSlideChange={(swiper) => setSelectedIndex(swiper.realIndex)}
        className="rounded-3xl shadow-xl overflow-hidden ring-1 ring-black/10 ring-offset-1 ring-offset-stone-100"
      >
        {sortedAds.map((ad, i) => {
          const title =
            locale === "ar" ? ad.titleAr || ad.title : ad.title || ad.titleAr;
          const content =
            locale === "ar"
              ? ad.contentAr || ad.content
              : ad.content || ad.contentAr;

          return (
            <SwiperSlide key={ad.id}>
              <div
                className="relative w-full h-[220px] sm:h-[300px] md:h-[380px] cursor-pointer group"
                onClick={() => handleAdClick(ad)}
              >
                <LoadImage
                  src={ad.imageUrl}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />

                <div
                  className="absolute inset-0 to-transparent rtl:scale-x-[-1]"
                  style={{
                    background: `linear-gradient(to right, ${overlayStart}, ${overlayMid}, rgba(0,0,0,0.15))`,
                  }}
                />

                {/* وسم إعلان صغير */}
                <div
                  className="absolute top-2.5 z-20 flex items-center gap-1.5 rounded-full border border-white/80 bg-black/70 px-2 py-1 text-white shadow-md backdrop-blur-base end-3 sm:top-3 sm:px-2.5 sm:py-1 sm:end-5"
                  dir={locale === "ar" ? "rtl" : "ltr"}
                >
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.85)]"
                    aria-hidden
                  />
                  <span className="text-[10px] font-bold uppercase tracking-wider sm:text-[11px]">
                    {locale === "ar" ? "إعلان" : "Ad"}
                  </span>
                </div>

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-center p-5 pt-14 sm:p-8 sm:pt-12 md:p-14 md:pt-10 text-white max-w-3xl">
                  <div className="animate-slide-up motion-reduce:animate-none">
                    <h2 className="text-2xl sm:text-3xl md:text-5xl font-body  font-bold mb-4 leading-[1.15] [text-shadow:0_4px_32px_rgba(0,0,0,0.85)]">
                      {title}
                    </h2>

                    {content && (
                      <p className="text-base sm:text-base md:text-lg text-white mb-5 line-clamp-2 font-medium max-w-xl [text-shadow:0_2px_16px_rgba(0,0,0,0.75)]">
                        {content}
                      </p>
                    )}

                    {ad.linkUrl && (
                      <div className="flex items-center gap-4 group/btn mt-auto">
                        <button
                          type="button"
                          className="relative flex h-11 items-center justify-center gap-2 overflow-hidden rounded-full px-7 text-base font-bold text-white transition-all duration-300 shadow-[0_6px_28px_rgba(0,0,0,0.4)] ring-2 ring-white/50 group-hover/btn:-translate-y-0.5 group-hover/btn:shadow-[0_8px_32px_rgba(0,0,0,0.45)] active:scale-95"
                          style={{ backgroundColor: primary }}
                        >
                          <span className="relative z-10">
                            {locale === "ar" ? "اكتشف الآن" : "Explore Now"}
                          </span>
                          <span className="relative z-10 transition-transform duration-300 group-hover/btn:translate-x-0.5">
                            →
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {sortedAds.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {sortedAds.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 transition-all duration-500 rounded-full ${
                selectedIndex === i ? "w-8 bg-white shadow-sm" : "w-2 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
