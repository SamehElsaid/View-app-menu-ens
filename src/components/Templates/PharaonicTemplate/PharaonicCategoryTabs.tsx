"use client";

import { useLocale } from "next-intl";
import type { Category } from "@/types/menu";
import {
  usePharaonicTheme,
  hexToRgba,
  shadowGlow,
} from "./PharaonicThemeContext";
import { HieroglyphBorder } from "./PharaonicDecor";
import { pharaonicDisplayFont } from "./PharaonicFonts";

function categoryTabLabel(cat: Category, locale: "ar" | "en"): string {
  const ar = cat.nameAr?.trim();
  const en = cat.nameEn?.trim();
  const fallback = cat.name?.trim();
  if (locale === "ar") return ar || en || fallback || "";
  return en || ar || fallback || "";
}

type PharaonicCategoryTabsProps = {
  categories: Category[];
  active: number;
  onChange: (id: string) => void;
};

export default function PharaonicCategoryTabs({
  categories,
  active,
  onChange,
}: PharaonicCategoryTabsProps) {
  const locale = useLocale() as "ar" | "en";
  const { primary, secondary } = usePharaonicTheme();
  const displayFont = pharaonicDisplayFont(locale);

  const tabs: Category[] = [
    { id: 0, name: "All", nameAr: "الكل", nameEn: "All", menuItems: [] },
    ...categories,
  ];

  const railLabel =
    locale === "ar" ? "أبواب القائمة" : "Chambers of the menu";

  return (
    <section
      className="ph-category-rail mb-10 md:mb-12"
      aria-label={locale === "ar" ? "تصنيفات القائمة" : "Menu categories"}
    >
      <div
        className="mb-4 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.38em]"
        style={{ color: hexToRgba(primary, 0.75), fontFamily: displayFont }}
      >
        <span aria-hidden className="opacity-70">
          𓇳
        </span>
        <span>{railLabel}</span>
        <span aria-hidden className="opacity-70">
          𓇳
        </span>
      </div>

      <HieroglyphBorder className="mb-3 opacity-50" />

      <div
        className="overflow-x-auto px-1 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        dir={locale === "ar" ? "rtl" : "ltr"}
      >
        <div
          className="mx-auto flex w-max min-w-0 gap-3 px-1 snap-x snap-mandatory"
          role="tablist"
        >
          {tabs.map((cat, i) => {
            const isActive = cat.id === Number(active);
            const label = categoryTabLabel(cat, locale);
            const isAll = i === 0 && cat.id === 0;
            const glyph = isAll ? "☥" : "𓆣";

            return (
              <button
                key={isAll ? "all" : `cat-${cat.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onChange(cat.id.toString())}
                className={`ph-category-cartouche group relative shrink-0 snap-center px-1 transition-transform duration-300 active:scale-[0.97] max-md:min-h-[48px] ${
                  isActive ? "ph-category-cartouche--active z-[1]" : ""
                }`}
              >
                <span
                  className={`relative flex min-w-[5.5rem] flex-col items-center justify-center gap-1 px-5 py-3 sm:min-w-[6.5rem] ${
                    isActive ? "ph-category-inner--active" : "ph-category-inner"
                  }`}
                  style={
                    isActive
                      ? {
                          background: `linear-gradient(160deg, ${primary} 0%, ${hexToRgba(primary, 0.88)} 45%, ${secondary} 100%)`,
                          color: "#0c0a08",
                          boxShadow: shadowGlow(primary, 22, 0.45),
                          fontFamily: displayFont,
                        }
                      : {
                          background: `linear-gradient(180deg, ${hexToRgba(primary, 0.1)} 0%, rgba(12,10,8,0.95) 100%)`,
                          color: `${primary}dd`,
                          borderColor: hexToRgba(primary, 0.35),
                          boxShadow: `inset 0 0 0 1px ${hexToRgba(primary, 0.15)}`,
                        }
                  }
                >
                  <span
                    className={`text-sm leading-none transition-opacity ${
                      isActive ? "opacity-100" : "opacity-55 group-hover:opacity-85"
                    }`}
                    aria-hidden
                  >
                    {glyph}
                  </span>
                  <span
                    className={`max-w-[9rem] truncate text-center text-[11px] font-semibold uppercase tracking-[0.12em] sm:text-xs sm:tracking-[0.14em] ${
                      isActive ? "" : "font-body"
                    }`}
                  >
                    {label}
                  </span>
                  {isActive ? (
                    <span
                      className="absolute -bottom-1 left-1/2 h-0.5 w-[70%] -translate-x-1/2 rounded-full"
                      style={{ background: secondary }}
                      aria-hidden
                    />
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <HieroglyphBorder className="mt-1 opacity-50" />
    </section>
  );
}
