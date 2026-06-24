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
        "bg-zinc-100",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    />
  );
}
