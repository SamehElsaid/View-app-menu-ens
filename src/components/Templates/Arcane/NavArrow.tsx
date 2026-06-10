"use client";

type NavArrowProps = {
  direction: "prev" | "next";
  onClick: () => void;
  label: string;
};

export default function NavArrow({ direction, onClick, label }: NavArrowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="pointer-events-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[#111111] bg-white text-xl font-black text-[#111111] transition-colors hover:bg-[#111111] hover:text-white sm:h-12 sm:w-12"
    >
      {direction === "prev" ? "›" : "‹"}
    </button>
  );
}
