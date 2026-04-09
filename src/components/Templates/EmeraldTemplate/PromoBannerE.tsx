"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { useAppSelector } from "@/store/hooks";
import type { Ad } from "@/types/Ad";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/pagination";

export default function PromoBannerE() {
  const ads = useAppSelector((state) => state.menu.ads) ?? [];
  const locale = useLocale();
  const swiperRef = useRef<SwiperType | null>(null);
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
    } catch { }
    window.open(ad.linkUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="py-10 px-4 max-w-[1200px] mx-auto">
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        loop={sortedAds.length > 1}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        onSlideChange={(swiper) => setSelectedIndex(swiper.realIndex)}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        className="rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        {sortedAds.map((ad, i) => {
          const title = locale === "ar" ? ad.titleAr || ad.title : ad.title || ad.titleAr;
          const content = locale === "ar" ? ad.contentAr || ad.content : ad.content || ad.contentAr;

          return (
            <SwiperSlide key={ad.id}>
              <div
                className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] cursor-pointer group"
                onClick={() => handleAdClick(ad)}
              >
                <Image
                  src={ad.imageUrl}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  priority={i === 0}
                />

                <div className="absolute inset-0 bg-gradient-to-r from-[#2d0a12]/90 via-[#2d0a12]/40 to-transparent rtl:bg-gradient-to-l" />

                {/* Content */}
                <div className="relative h-full flex flex-col justify-center p-8 md:p-20 text-white max-w-3xl">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[#f5b0c4] text-xs font-bold mb-6 tracking-widest uppercase">
                      {locale === "ar" ? "اعلان" : "Sponsored"}
                    </span>

                    <h2 className="text-4xl md:text-6xl font-serif italic font-bold mb-6 leading-[1.1]">
                      {title}
                    </h2>

                    {content && (
                      <p className="text-lg md:text-xl text-white/80 mb-8 line-clamp-2 font-light max-w-xl">
                        {content}
                      </p>
                    )}

                    {ad.linkUrl && (
                      <div className="flex items-center gap-4 group/btn mt-auto">
                        <div className="h-12 px-8 rounded-full bg-[#f5b0c4] text-[#4c1121] flex items-center justify-center font-bold transition-all group-hover/btn:bg-white cursor-pointer">
                          {locale === "ar" ? "اكتشف الآن" : "Explore Now"}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {sortedAds.length > 1 && (
        <div className="flex justify-center gap-3 mt-6">
          {sortedAds.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 transition-all duration-500 rounded-full ${selectedIndex === i ? "w-10 bg-[#4c1121]" : "w-2 bg-stone-300"
                }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}