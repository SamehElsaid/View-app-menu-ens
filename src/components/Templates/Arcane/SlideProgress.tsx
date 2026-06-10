"use client";

import { useArcaneTheme } from "./ArcaneThemeContext";

type SlideProgressProps = {
  slideIndex: number;
  total: number;
  isAr: boolean;
};

export default function SlideProgress({
  slideIndex,
  total,
  isAr,
}: SlideProgressProps) {
  const { primary } = useArcaneTheme();

  return (
    <div className="mt-5">
      <p className="text-xs font-semibold tabular-nums text-arcane-muted sm:text-sm">
        {slideIndex + 1} / {total}{" "}
        {total === 1 ? (isAr ? "منتج" : "item") : isAr ? "منتجات" : "items"}
      </p>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[#eeeeee]">
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{
            width: `${total > 0 ? ((slideIndex + 1) / total) * 100 : 0}%`,
            backgroundColor: primary,
          }}
        />
      </div>
    </div>
  );
}
