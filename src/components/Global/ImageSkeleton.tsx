type ImageSkeletonProps = {
  className?: string;
  fill?: boolean;
};

export default function ImageSkeleton({
  className = "",
  fill = false,
}: ImageSkeletonProps) {
  return (
    <div
      className={[
        fill ? "absolute inset-0 h-full w-full" : "block h-full w-full min-h-12",
        "animate-pulse bg-linear-to-r from-zinc-200/90 via-zinc-100/90 to-zinc-200/90",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    />
  );
}
