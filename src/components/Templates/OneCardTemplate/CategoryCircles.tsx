"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import type { Category } from "@/types/menu";

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

// ─── Memoized button — only the two toggled buttons re-render on selection change ─

type CategoryButtonProps = {
  id: number;
  label: string;
  imageSrc: string | null | undefined;
  isActive: boolean;
  onSelect: (id: number) => void;
};

const CategoryButton = memo(function CategoryButton({
  id,
  label,
  imageSrc,
  isActive,
  onSelect,
}: CategoryButtonProps) {
  const [imgError, setImgError] = useState(false);
  const showFallback = !imageSrc?.trim() || imgError;

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className="flex w-[90px] shrink-0 flex-col items-center gap-2 transition-transform duration-200 ease-in hover:scale-[0.95]"
      aria-pressed={isActive}
    >
      <span
        className={`relative flex h-[60px] w-[60px] shrink-0 overflow-hidden rounded-full border-(--onecard-primary,#6b0fd6) ${
          isActive ? "border-4" : "border-[3px]"
        }`}
      >
        {showFallback ? (
          <span className="flex h-full w-full items-center justify-center bg-[#f3f0f8] text-2xl font-bold text-(--onecard-primary,#6b0fd6)">
            {label.charAt(0)}
          </span>
        ) : (
          <img
            src={imageSrc!}
            alt={label}
            loading="eager"
            decoding="async"
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        )}
      </span>
      <span className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-sm font-semibold text-(--onecard-primary,#6b0fd6)">
        {label}
      </span>
      <span
        className={`h-[3px] w-7 rounded-sm transition-[background] duration-200 ease-in ${
          isActive ? "bg-(--onecard-primary,#6b0fd6)" : "bg-transparent"
        }`}
        aria-hidden
      />
    </button>
  );
});

// ─── Main component ───────────────────────────────────────────────────────────

function CategoryCirclesInner({
  categories,
  activeCategoryId,
  onSelect,
  showAll = true,
}: CategoryCirclesProps) {
  const locale = useLocale();
  const t = useTranslations("menu");
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
    // Math.abs normalizes for LTR (positive scrollLeft) and Chrome/Safari/Edge RTL
    // (negative scrollLeft). Firefox RTL uses a positive-inverted convention which
    // is a minor edge-case – button visibility may be swapped there but still works.
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

  // Scroll active category button into view without touching page scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const inner = el.firstElementChild as HTMLElement | null;
    if (!inner) return;
    const children = Array.from(inner.children) as HTMLElement[];

    let idx: number;
    if (activeCategoryId === 0 && showAll) {
      idx = 0;
    } else {
      const catIdx = categories.findIndex((c) => c.id === activeCategoryId);
      idx = showAll ? catIdx + 1 : catIdx;
    }

    const child = children[idx];
    if (!child) return;

    // Use screen-space delta so direction-agnostic (works for both LTR and RTL).
    const containerRect = el.getBoundingClientRect();
    const childRect = child.getBoundingClientRect();
    const delta =
      childRect.left + childRect.width / 2 -
      (containerRect.left + containerRect.width / 2);

    el.scrollBy({ left: delta, behavior: "smooth" });
  }, [activeCategoryId, categories, showAll]);

  const handleNav = useCallback(
    (nav: "prev" | "next") => {
      const el = scrollRef.current;
      if (!el) return;
      // In RTL the logical "next" direction is to the left (negative scrollLeft in Chrome)
      const sign = isRtl ? -1 : 1;
      el.scrollBy({
        left: (nav === "next" ? 200 : -200) * sign,
        behavior: "smooth",
      });
    },
    [isRtl],
  );

  return (
    <div className="relative mb-6">
      <div className="px-6 py-4 rounded-2xl shadow-[0_0_24px_8px_rgba(0,0,0,0.08)]">
        <div
          ref={scrollRef}
          className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          dir={isRtl ? "rtl" : "ltr"}
        >
          <div
            className="flex gap-1"
            style={{ direction: isRtl ? "rtl" : "ltr" }}
          >
            {showAll ? (
              <CategoryButton
                id={0}
                label={allLabel}
                imageSrc={null}
                isActive={activeCategoryId === 0}
                onSelect={onSelect}
              />
            ) : null}
            {categories.map((category) => (
              <CategoryButton
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

export default memo(CategoryCirclesInner);
