"use client";

import { useRef, useState, useMemo } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { useAppSelector } from "@/store/hooks";
import type { Ad } from "@/types/Ad";
import { motion, AnimatePresence } from "framer-motion";
import "swiper/css";
import "swiper/css/effect-fade";

export default function PromoBannerOceanic() {
  const ads = useAppSelector((state) => state.menu.ads) ?? [];
  const locale = useLocale();
  const swiperRef = useRef<SwiperType | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const sortedAds = useMemo(() => {
    return [...ads]
      .filter((ad) => ad.position === "banner" && ad.imageUrl)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [ads]);

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
    <section className="py-8 px-4 max-w-5xl mx-auto overflow-hidden">
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        speed={750}
        loop={sortedAds.length > 1}
        roundLengths
        watchSlidesProgress
        autoplay={{ delay: 7000, disableOnInteraction: false }}
        onSlideChange={(swiper) => setSelectedIndex(swiper.realIndex)}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        className="rounded-2xl md:rounded-3xl overflow-hidden bg-slate-900"
      >
        {sortedAds.map((ad, i) => {
          const title = locale === "ar" ? ad.titleAr || ad.title : ad.title || ad.titleAr;
          const content = locale === "ar" ? ad.contentAr || ad.content : ad.content || ad.contentAr;

          return (
            <SwiperSlide key={ad.id}>
              <div
                className="relative w-full h-[200px] sm:h-[220px] md:h-[260px] cursor-pointer group"
                onClick={() => handleAdClick(ad)}
              >
                <Image
                  src={ad.imageUrl}
                  alt={title || "Ad"}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1280px"
                  className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                  priority={i === 0}
                />

                <div className="absolute inset-0 bg-gradient-to-r from-[#001a23]/95 via-[#001a23]/60 to-transparent rtl:bg-gradient-to-l" />

                <div className="relative h-full flex flex-col justify-center p-5 sm:p-6 md:p-10 text-white max-w-2xl">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedIndex}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{
                        duration: 0.52,
                        delay: 0.08,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/20 backdrop-blur-md text-cyan-300 text-[10px] sm:text-xs font-bold mb-3 tracking-[0.15em] uppercase border border-cyan-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                        {locale === "ar" ? "اعلان خاص" : "Special ADS"}
                      </span>

                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 leading-tight font-display tracking-tight line-clamp-2">
                        {title}
                      </h2>

                      {content && (
                        <p className="text-sm md:text-base text-white/70 mb-4 line-clamp-2 font-light max-w-lg leading-relaxed">
                          {content}
                        </p>
                      )}

                      {ad.linkUrl && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-cyan-600 text-white font-bold transition-all hover:bg-cyan-500 hover:shadow-[0_0_16px_rgba(6,182,212,0.35)] group/btn">
                          {locale === "ar" ? "اكتشف الآن" : "Explore Now"}
                          <motion.span 
                            className="inline-block"
                            animate={{ x: [0, 4, 0] }}
                            transition={{
                              repeat: Infinity,
                              duration: 2,
                              ease: [0.45, 0, 0.55, 1],
                            }}
                          >
                            →
                          </motion.span>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {sortedAds.length > 1 && (
        <div className="flex justify-center gap-3 mt-4">
          {sortedAds.map((_, i) => (
            <button
              key={i}
              onClick={() => swiperRef.current?.slideToLoop(i)}
              className={`h-2 transition-[width,background-color,box-shadow] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-full ${
                selectedIndex === i 
                  ? "w-12 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" 
                  : "w-2 bg-slate-300 hover:bg-slate-400"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}