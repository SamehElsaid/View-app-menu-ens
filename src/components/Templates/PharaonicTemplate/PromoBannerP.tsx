"use client";

import { useState, type MouseEvent } from "react";
import { useLocale } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { useAppSelector } from "@/store/hooks";
import type { Ad } from "@/types/Ad";
import {
  usePharaonicTheme,
  shadowGlow,
  PharaonicChevron,
} from "./PharaonicThemeContext";
import LoadImage from "@/components/ImageLoad";
import { trackAdClick } from "@/lib/trackAdClick";
import "swiper/css";
import "swiper/css/pagination";

export default function PromoBannerP() {
  const ads = useAppSelector((state) => state.menu.ads) ?? [];
  const locale = useLocale();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { primary, secondary } = usePharaonicTheme();

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
      className="mx-auto w-full max-w-[960px] px-3 py-4 sm:px-4"
      aria-label={locale === "ar" ? "إعلانات" : "Advertisements"}
    >
      <Swiper
        modules={[Autoplay, Pagination]}
        loop={sortedAds.length > 1}
        speed={750}
        slidesPerView={1}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        onSlideChange={(swiper) => setSelectedIndex(swiper.realIndex)}
        className="overflow-hidden rounded-sm border-2"
        style={{
          borderColor: `${primary}44`,
          boxShadow: shadowGlow(primary, 32, 0.15),
        }}
      >
        {sortedAds.map((ad) => {
          const title =
            locale === "ar" ? ad.titleAr || ad.title : ad.title || ad.titleAr;
          const content =
            locale === "ar"
              ? ad.contentAr || ad.content
              : ad.content || ad.contentAr;

          return (
            <SwiperSlide key={ad.id} className="!h-auto">
              <div
                className="group relative min-h-[200px] w-full cursor-pointer overflow-hidden sm:min-h-[190px] md:min-h-[220px]"
                onClick={() => handleAdClick(ad)}
              >
                <LoadImage
                  src={ad.imageUrl}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(105deg, ${secondary}99 0%, transparent 42%, rgba(12,10,8,0.75) 100%)`,
                  }}
                />
                <div className="relative z-10 flex min-h-[200px] flex-col justify-center px-5 py-6 text-white sm:min-h-[190px] md:px-8">
                  <p
                    className="mb-2 text-xs tracking-[0.4em] uppercase"
                    style={{ color: primary }}
                  >
                    {locale === "ar" ? "— عرض خاص —" : "— Royal Offer —"}
                  </p>
                  <h2 className="mb-2 line-clamp-2 text-xl font-semibold md:text-2xl">
                    {title}
                  </h2>
                  {content ? (
                    <p className="mb-4 line-clamp-2 max-w-lg text-sm text-white/85">
                      {content}
                    </p>
                  ) : null}
                  {ad.linkUrl ? (
                    <a
                      href={ad.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e: MouseEvent) => e.stopPropagation()}
                      className="inline-flex w-fit items-center gap-2 rounded-sm px-5 py-2 text-xs uppercase tracking-[0.18em] text-[#0c0a08] no-underline"
                      style={{
                        background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                      }}
                    >
                      {locale === "ar" ? "اكتشف الآن" : "Discover"}
                      <PharaonicChevron size={12} />
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
                background:
                  selectedIndex === i
                    ? `linear-gradient(90deg, ${primary}, ${secondary})`
                    : `${primary}33`,
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
