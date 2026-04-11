"use client";

import { useState } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { useAppSelector } from "@/store/hooks";
import type { Ad } from "@/types/Ad";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/pagination";

export default function PromoBannerN() {
  const ads = useAppSelector((state) => state.menu.ads) ?? [];
  const locale = useLocale();
  const [selectedIndex, setSelectedIndex] = useState(0);

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
        className="rounded-[4px] overflow-hidden border border-violet/[0.12] shadow-[0_0_40px_rgba(124,58,237,0.1)]"
      >
        {sortedAds.map((ad, i) => {
          const title =
            locale === "ar"
              ? ad.titleAr || ad.title
              : ad.title || ad.titleAr;
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
                <Image
                  src={ad.imageUrl}
                  alt={title}
                  fill
                  className="object-cover saturate-[0.7] brightness-[0.85] transition-[filter,transform] duration-1000 group-hover:saturate-[0.85] group-hover:brightness-[0.9] group-hover:scale-110"
                  priority={i === 0}
                />

                <div
                  className="absolute inset-0 rtl:scale-x-[-1]"
                  style={{
                    background:
                      "linear-gradient(to right, rgba(10,10,15,0.88), rgba(124,58,237,0.35), rgba(10,10,15,0.2))",
                  }}
                />

                <div className="relative z-10 h-full flex flex-col justify-center p-5 pt-14 sm:p-8 sm:pt-12 md:p-14 md:pt-10 text-white max-w-3xl">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <p className="text-sm tracking-[0.5em] uppercase text-cyan mb-3">
                      {locale === "ar" ? "— اعلان خاص —" : "— Special ADS —"}
                    </p>

                    <h2 className="font-display text-2xl sm:text-3xl md:text-5xl font-light italic leading-[1.15] mb-4 [text-shadow:0_4px_32px_rgba(0,0,0,0.85)]">
                      {title}
                    </h2>

                    {content && (
                      <p className="font-display italic text-sm sm:text-base md:text-lg text-text-secondary mb-5 line-clamp-2 max-w-xl [text-shadow:0_2px_16px_rgba(0,0,0,0.75)]">
                        {content}
                      </p>
                    )}

                    {ad.linkUrl && (
                      <a
                        href={ad.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-3 text-white text-sm sm:text-base tracking-[0.2em] uppercase no-underline py-3 px-8 rounded-[3px] cursor-pointer transition-all duration-300
                          bg-linear-to-br from-violet to-cyan shadow-[0_0_30px_rgba(124,58,237,0.3)]
                          hover:shadow-[0_0_50px_rgba(124,58,237,0.5),0_0_20px_rgba(6,182,212,0.3)] hover:-translate-y-0.5 active:scale-[0.97]"
                      >
                        <span>
                          {locale === "ar" ? "اكتشف الآن" : "Explore Now"}
                        </span>
                        <svg
                          width="14"
                          height="14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          viewBox="0 0 24 24"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </a>
                    )}
                  </motion.div>
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
