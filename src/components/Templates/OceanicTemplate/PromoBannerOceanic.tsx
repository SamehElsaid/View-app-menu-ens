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
    <section className="py-16 px-4 max-w-[1300px] mx-auto overflow-hidden">
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        loop={sortedAds.length > 1}
        autoplay={{ delay: 7000, disableOnInteraction: false }}
        onSlideChange={(swiper) => setSelectedIndex(swiper.realIndex)}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        className="rounded-[2rem] md:rounded-[3rem]  overflow-hidden bg-slate-900"
      >
        {sortedAds.map((ad, i) => {
          const title = locale === "ar" ? ad.titleAr || ad.title : ad.title || ad.titleAr;
          const content = locale === "ar" ? ad.contentAr || ad.content : ad.content || ad.contentAr;

          return (
            <SwiperSlide key={ad.id}>
              <div
                className="relative w-full h-[350px] md:h-[400px] cursor-pointer group"
                onClick={() => handleAdClick(ad)}
              >
                <Image
                  src={ad.imageUrl}
                  alt={title || "Ad"}
                  fill
                  className="object-cover transition-transform duration-[3s] group-hover:scale-110"
                  priority={i === 0}
                />

                <div className="absolute inset-0 bg-gradient-to-r from-[#001a23]/95 via-[#001a23]/60 to-transparent rtl:bg-gradient-to-l" />

                <div className="relative h-full flex flex-col justify-center p-8 md:p-24 text-white max-w-4xl">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-cyan-500/20 backdrop-blur-md text-cyan-300 text-xs font-bold mb-6 tracking-[0.2em] uppercase border border-cyan-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                        {locale === "ar" ? "اعلان خاص" : "Special ADS"}
                      </span>

                      <h2 className="text-4xl md:text-7xl font-bold mb-6 leading-tight font-display tracking-tight">
                        {title}
                      </h2>

                      {content && (
                        <p className="text-lg md:text-xl text-white/70 mb-10 line-clamp-2 font-light max-w-xl leading-relaxed">
                          {content}
                        </p>
                      )}

                      {ad.linkUrl && (
                        <div className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-cyan-600 text-white font-bold transition-all hover:bg-cyan-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] group/btn">
                          {locale === "ar" ? "اكتشف الآن" : "Explore Now"}
                          <motion.span 
                            className="inline-block"
                            animate={{ x: [0, 5, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
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
        <div className="flex justify-center gap-4 mt-8">
          {sortedAds.map((_, i) => (
            <button
              key={i}
              onClick={() => swiperRef.current?.slideToLoop(i)}
              className={`h-2 transition-all duration-500 rounded-full ${
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