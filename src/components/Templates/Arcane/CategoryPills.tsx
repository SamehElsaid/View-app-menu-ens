"use client";

import type { Category } from "@/types/menu";
import { useArcaneTheme } from "./ArcaneThemeContext";

type CategoryPillsProps = {
  categories: Category[];
  active: number;
  onChange: (id: number) => void;
  locale: "ar" | "en";
};

export default function CategoryPills({
  categories,
  active,
  onChange,
  locale,
}: CategoryPillsProps) {
  const { primary } = useArcaneTheme();

  const tabs: Category[] = [
    { id: 0, name: "All", nameAr: "الكل", nameEn: "All", menuItems: [] },
    ...categories,
  ];

  return (
    <div
      className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-2 scroll-smooth snap-x sm:-mx-0 sm:mb-12 sm:flex-wrap sm:justify-center sm:gap-3 sm:overflow-visible sm:px-0 md:mb-16"
      role="tablist"
      aria-label={locale === "ar" ? "التصنيفات" : "Categories"}
    >
      {tabs.map((cat) => {
        const isActive = cat.id === active;
        return (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(cat.id)}
            className="shrink-0 snap-start rounded-full border-2 px-4 py-2 text-xs font-black uppercase tracking-wide transition-colors sm:px-6 sm:py-2.5 sm:text-sm"
            style={{
              borderColor: isActive ? primary : "#e5e5e5",
              backgroundColor: isActive ? primary : "transparent",
              color: isActive ? "#FFFFFF" : "#111111",
            }}
          >
            {locale === "ar"
              ? (cat.nameAr ?? cat.name)
              : (cat.nameEn ?? cat.name)}
          </button>
        );
      })}
    </div>
  );
}
