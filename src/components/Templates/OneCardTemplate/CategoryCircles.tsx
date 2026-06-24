"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useLocale, useTranslations } from "next-intl";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import type { Category } from "@/types/menu";
import LoadImage from "@/components/ImageLoad";

type CategoryCirclesProps = {
  categories: Category[];
  activeCategoryId: number;
  onSelect: (categoryId: number) => void;
  showAll?: boolean;
};

function getCategoryLabel(category: Category, locale: string): string {
  return locale === "ar"
    ? category.nameAr || category.name
    : category.nameEn || category.name;
}

export default function CategoryCircles({
  categories,
  activeCategoryId,
  onSelect,
  showAll = true,
}: CategoryCirclesProps) {
  const locale = useLocale();
  const t = useTranslations("menu");
  const direction = locale === "ar" ? "rtl" : "ltr";
  const allLabel = locale === "ar" ? "الكل" : "All";
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
    direction: direction as "ltr" | "rtl",
  });

  const updateScrollState = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const frame = requestAnimationFrame(() => updateScrollState());
    emblaApi.on("reInit", updateScrollState);
    emblaApi.on("select", updateScrollState);
    emblaApi.on("resize", updateScrollState);
    emblaApi.on("scroll", updateScrollState);
    return () => {
      cancelAnimationFrame(frame);
      emblaApi.off("reInit", updateScrollState);
      emblaApi.off("select", updateScrollState);
      emblaApi.off("resize", updateScrollState);
      emblaApi.off("scroll", updateScrollState);
    };
  }, [emblaApi, updateScrollState]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit({
      align: "start",
      containScroll: "trimSnaps",
      dragFree: true,
      direction: direction as "ltr" | "rtl",
    });
  }, [emblaApi, direction, categories.length]);

  useEffect(() => {
    if (!emblaApi) return;
    const index = showAll
      ? categories.findIndex((cat) => cat.id === activeCategoryId) + 1
      : categories.findIndex((cat) => cat.id === activeCategoryId);
    const target = activeCategoryId === 0 && showAll ? 0 : index;
    if (target >= 0) emblaApi.scrollTo(target);
  }, [emblaApi, activeCategoryId, categories, showAll]);

  const handleNav = (nav: "prev" | "next") => {
    if (!emblaApi) return;
    if (nav === "prev") emblaApi.scrollPrev();
    else emblaApi.scrollNext();
  };

  const renderCategoryButton = (
    id: number,
    label: string,
    imageSrc: string | null | undefined,
    isActive: boolean,
  ) => (
    <button
      key={id}
      type="button"
      onClick={() => onSelect(id)}
      className="flex w-[90px] shrink-0 flex-col items-center gap-2 transition-transform duration-200 ease-in hover:scale-[0.95]"
      aria-pressed={isActive}
    >
      <span
        className={`relative w-[60px] h-[60px] overflow-hidden rounded-full border-(--onecard-primary,#6b0fd6) ${
          isActive ? "border-4" : "border-[3px]"
        }`}
      >
        {imageSrc?.trim() ? (
          <LoadImage src={imageSrc} alt={label} fill className="object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-[#f3f0f8] text-2xl font-bold text-(--onecard-primary,#6b0fd6)">
            {label.charAt(0)}
          </span>
        )}
      </span>
      <span className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-sm font-semibold text-(--onecard-primary,#6b0fd6)">
        {label}
      </span>
      <span
        className={`w-7 h-[3px] rounded-sm transition-[background] duration-200 ease-in ${
          isActive ? "bg-(--onecard-primary,#6b0fd6)" : "bg-transparent"
        }`}
        aria-hidden
      />
    </button>
  );

  return (
    <div className="relative mb-6">
      <div className="px-6 py-4 rounded-2xl shadow-[0_0_24px_8px_rgba(0,0,0,0.08)]">
        <div className="min-w-0 overflow-hidden" ref={emblaRef}>
          <div
            className="flex gap-1"
            style={{ direction: direction as "ltr" | "rtl" }}
          >
            {showAll
              ? renderCategoryButton(0, allLabel, null, activeCategoryId === 0)
              : null}
            {categories.map((category) =>
              renderCategoryButton(
                category.id,
                getCategoryLabel(category, locale),
                category.image,
                category.id === activeCategoryId,
              ),
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label={t("scrollCategoriesPrev")}
        disabled={!canScrollPrev}
        onClick={() => handleNav("prev")}
        className="absolute top-1/2 -start-3 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-(--onecard-primary,#6b0fd6) text-white transition-[transform,opacity] duration-200 ease-in enabled:hover:scale-[1.08] disabled:cursor-default disabled:opacity-0 disabled:pointer-events-none"
      >
        <FiChevronLeft className="text-lg rtl:rotate-180" aria-hidden />
      </button>

      <button
        type="button"
        aria-label={t("scrollCategoriesNext")}
        disabled={!canScrollNext}
        onClick={() => handleNav("next")}
        className="absolute top-1/2 -end-3 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-(--onecard-primary,#6b0fd6) text-white transition-[transform,opacity] duration-200 ease-in enabled:hover:scale-[1.08] disabled:cursor-default disabled:opacity-0 disabled:pointer-events-none"
      >
        <FiChevronRight className="text-lg rtl:rotate-180" aria-hidden />
      </button>
    </div>
  );
}
