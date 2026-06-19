"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { BiSolidCategory } from "react-icons/bi";
import LoadImage from "@/components/ImageLoad";
import type { Category } from "@/types/menu";
import { useOneCardTheme } from "./OneCardThemeContext";

function categoryLabel(cat: Category, locale: "ar" | "en"): string {
  const ar = cat.nameAr?.trim();
  const en = cat.nameEn?.trim();
  const fallback = cat.name?.trim();
  if (locale === "ar") return ar || en || fallback || "";
  return en || ar || fallback || "";
}

export type CategoryCirclesProps = {
  categories: Category[];
  activeCategoryId: number;
  onSelect: (categoryId: number) => void;
};

export default function CategoryCircles({
  categories,
  activeCategoryId,
  onSelect,
}: CategoryCirclesProps) {
  const locale = useLocale() as "ar" | "en";
  const { primary } = useOneCardTheme();
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const active = activeRef.current;
    const scroller = scrollRef.current;
    if (!active || !scroller) return;
    const target =
      active.offsetLeft - scroller.offsetWidth / 2 + active.offsetWidth / 2;
    scroller.scrollTo({ left: target, behavior: "smooth" });
  }, [activeCategoryId]);

  if (!categories.length) return null;

  return (
    <section
      className="px-2 pb-4 pt-1 sm:px-4"
      aria-label={locale === "ar" ? "تصنيفات القائمة" : "Menu categories"}
    >
      <div
        ref={scrollRef}
        className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        dir={locale === "ar" ? "rtl" : "ltr"}
      >
        <div className="mx-auto flex w-max min-w-full justify-center gap-4 px-2 sm:gap-5">
          {categories.map((category) => {
            const id = category.id as number;
            const isActive = activeCategoryId === id;
            const label = categoryLabel(category, locale);

            return (
              <button
                key={id}
                ref={isActive ? activeRef : undefined}
                type="button"
                onClick={() => onSelect(id)}
                className="group flex w-[4.5rem] shrink-0 flex-col items-center gap-2 sm:w-20"
                aria-pressed={isActive}
              >
                <div
                  className="relative h-[4.5rem] w-[4.5rem] overflow-hidden rounded-full bg-white shadow-md transition-transform duration-300 group-active:scale-95 sm:h-20 sm:w-20"
                  style={{
                    boxShadow: isActive
                      ? `0 8px 24px -8px ${primary}88`
                      : undefined,
                  }}
                >
                  {category.image ? (
                    <LoadImage
                      src={category.image}
                      alt={label}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center"
                      style={{
                        backgroundColor: `${primary}18`,
                        color: primary,
                      }}
                    >
                      <BiSolidCategory className="text-2xl" aria-hidden />
                    </div>
                  )}
                </div>
                <span
                  className={`line-clamp-2 text-center text-[11px] font-bold leading-tight sm:text-xs ${
                    isActive ? "border-b-2 pb-0.5" : ""
                  }`}
                  style={{
                    color: primary,
                    borderColor: isActive ? primary : undefined,
                  }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
