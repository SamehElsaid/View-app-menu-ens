"use client";

import MenuCatalogSkeleton from "@/components/Global/MenuCatalogSkeleton";

type MenuCatalogSentinelProps = {
  sentinelRef?: React.RefObject<HTMLDivElement | null>;
  loadingMore?: boolean;
  hasMore: boolean;
  skeletonVariant?: "default" | "onecard" | "coffee";
};

const SKELETON_MIN_HEIGHT = {
  default: "28rem",
  onecard: "32rem",
  coffee: "28rem",
} as const;

export default function MenuCatalogSentinel({
  sentinelRef,
  loadingMore = false,
  hasMore,
  skeletonVariant = "default",
}: MenuCatalogSentinelProps) {
  if (!hasMore && !loadingMore) return null;

  const skeletonCount = skeletonVariant === "onecard" ? 4 : 6;
  const minHeight = SKELETON_MIN_HEIGHT[skeletonVariant];

  return (
    <div
      ref={sentinelRef}
      className="w-full [overflow-anchor:none]"
      style={{ minHeight: loadingMore ? minHeight : undefined }}
      aria-busy={loadingMore}
      aria-live="polite"
    >
      {loadingMore ? (
        <MenuCatalogSkeleton
          variant={skeletonVariant}
          count={skeletonCount}
          className="py-4"
        />
      ) : (
        <div className="h-px w-full" aria-hidden />
      )}
    </div>
  );
}
