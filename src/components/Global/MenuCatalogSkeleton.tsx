"use client";

type MenuCatalogSkeletonProps = {
  variant?: "default" | "onecard" | "coffee";
  count?: number;
  className?: string;
};

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-linear-to-r from-zinc-200/90 via-zinc-100/90 to-zinc-200/90 ${className}`}
    />
  );
}

export default function MenuCatalogSkeleton({
  variant = "default",
  count = 6,
  className = "",
}: MenuCatalogSkeletonProps) {
  if (variant === "coffee") {
    return (
      <div
        className={`grid gap-4 md:grid-cols-2 ${className}`}
        aria-hidden
      >
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={`coffee-skeleton-${index}`}
            className="overflow-hidden rounded-xl border border-[#3B332E]/90 bg-linear-to-br from-[#252019] to-[#1a1613] p-3 sm:p-4"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="size-18 shrink-0 animate-pulse rounded-xl bg-[#2a2520] sm:h-21 sm:w-21" />
              <div className="flex-1 space-y-2.5">
                <div className="h-4 w-3/4 animate-pulse rounded-lg bg-[#2a2520]" />
                <div className="h-3 w-full animate-pulse rounded-lg bg-[#2a2520]" />
                <div className="h-5 w-20 animate-pulse rounded-lg bg-[#2a2520]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "onecard") {
    return (
      <div
        className={`grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2 lg:gap-8 xl:gap-10 px-1 sm:px-2 md:px-3 ${className}`}
        aria-hidden
      >
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={`onecard-skeleton-${index}`}
            className="overflow-hidden rounded-[1.75rem] sm:rounded-[2rem] lg:rounded-[2.25rem]"
          >
            <SkeletonBlock className="min-h-[16rem] w-full rounded-none sm:min-h-[19rem] md:min-h-[20rem] lg:min-h-[22rem] xl:min-h-[24rem]" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3 ${className}`}
      aria-hidden
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`default-skeleton-${index}`}
          className="overflow-hidden rounded-[2rem] border border-zinc-100/80 bg-white shadow-sm"
        >
          <SkeletonBlock className="aspect-4/3 w-full rounded-none" />
          <div className="space-y-3 p-6">
            <SkeletonBlock className="h-6 w-2/3" />
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-4/5" />
            <SkeletonBlock className="h-9 w-28 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MenuCategoryHeaderSkeleton() {
  return (
    <div
      className="relative mb-10 overflow-hidden rounded-[1.75rem] border border-zinc-100 bg-white p-5 shadow-sm"
      aria-hidden
    >
      <div className="flex items-center gap-4">
        <SkeletonBlock className="h-20 w-20 shrink-0 rounded-2xl" />
        <div className="min-w-0 flex-1 space-y-3">
          <SkeletonBlock className="h-8 w-48 max-w-full" />
          <SkeletonBlock className="h-2 w-full max-w-xs rounded-full" />
        </div>
      </div>
    </div>
  );
}
