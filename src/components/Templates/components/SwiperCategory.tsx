"use client";

import { useEffect, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useLocale } from "next-intl";

interface Category {
  id: number;
  name?: string;
  nameAr?: string;
  image?: string | null;
  isGray?: boolean;
}

function SwiperCategory({
  categories,
  activeCategory,
  setActiveCategory,
  children,
  isGray = false,
}: {
  categories: Category[];
  activeCategory: number;
  setActiveCategory: (id: number) => void;
  children: React.ReactNode;
  isGray?: boolean;
}) {
  const locale = useLocale();
  const direction = locale === "ar" ? "rtl" : "ltr";
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isScrollingRef = useRef<boolean>(false);
  const isObserverUpdateRef = useRef<boolean>(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: "keepSnaps",
    dragFree: true,
    direction: direction as "ltr" | "rtl",
  });

  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit({ direction: direction as "ltr" | "rtl" });
    }
  }, [emblaApi, direction]);

  // Scroll embla carousel to active category
  useEffect(() => {
    if (emblaApi) {
      const activeIndex = categories.findIndex(
        (cat) => cat.id === activeCategory,
      );
      if (activeIndex !== -1) {
        emblaApi.scrollTo(activeIndex, true);
      }
    }
  }, [emblaApi, activeCategory, categories]);

  // Scroll page to active category section (only on user click, not observer)
  useEffect(() => {
    if (isObserverUpdateRef.current) {
      isObserverUpdateRef.current = false;
      return;
    }

    isScrollingRef.current = true;

    if (activeCategory === 0) {
      const menuSection = document.querySelector("section.relative.w-full");
      if (menuSection) {
        menuSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      const element = document.getElementById(`category-${activeCategory}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    const timeout = setTimeout(() => {
      isScrollingRef.current = false;
    }, 1000);

    return () => clearTimeout(timeout);
  }, [activeCategory]);

  // Intersection Observer for scroll spy
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      if (isScrollingRef.current) {
        return;
      }

      let mostVisibleEntry: IntersectionObserverEntry | null = null;
      let maxRatio = 0;

      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
          maxRatio = entry.intersectionRatio;
          mostVisibleEntry = entry;
        }
      }

      if (mostVisibleEntry !== null) {
        const targetElement = mostVisibleEntry.target as HTMLElement;
        const categoryId = targetElement.id.replace("category-", "");
        const categoryIdNumber = parseInt(categoryId, 10);

        if (!isNaN(categoryIdNumber) && categoryIdNumber !== activeCategory) {
          isObserverUpdateRef.current = true;
          setActiveCategory(categoryIdNumber);
        }
      }
    };

    observerRef.current = new IntersectionObserver(observerCallback, {
      rootMargin: "-20% 0px -60% 0px",
      threshold: [0, 0.25, 0.5, 0.75, 1],
    });

    categories.forEach((category) => {
      if (category.id !== 0) {
        const element = document.getElementById(`category-${category.id}`);
        if (element && observerRef.current) {
          observerRef.current.observe(element);
        }
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [categories, activeCategory, setActiveCategory]);

  return (
    <div
      className={`mb-20 sticky  z-50 text-black ${isGray ? "bg-white/20 backdrop-blur-sm lg:top-[100px] top-[60px] " : "bg-white lg:top-[80px] top-[60px] "} `}
    >
      <div className="overflow-hidden py-5 px-5  " ref={emblaRef}>
        <div className="flex gap-4" style={{ direction: direction }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default SwiperCategory;
