"use client";

import { memo, useState } from "react";
import { useLocale } from "next-intl";
import {
  GiCupcake,
  GiIceCreamCone,
  GiMartini,
  GiCoffeeCup,
  GiSodaCan,
  GiFruitBowl,
  GiCakeSlice,
  GiHamburger,
} from "react-icons/gi";
import type { IconType } from "react-icons";
import type { Category } from "@/types/menu";
import LoadImage from "@/components/ImageLoad";
import { useOneCardTheme } from "../OneCardTemplate/OneCardThemeContext";

const FALLBACK_ICONS: IconType[] = [
  GiCupcake,
  GiIceCreamCone,
  GiMartini,
  GiFruitBowl,
  GiCoffeeCup,
  GiSodaCan,
  GiCakeSlice,
  GiHamburger,
];

function getFallbackIcon(id: number): IconType {
  return FALLBACK_ICONS[Math.abs(id) % FALLBACK_ICONS.length];
}

function getCategoryLabel(category: Category, locale: string): string {
  return locale === "ar"
    ? category.nameAr || category.name
    : category.nameEn || category.name;
}

type CategoryCardProps = {
  id: number;
  label: string;
  imageSrc: string | null | undefined;
  isActive: boolean;
  primary: string;
  onSelect: (id: number) => void;
};

const CategoryCard = memo(function CategoryCard({
  id,
  label,
  imageSrc,
  isActive,
  primary,
  onSelect,
}: CategoryCardProps) {
  const [imgError, setImgError] = useState(false);
  const showFallback = !imageSrc?.trim() || imgError;
  const FallbackIcon = getFallbackIcon(id);

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      aria-pressed={isActive}
      className={`group flex h-full w-full flex-col rounded-[28px] bg-white px-2 pb-3.5 pt-4 transition-all duration-200 ${
        isActive ? "-translate-y-0.5 scale-[1.02]" : "hover:-translate-y-0.5"
      }`}
      style={
        isActive
          ? { boxShadow: `0 10px 28px -6px ${primary}55` }
          : { boxShadow: "0 6px 20px -8px rgba(0,0,0,0.35)" }
      }
    >
      <div className="flex min-h-[96px] flex-1 items-center justify-center px-1">
        {showFallback ? (
          <span
            className="flex h-[88px] w-full items-center justify-center"
            style={{ color: primary }}
          >
            <FallbackIcon size={38} aria-hidden />
          </span>
        ) : (
          <div className="relative h-[88px] w-full drop-shadow-[0_10px_14px_rgba(0,0,0,0.18)]">
            <LoadImage
              src={imageSrc!}
              alt={label}
              fill
              width={220}
              height={220}
              className="object-contain"
              onError={() => setImgError(true)}
            />
          </div>
        )}
      </div>

      <div className="mt-1 flex flex-col items-center gap-1.5 px-0.5">
        <span
          className="line-clamp-2 text-center text-[11px] font-black leading-tight sm:text-xs"
          style={{ color: primary }}
        >
          {label}
        </span>
        <span
          className="h-1 w-8 rounded-full"
          style={{ backgroundColor: primary }}
          aria-hidden
        />
      </div>
    </button>
  );
});

type CategoryCardsProps = {
  categories: Category[];
  activeCategoryId: number;
  onSelect: (categoryId: number) => void;
};

function CategoryCardsInner({
  categories,
  activeCategoryId,
  onSelect,
}: CategoryCardsProps) {
  const locale = useLocale();
  const { primary } = useOneCardTheme();
  const isRtl = locale === "ar";
  const fillRow = categories.length <= 3;

  return (
    <div
      className="overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div
        className={`flex flex-nowrap items-stretch gap-2 ${fillRow ? "w-full" : "w-max min-w-full"}`}
        style={{ direction: isRtl ? "rtl" : "ltr" }}
      >
        {categories.map((category) => (
          <div
            key={category.id}
            className={
              fillRow ? "min-w-0 flex-1" : "w-[118px] shrink-0 sm:w-[124px]"
            }
          >
            <CategoryCard
              id={category.id}
              label={getCategoryLabel(category, locale)}
              imageSrc={category.image}
              isActive={category.id === activeCategoryId}
              primary={primary}
              onSelect={onSelect}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(CategoryCardsInner);
