"use client";

export const HEX_CLIP =
  "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

export function StarDivider({
  flip = false,
  variant = "dark",
}: {
  flip?: boolean;
  variant?: "dark" | "light";
}) {
  const lineClass =
    variant === "light" ? "bg-[#7b2cbf]/35" : "bg-white/35";
  const starClass =
    variant === "light" ? "text-[#7b2cbf]/75" : "text-white/75";

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${flip ? "flex-row-reverse" : ""}`}
      aria-hidden
    >
      <span className={`h-px w-7 sm:w-10 ${lineClass}`} />
      <span className={`text-[9px] leading-none ${starClass}`}>✦</span>
    </span>
  );
}

type WaffleSectionTitleProps = {
  title: string;
  className?: string;
  variant?: "dark" | "light";
};

export function WaffleSectionTitle({
  title,
  className = "",
  variant = "dark",
}: WaffleSectionTitleProps) {
  return (
    <div
      className={`flex items-center justify-center gap-2 sm:gap-2.5 ${className}`}
    >
      <StarDivider variant={variant} />
      <h2
        className={`shrink-0 text-center text-[15px] font-black sm:text-base ${
          variant === "light" ? "text-[#5a189a]" : "text-white"
        }`}
      >
        {title}
      </h2>
      <StarDivider flip variant={variant} />
    </div>
  );
}

export function WaffleBackgroundDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute -start-24 top-28 h-72 w-72 rounded-full border border-white/[0.06]" />
      <div className="absolute -end-20 top-44 h-56 w-56 rounded-full border border-white/[0.06]" />
      <div className="absolute -start-10 bottom-32 h-40 w-40 rounded-full border border-white/[0.04]" />
      <div className="absolute -end-8 bottom-48 h-32 w-32 rounded-full border border-white/[0.04]" />
      <div className="absolute left-1/2 top-16 h-44 w-44 -translate-x-1/2 rounded-full bg-[#9d4edd]/25 blur-3xl" />
    </div>
  );
}
