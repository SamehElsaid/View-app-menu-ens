"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useLocale, useTranslations } from "next-intl";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

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
  sticky = true,
  showNavButtons = false,
}: {
  categories: Category[];
  activeCategory: number;
  setActiveCategory: (id: number) => void;
  children: React.ReactNode;
  isGray?: boolean;
  /** When false, the bar scrolls with the page (no position: sticky). */
  sticky?: boolean;
  /** Show prev/next buttons when categories overflow horizontally. */
  showNavButtons?: boolean;
}) {
  const locale = useLocale();
  const t = useTranslations("menu");
  const direction = locale === "ar" ? "rtl" : "ltr";
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isScrollingRef = useRef<boolean>(false);
  const isObserverUpdateRef = useRef<boolean>(false);
  const isCarouselNavRef = useRef<boolean>(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: showNavButtons ? "start" : "center",
    containScroll: "keepSnaps",
    dragFree: !showNavButtons,
    direction: direction as "ltr" | "rtl",
    duration: 32,
  });

  const updateScrollState = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit({
      align: showNavButtons ? "start" : "center",
      containScroll: "keepSnaps",
      dragFree: !showNavButtons,
      direction: direction as "ltr" | "rtl",
      duration: 32,
    });
  }, [emblaApi, direction, showNavButtons]);

  useEffect(() => {
    if (!emblaApi) return;
    updateScrollState();
    emblaApi.on("reInit", updateScrollState);
    emblaApi.on("select", updateScrollState);
    emblaApi.on("resize", updateScrollState);
    emblaApi.on("scroll", updateScrollState);
    return () => {
      emblaApi.off("reInit", updateScrollState);
      emblaApi.off("select", updateScrollState);
      emblaApi.off("resize", updateScrollState);
      emblaApi.off("scroll", updateScrollState);
    };
  }, [emblaApi, updateScrollState]);

  const handleCarouselNav = useCallback(
    (navDirection: "prev" | "next") => {
      if (!emblaApi) return;
      isCarouselNavRef.current = true;
      const index = emblaApi.selectedScrollSnap();
      const lastIndex = Math.max(0, emblaApi.scrollSnapList().length - 1);
      const step = 2;
      const target =
        navDirection === "prev"
          ? Math.max(0, index - step)
          : Math.min(lastIndex, index + step);
      emblaApi.scrollTo(target);
      window.setTimeout(() => {
        isCarouselNavRef.current = false;
      }, 400);
    },
    [emblaApi],
  );

  // Scroll embla carousel to active category
  useEffect(() => {
    if (!emblaApi || isCarouselNavRef.current) return;
    const activeIndex = categories.findIndex(
      (cat) => cat.id === activeCategory,
    );
    if (activeIndex !== -1) {
      emblaApi.scrollTo(activeIndex);
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

  const stickyClasses = sticky
    ? `sticky z-50 ${isGray ? "bg-white/20 backdrop-blur-base lg:top-[100px] top-[60px]" : "bg-white lg:top-20 top-[60px]"}`
    : `relative z-10 rounded-2xl ${isGray ? "bg-white/20 backdrop-blur-base" : "bg-white"}`;

  const isScrollable = canScrollPrev || canScrollNext;
  const showSideNav = showNavButtons && isScrollable;
  const navButtonClass =
    "shrink-0 flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-sm transition-all duration-300 hover:border-(--bg-main) hover:bg-(--bg-main)/10 hover:text-(--bg-main) active:scale-95 disabled:cursor-default disabled:border-zinc-100 disabled:bg-zinc-50 disabled:text-zinc-300 disabled:shadow-none";

  return (
    <div className={`mb-10 text-black ${stickyClasses}`}>
      <div className="flex items-center gap-2 px-3 py-5 sm:gap-3 sm:px-5">
        {showSideNav ? (
          <button
            type="button"
            aria-label={t("scrollCategoriesPrev")}
            disabled={!canScrollPrev}
            onClick={() => handleCarouselNav("prev")}
            className={navButtonClass}
          >
            <FiChevronLeft className="text-lg rtl:rotate-180" aria-hidden />
          </button>
        ) : null}

        <div className="min-w-0 flex-1 overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4" style={{ direction: direction }}>
            {children}
          </div>
        </div>

        {showSideNav ? (
          <button
            type="button"
            aria-label={t("scrollCategoriesNext")}
            disabled={!canScrollNext}
            onClick={() => handleCarouselNav("next")}
            className={navButtonClass}
          >
            <FiChevronRight className="text-lg rtl:rotate-180" aria-hidden />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default SwiperCategory;
