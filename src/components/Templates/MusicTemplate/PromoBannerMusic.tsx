"use client";

import { useState, type MouseEvent } from "react";
import { useLocale } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { useAppSelector } from "@/store/hooks";
import type { Ad } from "@/types/Ad";
import LoadImage from "@/components/ImageLoad";
import { trackAdClick } from "@/lib/trackAdClick";
import "swiper/css";

export default function PromoBannerMusic() {
  const ads = useAppSelector((state) => state.menu.ads) ?? [];
  const locale = useLocale();
  const isAr = locale === "ar";
  const direction = isAr ? "rtl" : "ltr";
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
      dir={direction}
      className="relative w-screen max-w-[100vw] [margin-inline:calc(50%-50vw)] py-3 sm:py-4"
      aria-label={isAr ? "إعلانات" : "Advertisements"}
    >
      <Swiper
        modules={[Autoplay]}
        dir={direction}
        loop={sortedAds.length > 1}
        speed={750}
        slidesPerView={1}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        onSlideChange={(swiper) => setSelectedIndex(swiper.realIndex)}
        className="music-feed-card music-feed-card--browse overflow-hidden rounded-none border-y border-brand-sky/20 shadow-[0_8px_32px_-16px_color-mix(in_srgb,var(--color-brand-tomato)_22%,transparent)]"
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
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                </div>
                <div
                  className={`absolute inset-0 ${isAr ? "bg-linear-to-l" : "bg-linear-to-r"} from-brand-tomato/50 via-brand-tomato/20 to-transparent`}
                />
                <div className="pointer-events-none absolute -end-8 -top-8 h-32 w-32 rounded-full bg-brand-coral/12 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-6 -start-6 h-28 w-28 rounded-full bg-brand-sky/15 blur-3xl" />

                <div className="absolute top-3 start-3 z-20 flex items-center gap-1.5 rounded-full border border-white/30 bg-brand-tomato/80 px-2.5 py-1 text-white shadow-sm backdrop-blur-sm">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-coral shadow-[0_0_8px_color-mix(in_srgb,var(--color-brand-coral)_85%,transparent)]"
                    aria-hidden
                  />
                  <span
                    className={`text-[10px] font-semibold tracking-wider sm:text-[11px] ${isAr ? "" : "uppercase"}`}
                  >
                    {isAr ? "إعلان" : "Ad"}
                  </span>
                </div>

                <div className="absolute inset-y-0 start-0 z-10 flex w-full max-w-[min(100%,34rem)] flex-col justify-center px-5 py-6 sm:max-w-xl sm:px-8 md:max-w-2xl md:px-12 lg:px-14">
                  <p
                    className={`mb-2 text-[0.6875rem] font-semibold tracking-[0.24em] text-brand-sky/90 ${isAr ? "" : "uppercase"}`}
                  >
                    {isAr ? "عرض مميز" : "Featured promo"}
                  </p>
                  <h2 className="mb-2 line-clamp-2 text-balance font-body text-xl font-bold leading-snug tracking-tight text-white sm:text-2xl md:text-3xl">
                    {title}
                  </h2>
                  {content ? (
                    <p className="mb-4 line-clamp-2 text-pretty text-sm leading-relaxed text-white/85 sm:text-base">
                      {content}
                    </p>
                  ) : null}
                  {ad.linkUrl ? (
                    <a
                      href={ad.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e: MouseEvent) => e.stopPropagation()}
                      className={`music-cta inline-flex w-fit items-center gap-2 rounded-full px-6 py-2.5 text-[0.6875rem] font-semibold tracking-[0.12em] text-brand-honeydew no-underline sm:text-xs ${isAr ? "" : "uppercase"}`}
                    >
                      {isAr ? "اكتشف الآن" : "Explore now"}
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
              className={`h-1 rounded-full transition-all duration-500 ${
                selectedIndex === i ? "w-8 bg-brand-coral" : "w-1.5 bg-brand-sky/35"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
