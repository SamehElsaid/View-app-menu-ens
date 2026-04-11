import { useRef, useState } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { useAppSelector } from "@/store/hooks";
import { Ad } from "@/types/Ad";
import "swiper/css";
import "swiper/css/pagination";

export default function AdVBanner() {
  const ads = useAppSelector((state) => state.menu.ads) ?? [];
  const locale = useLocale();
  const rtl = locale === "ar";
  const direction = rtl ? "rtl" : "ltr";
  const swiperRef = useRef<SwiperType | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter and sort ads by displayOrder
  const sortedAds = [...ads]
    .filter((ad) => ad.position === "banner" && ad.imageUrl)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  // If no ads, don't render
  if (sortedAds.length === 0) {
    return null;
  }

  const handleAdClick = async (ad: Ad) => {
    if (ad.linkUrl) {
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/ads/${ad.id}/click`,
          { method: "POST" },
        );
      } catch (error) {
        console.error("Error tracking ad click:", error);
      }
      window.open(ad.linkUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <section
      className="py-4 sm:py-6 relative overflow-hidden mb-10"
      aria-label={locale === "ar" ? "إعلانات" : "Advertisements"}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div dir={direction} className="relative">
          <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl ring-1 ring-black/10 ring-offset-1 ring-offset-stone-50">
            <Swiper
              modules={[Autoplay, Navigation, Pagination]}
              dir={direction}
              loop={sortedAds.length > 1}
              autoplay={
                sortedAds.length > 1
                  ? {
                      delay: 5000,
                      disableOnInteraction: false,
                      pauseOnMouseEnter: true,
                    }
                  : false
              }
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              onSlideChange={(swiper) => {
                setSelectedIndex(swiper.realIndex);
              }}
              className="w-full"
            >
              {sortedAds.map((ad) => {
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
                      className={`relative w-full h-[220px] sm:h-[300px] md:h-[380px] cursor-pointer group ${
                        ad.linkUrl
                          ? "hover:scale-[1.02] transition-transform duration-300"
                          : ""
                      }`}
                      onClick={() => handleAdClick(ad)}
                    >
                      {/* Background Image */}
                      <div className="absolute inset-0">
                        <Image
                          src={ad.imageUrl}
                          alt={title}
                          fill
                          className="object-cover"
                          priority
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                        />
                        {/* Gradient Overlay — أغمق على الجانب النصّي لقراءة أوضح */}
                        <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/65 to-black/35" />
                      </div>

                      {/* شارة إعلان ثابتة أعلى الصورة */}
                      <div
                        className={`absolute top-2.5 z-20 flex items-center gap-1.5 rounded-full border border-white/80 bg-black/75 px-2 py-1 text-white shadow-md backdrop-blur-sm sm:top-3 sm:px-2.5 sm:py-1 ${
                          rtl ? "left-3 sm:left-5" : "right-3 sm:right-5"
                        }`}
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
                      <div
                        className={`relative z-10 h-full flex flex-col justify-center items-start p-5 pt-14 sm:p-7 sm:pt-16 md:p-10 md:pt-12 text-white ${
                          sortedAds.length > 1
                            ? "pl-14 pr-14 sm:pl-16 sm:pr-16 md:pl-20 md:pr-20"
                            : ""
                        }`}
                      >
                        {/* Title */}
                        <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 leading-tight max-w-2xl [text-shadow:0_4px_28px_rgba(0,0,0,0.85)]">
                          {title}
                        </h3>

                        {/* Description */}
                        {content && (
                          <p className="text-xs sm:text-sm md:text-base text-white mb-4 max-w-xl leading-relaxed line-clamp-2 font-medium [text-shadow:0_2px_14px_rgba(0,0,0,0.75)]">
                            {content}
                          </p>
                        )}

                        {/* CTA Button */}
                        {ad.linkUrl && (
                          <button
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-full border border-white/40 bg-white/25 backdrop-blur-md hover:bg-white/40 text-white font-semibold shadow-md transition-all duration-300 group-hover:translate-x-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAdClick(ad);
                            }}
                          >
                            <span>
                              {locale === "ar" ? "اعرف المزيد" : "Learn More"}
                            </span>
                            <svg
                              className={`w-4 h-4 transition-transform ${
                                rtl
                                  ? "group-hover:-translate-x-1"
                                  : "group-hover:translate-x-1"
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d={rtl ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>

          {/* Custom Navigation Buttons */}
          {sortedAds.length > 1 && (
            <>
              <button
                onClick={() => swiperRef.current?.slidePrev()}
                className={`absolute top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 ${
                  rtl ? "right-2 sm:right-4" : "left-2 sm:left-4"
                }`}
                aria-label="Previous"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={rtl ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
                  />
                </svg>
              </button>
              <button
                onClick={() => swiperRef.current?.slideNext()}
                className={`absolute top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 ${
                  rtl ? "left-2 sm:left-4" : "right-2 sm:right-4"
                }`}
                aria-label="Next"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={rtl ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
                  />
                </svg>
              </button>
            </>
          )}

          {/* Custom Pagination */}
          {sortedAds.length > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              {sortedAds.map((_, index) => (
                <button
                  key={index}
                  onClick={() => swiperRef.current?.slideTo(index)}
                  className={`transition-all duration-300 rounded-full ${
                    selectedIndex === index
                      ? "w-8 h-3 bg-white"
                      : "w-3 h-3 bg-white/40 hover:bg-white/60"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
