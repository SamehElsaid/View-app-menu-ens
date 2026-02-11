"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";

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

const PromoBanner = ({ menuId, ownerPlanType }: PromoBannerProps) => {
  const locale = useLocale();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loadingAds, setLoadingAds] = useState(true);

  // Check if owner is on free plan (show global ads only for free users)
  const isOwnerFreePlan = ownerPlanType === "free" || !ownerPlanType;

  // Fetch ads based on owner plan type
  useEffect(() => {
    if (isOwnerFreePlan) {
      // Free users: fetch global ads
      fetchGlobalAds();
    } else if (menuId) {
      // Pro users: fetch menu-specific custom ads
      fetchCustomAds();
    } else {
      setLoadingAds(false);
    }
  }, [isOwnerFreePlan, menuId]);

  const fetchGlobalAds = async () => {
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const response = await fetch(
        `${apiUrl}/public/ads?position=banner&limit=5`,
      );
      if (response.ok) {
        const data = await response.json();
        const fetchedAds = data.data?.ads || [];
        setAds(fetchedAds);
      }
    } catch (error) {
      console.error("Error fetching global ads:", error);
    } finally {
      setLoadingAds(false);
    }
  };

  const fetchCustomAds = async () => {
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const response = await fetch(
        `${apiUrl}/public/menu/${menuId}/ads?position=banner&limit=5`,
      );
      if (response.ok) {
        const data = await response.json();
        const fetchedAds = data.data?.ads || [];
        setAds(fetchedAds);
      }
    } catch (error) {
      console.error("Error fetching custom ads:", error);
    } finally {
      setLoadingAds(false);
    }
  };

  // Track ad click
  const handleAdClick = async (ad: Ad) => {
    if (ad.linkUrl) {
      // Track click
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        await fetch(`${apiUrl}/admin/ads/${ad.id}/click`, {
          method: "POST",
        });
      } catch (error) {
        console.error("Error tracking ad click:", error);
      }
      // Open link
      window.open(ad.linkUrl, "_blank", "noopener,noreferrer");
    }
  };

  // Don't show if loading
  if (loadingAds) return null;

  // Show nothing if no ads (silently)
  if (ads.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      <div className="grid gap-6 md:grid-cols-2">
        {ads.map((ad, index) => {
          const title =
            locale === "ar" ? ad.titleAr || ad.title : ad.title || ad.titleAr;
          const content =
            locale === "ar"
              ? ad.contentAr || ad.content
              : ad.content || ad.contentAr;

          return (
            <div
              key={ad.id}
              className={`relative overflow-hidden rounded-xl group cursor-pointer animate-fade-in ${
                ads.length === 1 ? "md:col-span-2" : ""
              }`}
              style={{ animationDelay: `${index * 150}ms` }}
              onClick={() => handleAdClick(ad)}
            >
              {/* Background Image */}
              <div className="relative h-48 md:h-56">
                {ad.imageUrl ? (
                  <img
                    src={ad.imageUrl}
                    alt={title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => {
                      // Hide image if it fails to load
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#F2B705]/20 to-[#17120F] flex items-center justify-center">
                    <div className="text-center p-6">
                      <div className="w-16 h-16 bg-[#F2B705]/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🎯</span>
                      </div>
                    </div>
                  </div>
                )}
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#17120F]/90 via-[#17120F]/60 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-8">
                  <h3 className="font-heading text-2xl md:text-3xl font-bold text-[#F4EEE7] mb-2">
                    {title}
                  </h3>
                  {content && (
                    <p className="text-lg md:text-xl font-semibold text-[#F2B705]">
                      {content}
                    </p>
                  )}
                </div>

                {/* Border glow on hover */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#F2B705]/50 rounded-xl transition-colors duration-300" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PromoBanner;
