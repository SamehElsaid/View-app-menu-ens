"use client";

import { useState, type MouseEvent } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { useAppSelector } from "@/store/hooks";
import type { Ad } from "@/types/Ad";
import { useNoirTheme, shadowGlow, NoirChevronRight } from "./NoirThemeContext";
import "swiper/css";
import "swiper/css/pagination";

export default function PromoBannerN() {
  const ads = useAppSelector((state) => state.menu.ads) ?? [];
  const locale = useLocale();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { primary, secondary } = useNoirTheme();

  const sortedAds = [...ads]
    .filter((ad) => ad.position === "banner" && ad.imageUrl)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  if (sortedAds.length === 0) return null;

  const handleAdClick = async (ad: Ad) => {
    if (!ad.linkUrl) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      fetch(`${apiUrl}/admin/ads/${ad.id}/click`, { method: "POST" });
    } catch {}
    window.open(ad.linkUrl, "_blank", "noopener,noreferrer");
  };

  const swiperShadow = shadowGlow(primary, 40, 0.1);

  return (
    <section
      className="w-full max-w-[960px] mx-auto px-3 py-3 sm:px-4 sm:py-4"
      aria-label={locale === "ar" ? "إعلانات" : "Advertisements"}
    >
      <Swiper
        modules={[Autoplay, Pagination]}
        loop={sortedAds.length > 1}
        speed={750}
        slidesPerView={1}
        spaceBetween={0}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        onSlideChange={(swiper) => setSelectedIndex(swiper.realIndex)}
        className="w-full rounded-[4px] overflow-hidden border border-violet/[0.12]"
        style={{ boxShadow: swiperShadow }}
      >
        {sortedAds.map((ad, i) => {
          const title =
            locale === "ar" ? ad.titleAr || ad.title : ad.title || ad.titleAr;
          const content =
            locale === "ar"
              ? ad.contentAr || ad.content
              : ad.content || ad.contentAr;

          return (
            <SwiperSlide key={ad.id} className="!h-auto">
              <div
                className="group relative min-h-[200px] w-full cursor-pointer overflow-hidden sm:min-h-0 sm:h-[190px] md:h-[230px]"
                onClick={() => handleAdClick(ad)}
              >
                <div
                  className="absolute inset-0 origin-center transition-transform duration-500 will-change-transform group-hover:scale-[1.04]"
                  style={{
                    transitionTimingFunction:
                      "cubic-bezier(0.25, 0.1, 0.25, 1)",
                  }}
                >
                  <Image
                    src={ad.imageUrl}
                    alt={title}
                    fill
                    className="object-cover sm:saturate-[0.72] sm:brightness-[0.88]"
                    priority={i === 0}
                  />
                  <div className="pointer-events-none absolute inset-0 z-1 rtl:scale-x-[-1]" />
                </div>

                <div className="relative z-10 flex min-h-[200px] w-full max-w-3xl flex-col justify-center px-3 py-5 text-white sm:min-h-0 sm:h-full sm:px-6 sm:py-6 md:p-8">
                  <div className="animate-slide-up motion-reduce:animate-none">
                    <p className="mb-1.5 text-[0.6rem] tracking-[0.22em] uppercase text-cyan sm:mb-2 sm:text-xs sm:tracking-[0.5em]">
                      {locale === "ar" ? "— اعلان خاص —" : "— Special ADS —"}
                    </p>

                    <h2 className="font-display mb-1.5 line-clamp-2 text-lg font-light italic leading-snug [text-shadow:0_4px_24px_rgba(0,0,0,0.85)] sm:mb-3 sm:line-clamp-none sm:text-2xl sm:leading-tight md:text-3xl md:leading-[1.15]">
                      {title}
                    </h2>

                    {content && (
                      <p className="font-display mb-3 line-clamp-2 max-w-xl text-[11px] italic leading-relaxed  [text-shadow:0_2px_12px_rgba(0,0,0,0.75)] sm:mb-4 sm:text-sm md:text-base">
                        {content}
                      </p>
                    )}

                    {ad.linkUrl && (
                      <AdCtaLink
                        href={ad.linkUrl}
                        label={locale === "ar" ? "اكتشف الآن" : "Explore Now"}
                        primary={primary}
                        secondary={secondary}
                        onClickStop={(e) => e.stopPropagation()}
                      />
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
              className={`h-1 transition-all duration-500 rounded-full ${
                selectedIndex === i
                  ? "w-8 bg-linear-to-r from-violet to-cyan"
                  : "w-1.5 bg-violet/20"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function AdCtaLink({
  href,
  label,
  primary,
  secondary,
  onClickStop,
}: {
  href: string;
  label: string;
  primary: string;
  secondary: string;
  onClickStop: (e: MouseEvent) => void;
}) {
  const baseShadow = `${shadowGlow(primary, 24, 0.28)}`;
  const hoverShadow = `${shadowGlow(primary, 40, 0.45)}, ${shadowGlow(secondary, 16, 0.25)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClickStop}
      className="inline-flex w-fit max-w-full shrink-0 items-center gap-2 rounded-[3px] px-4 py-2 text-[10px] tracking-[0.12em] text-white uppercase no-underline transition-[transform,box-shadow] duration-300 sm:gap-3 sm:px-7 sm:py-2.5 sm:text-sm sm:tracking-[0.2em] bg-linear-to-br from-violet to-cyan hover:-translate-y-0.5 active:scale-[0.98]"
      style={{ boxShadow: baseShadow }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = hoverShadow;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = baseShadow;
      }}
    >
      <span>{label}</span>
      <NoirChevronRight size={14} />
    </a>
  );
}
