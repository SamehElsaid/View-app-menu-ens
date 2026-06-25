"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import {
  GiHamburger,
  GiCoffeeCup,
  GiCupcake,
  GiNoodles,
  GiFrenchFries,
  GiPizzaSlice,
  GiSandwich,
  GiChickenLeg,
  GiCookie,
  GiDonut,
  GiIceCreamCone,
  GiBowlOfRice,
} from "react-icons/gi";
import { MdRestaurantMenu } from "react-icons/md";
import type { IconType } from "react-icons";
import type { Category } from "@/types/menu";
import LoadImage from "@/components/ImageLoad";

const FALLBACK_ICONS: IconType[] = [
  GiHamburger,
  GiPizzaSlice,
  GiCupcake,
  GiNoodles,
  GiFrenchFries,
  GiCoffeeCup,
  GiSandwich,
  GiChickenLeg,
  GiCookie,
  GiDonut,
  GiIceCreamCone,
  GiBowlOfRice,
];

function getFallbackIcon(id: number): IconType {
  if (id === 0) return MdRestaurantMenu;
  return FALLBACK_ICONS[Math.abs(id) % FALLBACK_ICONS.length];
}

function getCategoryLabel(category: Category, locale: string): string {
  return locale === "ar"
    ? category.nameAr || category.name
    : category.nameEn || category.name;
}

type CategoryFilterButtonProps = {
  id: number;
  label: string;
  imageSrc: string | null | undefined;
  isActive: boolean;
  onSelect: (id: number) => void;
};

const CategoryFilterButton = memo(function CategoryFilterButton({
  id,
  label,
  imageSrc,
  isActive,
  onSelect,
}: CategoryFilterButtonProps) {
  const [imgError, setImgError] = useState(false);
  const showFallback = !imageSrc?.trim() || imgError;
  const FallbackIcon = getFallbackIcon(id);

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      aria-pressed={isActive}
      className={`flex shrink-0 flex-col items-center gap-2 min-w-[76px] max-w-[96px] transition-transform duration-200 ease-in hover:scale-[0.95]`}
    >
      <span
        className={`relative flex h-[56px] w-[56px] shrink-0 overflow-hidden rounded-full transition-all duration-200 ${
          isActive
            ? "border-4 border-[#F2B705] shadow-[0_0_10px_rgba(242,183,5,0.4)]"
            : "border-[3px] border-[#3B332E]"
        }`}
      >
        {showFallback ? (
          <span
            className={`flex h-full w-full items-center justify-center ${
              isActive ? "bg-[#F2B705]/15 text-[#F2B705]" : "bg-[#2a2520] text-[#857a6c]"
            }`}
          >
            <FallbackIcon size={24} aria-hidden />
          </span>
        ) : (
          <LoadImage
            src={imageSrc!}
            alt={label}
            height={200}
            width={200}
            fill
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        )}
      </span>

      <span
        className={`w-full text-center text-xs font-semibold leading-tight transition-colors duration-200 ${
          isActive ? "text-[#F2B705]" : "text-[#B6AA99]"
        }`}
      >
        {label}
      </span>

      <span
        className={`h-[3px] w-6 rounded-sm transition-[background] duration-200 ${
          isActive ? "bg-[#F2B705]" : "bg-transparent"
        }`}
        aria-hidden
      />
    </button>
  );
});

type CategoryFilterProps = {
  categories: Category[];
  activeCategoryId: number;
  onSelect: (categoryId: number) => void;
};

function CategoryFilterInner({
  categories,
  activeCategoryId,
  onSelect,
}: CategoryFilterProps) {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const allLabel = isRtl ? "الكل" : "All";

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) {
      setCanScrollPrev(false);
      setCanScrollNext(false);
      return;
    }
    const absScroll = Math.abs(el.scrollLeft);
    setCanScrollPrev(absScroll > 2);
    setCanScrollNext(absScroll < maxScroll - 2);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const frame = requestAnimationFrame(updateScrollState);
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const inner = el.firstElementChild as HTMLElement | null;
    if (!inner) return;
    const children = Array.from(inner.children) as HTMLElement[];

    let idx: number;
    if (activeCategoryId === 0) {
      idx = 0;
    } else {
      const catIdx = categories.findIndex((c) => c.id === activeCategoryId);
      idx = catIdx + 1;
    }

    const child = children[idx];
    if (!child) return;

    const containerRect = el.getBoundingClientRect();
    const childRect = child.getBoundingClientRect();
    const delta =
      childRect.left +
      childRect.width / 2 -
      (containerRect.left + containerRect.width / 2);

    el.scrollBy({ left: delta, behavior: "smooth" });
  }, [activeCategoryId, categories]);

  const handleNav = useCallback(
    (nav: "prev" | "next") => {
      const el = scrollRef.current;
      if (!el) return;
      const sign = isRtl ? -1 : 1;
      el.scrollBy({
        left: (nav === "next" ? 200 : -200) * sign,
        behavior: "smooth",
      });
    },
    [isRtl],
  );

  if (!categories.length) return null;

  return (
    <div className="relative mb-8 mt-2">
      <div className="rounded-2xl border border-[#3B332E] bg-[#1c1815]/80 px-4 py-3 backdrop-blur-sm">
        <div
          ref={scrollRef}
          className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          dir={isRtl ? "rtl" : "ltr"}
        >
          <div
            className="flex gap-1"
            style={{ direction: isRtl ? "rtl" : "ltr" }}
          >
            <CategoryFilterButton
              id={0}
              label={allLabel}
              imageSrc={null}
              isActive={activeCategoryId === 0}
              onSelect={onSelect}
            />
            {categories.map((category) => (
              <CategoryFilterButton
                key={category.id}
                id={category.id}
                label={getCategoryLabel(category, locale)}
                imageSrc={category.image}
                isActive={category.id === activeCategoryId}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label={isRtl ? "السابق" : "Previous"}
        disabled={!canScrollPrev}
        onClick={() => handleNav("prev")}
        className="absolute top-1/2 -start-3 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#F2B705] text-[#17120F] transition-[transform,opacity] duration-200 enabled:hover:scale-[1.08] disabled:pointer-events-none disabled:cursor-default disabled:opacity-0"
      >
        <FiChevronLeft className="text-base rtl:rotate-180" aria-hidden />
      </button>

      <button
        type="button"
        aria-label={isRtl ? "التالي" : "Next"}
        disabled={!canScrollNext}
        onClick={() => handleNav("next")}
        className="absolute top-1/2 -end-3 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#F2B705] text-[#17120F] transition-[transform,opacity] duration-200 enabled:hover:scale-[1.08] disabled:pointer-events-none disabled:cursor-default disabled:opacity-0"
      >
        <FiChevronRight className="text-base rtl:rotate-180" aria-hidden />
      </button>
    </div>
  );
}

export default memo(CategoryFilterInner);
