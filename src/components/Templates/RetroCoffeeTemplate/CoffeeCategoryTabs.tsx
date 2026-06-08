"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import type { Category } from "@/types/menu";
import { useCoffee } from "./CoffeeContext";
import {
  RETRO_SURFACE,
  RETRO_SURFACE_BORDER,
  useCoffeeTheme,
} from "./CoffeeThemeContext";

function categoryLabel(cat: Category, locale: "ar" | "en"): string {
  const ar = cat.nameAr?.trim();
  const en = cat.nameEn?.trim();
  const fallback = cat.name?.trim();
  if (locale === "ar") return ar || en || fallback || "";
  return en || ar || fallback || "";
}

export type CoffeeCategoryTabsProps = {
  categories: Category[];
};

export default function CoffeeCategoryTabs({
  categories,
}: CoffeeCategoryTabsProps) {
  const locale = useLocale() as "ar" | "en";
  const { activeCategoryId, setActiveCategoryId } = useCoffee();
  const { colors, primary } = useCoffeeTheme();
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

  const selectCategory = (categoryId: number | null) => {
    setActiveCategoryId(categoryId);
    window.setTimeout(() => {
      document.getElementById("retro-menu-products")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  if (!categories.length) return null;

  const tabs: Array<{ id: number | null; label: string }> = [
    { id: null, label: locale === "ar" ? "الكل" : "All" },
    ...categories.map((cat) => ({
      id: cat.id,
      label: categoryLabel(cat, locale),
    })),
  ];

  return (
    <section
      className="retro-categories sticky top-[var(--retro-nav-offset)] z-30 -mx-3 mb-6 px-3 py-2.5 sm:-mx-6 sm:mb-8 sm:px-6 sm:py-3 md:mb-10"
      style={{
        backgroundColor: "rgb(244 235 217 / 50%)",
        borderColor: RETRO_SURFACE_BORDER,
      }}
      aria-label={locale === "ar" ? "تصنيفات القائمة" : "Menu categories"}
    >
      <div
        ref={scrollRef}
        className="overflow-x-auto py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        dir={locale === "ar" ? "rtl" : "ltr"}
      >
        <div
          className="mx-auto flex w-max min-w-full justify-center gap-2 px-1 snap-x snap-mandatory sm:gap-2.5"
          role="tablist"
        >
          {tabs.map((tab) => {
            const isActive = activeCategoryId === tab.id;
            return (
              <button
                key={tab.id ?? "all"}
                ref={isActive ? activeRef : undefined}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => selectCategory(tab.id)}
                className="shrink-0 snap-center rounded-full border px-4 py-2 text-xs font-bold tracking-wide transition-all duration-300 min-h-[42px] select-none active:scale-[0.95] sm:min-h-[44px] sm:px-5 sm:py-2.5 sm:text-sm"
                style={
                  isActive
                    ? {
                        backgroundColor: primary,
                        borderColor: primary,
                        color: "#fff",
                        boxShadow: `0 6px 16px -4px ${primary}88`,
                      }
                    : {
                        backgroundColor: RETRO_SURFACE,
                        borderColor: RETRO_SURFACE_BORDER,
                        color: colors.text,
                        boxShadow: "0 2px 8px -2px rgba(0, 0, 0, 0.04)",
                      }
                }
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
