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
import { MdRestaurantMenu } from "react-icons/md";
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
  if (id === 0) return MdRestaurantMenu;
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
      className={`group flex w-[104px] shrink-0 flex-col items-center gap-2 rounded-[22px] border bg-white px-2.5 pb-3 pt-3 transition-all duration-200 ${
        isActive
          ? "border-transparent shadow-[0_10px_28px_-10px_rgba(80,30,120,0.4)] -translate-y-0.5"
          : "border-(--vanilla-gold,#b8893a)/20 shadow-[0_6px_18px_-12px_rgba(80,30,120,0.25)] hover:-translate-y-0.5"
      }`}
      style={
        isActive ? { boxShadow: `0 10px 26px -10px ${primary}66` } : undefined
      }
    >
      <FallbackIcon
        size={20}
        className="text-(--vanilla-gold,#b8893a)"
        aria-hidden
      />

      <span className="relative h-[58px] w-[58px] overflow-hidden rounded-full ring-2 ring-(--vanilla-gold,#b8893a)/25">
        {showFallback ? (
          <span
            className="flex h-full w-full items-center justify-center bg-[#f4eefb]"
            style={{ color: primary }}
          >
            <FallbackIcon size={26} aria-hidden />
          </span>
        ) : (
          <LoadImage
            src={imageSrc!}
            alt={label}
            fill
            width={160}
            height={160}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        )}
      </span>

      <span
        className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-[13px] font-bold"
        style={{ color: primary }}
      >
        {label}
      </span>
    </button>
  );
});

type CategoryCardsProps = {
  categories: Category[];
  activeCategoryId: number;
  onSelect: (categoryId: number) => void;
  showAll?: boolean;
};

function CategoryCardsInner({
  categories,
  activeCategoryId,
  onSelect,
  showAll = true,
}: CategoryCardsProps) {
  const locale = useLocale();
  const { primary } = useOneCardTheme();
  const isRtl = locale === "ar";
  const allLabel = isRtl ? "الكل" : "All";

  return (
    <div
      className="overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div
        className="flex gap-2.5 px-1"
        style={{ direction: isRtl ? "rtl" : "ltr" }}
      >
        {showAll ? (
          <CategoryCard
            id={0}
            label={allLabel}
            imageSrc={null}
            isActive={activeCategoryId === 0}
            primary={primary}
            onSelect={onSelect}
          />
        ) : null}
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            id={category.id}
            label={getCategoryLabel(category, locale)}
            imageSrc={category.image}
            isActive={category.id === activeCategoryId}
            primary={primary}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

export default memo(CategoryCardsInner);
