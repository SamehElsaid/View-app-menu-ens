"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import type { Category } from "@/types/menu";
import { useMusic } from "./MusicContext";
import { moodForIndex } from "./moodEnergy";

type GenresProps = {
  categories: Category[];
};

export default function Genres({ categories }: GenresProps) {
  const locale = useLocale();
  const { activeCategoryId, setActiveCategoryId } = useMusic();
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const active = activeRef.current;
    const scroller = scrollRef.current;
    if (!active || !scroller) return;

    const activeLeft = active.offsetLeft;
    const activeWidth = active.offsetWidth;
    const scrollerWidth = scroller.offsetWidth;
    const target = activeLeft - scrollerWidth / 2 + activeWidth / 2;

    scroller.scrollTo({ left: target, behavior: "smooth" });
  }, [activeCategoryId]);

  if (!categories.length) return null;

  const tabs: Array<{ id: number | null; label: string; moodIndex: number }> = [
    {
      id: null,
      label: locale === "ar" ? "الكل" : "All",
      moodIndex: 0,
    },
    ...categories.map((category, index) => ({
      id: category.id,
      label:
        locale === "ar"
          ? (category.nameAr ?? category.name)
          : (category.nameEn ?? category.name),
      moodIndex: index + 1,
    })),
  ];

  return (
    <section className="music-genres" aria-label="Categories">
      <p className="music-genres__label text-brand-tomato/55 transition-colors duration-300">
        {locale === "ar" ? "الأقسام" : "Categories"}
      </p>
      <div ref={scrollRef} className="music-genres-scroll">
        {tabs.map((tab) => {
          const isActive = activeCategoryId === tab.id;
          const chipMood =
            tab.id === null ? "tomato" : moodForIndex(tab.moodIndex);

          return (
            <button
              key={tab.id ?? "all"}
              ref={isActive ? activeRef : undefined}
              type="button"
              data-mood={chipMood}
              className={[
                "music-genre-chip relative shrink-0 scroll-snap-center overflow-visible",
                "rounded-full border px-5 py-2.5 min-h-[44px] text-sm font-medium",
                "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                isActive
                  ? "music-genre-chip--energy bg-brand-tomato text-brand-honeydew border-brand-tomato z-[1]"
                  : "bg-brand-sky/12 text-brand-tomato border-brand-sky/25 hover:bg-brand-sky/20 hover:scale-[1.02]",
              ].join(" ")}
              aria-pressed={isActive}
              onClick={() => setActiveCategoryId(tab.id)}
            >
              {isActive && (
                <span
                  className="music-genre-chip__aura pointer-events-none absolute inset-0 rounded-full"
                  aria-hidden
                  data-mood={chipMood}
                />
              )}
              <span className="relative z-[1]">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
