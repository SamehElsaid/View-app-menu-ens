"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

interface Ad {
  id: number;
  title: string;
  titleAr: string;
  content: string;
  contentAr: string;
  imageUrl: string;
  linkUrl: string;
  position: string;
}

interface PromoBannerProps {
  menuId?: number;
  ownerPlanType?: string;
}

export default function PromoBannerE({ menuId, ownerPlanType }: PromoBannerProps) {
  const locale = useLocale() as "ar" | "en";
  const [ads, setAds] = useState<Ad[]>([]);
  const [loadingAds, setLoadingAds] = useState(true);

  const isOwnerFreePlan = ownerPlanType === "free" || !ownerPlanType;

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const endpoint = isOwnerFreePlan
          ? `${apiUrl}/public/ads?position=banner&limit=5`
          : `${apiUrl}/public/menu/${menuId}/ads?position=banner&limit=5`;
        
        if (!isOwnerFreePlan && !menuId) return;

        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          setAds(data.data?.ads || []);
        }
      } catch (error) {
        console.error("Ad fetch error:", error);
      } finally {
        setLoadingAds(false);
      }
    };
    fetchAds();
  }, [isOwnerFreePlan, menuId]);

  const handleAdClick = async (ad: Ad) => {
    if (!ad.linkUrl) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      fetch(`${apiUrl}/admin/ads/${ad.id}/click`, { method: "POST" });
    } catch {}
    window.open(ad.linkUrl, "_blank", "noopener,noreferrer");
  };

  if (loadingAds || ads.length === 0) return null;

  const isSingle = ads.length === 1;

  return (
    <section className="py-8 px-4">
      <div className={`grid gap-5 ${isSingle ? "grid-cols-1" : "md:grid-cols-2"}`}>
        <AnimatePresence>
          {ads.map((ad, i) => {
            const title = locale === "ar" ? ad.titleAr || ad.title : ad.title || ad.titleAr;
            const content = locale === "ar" ? ad.contentAr || ad.content : ad.content || ad.contentAr;

            return (
              <motion.div
                key={ad.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                onClick={() => handleAdClick(ad)}
                className="group relative h-[200px] md:h-[240px] rounded-2xl overflow-hidden cursor-pointer
                           shadow-[0_4px_24px_rgba(76,17,33,0.08)]
                           hover:shadow-[0_12px_40px_rgba(76,17,33,0.16)]
                           transition-shadow duration-400"
              >
                <div className="absolute inset-0">
                  {ad.imageUrl ? (
                    <img
                      src={ad.imageUrl}
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#4c1121] via-[#6b1a30] to-[#9b2545]" />
                  )}
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-[#2d0a12]/90 via-[#4c1121]/40 to-black/5" />

                <div className="relative h-full flex flex-col justify-end p-5 md:p-7">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-[1.5px] bg-[#f5b0c4] rounded-full" />
                    <span className="font-sans text-[10px] font-600 uppercase tracking-[0.15em] text-[#f5b0c4]">
                      {locale === "ar" ? "عرض مميز" : "Featured"}
                    </span>
                  </div>

                  <h3 className="font-serif italic text-white text-lg md:text-xl font-700 leading-snug mb-1.5 line-clamp-2">
                    {title}
                  </h3>

                  {content && (
                    <p className="font-sans text-white/70 text-xs md:text-sm leading-relaxed line-clamp-2 mb-3">
                      {content}
                    </p>
                  )}

                  {ad.linkUrl && (
                    <div className="flex items-center gap-2 mt-auto">
                      <span className="font-sans text-[11px] font-600 tracking-wide text-[#f5b0c4] group-hover:text-white transition-colors duration-300">
                        {locale === "ar" ? "اكتشف المزيد" : "Explore"}
                      </span>
                      <svg
                        width="12" height="12" viewBox="0 0 12 12" fill="none"
                        className="text-[#f5b0c4] group-hover:text-white group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 rtl:rotate-180 transition-all duration-300"
                      >
                        <path d="M2.5 6h7M7 3.5L9.5 6 7 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 group-hover:ring-[#f5b0c4]/30 transition-all duration-400" />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}
