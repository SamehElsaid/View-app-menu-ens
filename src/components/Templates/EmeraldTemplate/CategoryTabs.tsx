"use client";

import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Category } from "@/types/menu";

interface Props {
  categories: Category[];
  active: number;
  onChange: (id: string) => void;
}

export default function CategoryTabs({ categories, active, onChange }: Props) {
  const locale = useLocale() as "ar" | "en";

  return (
    <div
    className="flex flex-wrap justify-center gap-2.5 pb-1 px-4 w-full"
    role="tablist"
    aria-label="Menu categories"
  >
    {[{ id: 0, nameAr: "الكل", nameEn: "All" }, ...categories].map((cat) => {
      const isActive = cat.id === Number(active);
      return (
        <button
          key={cat.id}
          role="tab"
          aria-selected={isActive}
          onClick={() => onChange(cat.id.toString())}
          className={`
            relative flex-shrink-0 flex items-center gap-2 px-5 py-2.5
            rounded-full text-sm font-semibold font-sans tracking-wide
            transition-all duration-300 focus-visible:outline-none
            focus-visible:ring-2 focus-visible:ring-[#9b2545]
            ${
              isActive
                ? "text-white shadow-[0_4px_20px_rgba(155,37,69,0.4)]"
                : "text-stone-500 bg-white hover:bg-[#fef1f5] hover:text-[#62162a] shadow-[0_2px_20px_rgba(76,17,33,0.06),0_1px_4px_rgba(0,0,0,0.04)]"
            }
          `}
        >
          {isActive && (
            <motion.span
              layoutId="tab-pill"
              className="absolute inset-0 rounded-full bg-gradient-to-br from-[#4c1121] to-[#9b2545] shadow-[0_4px_20px_rgba(155,37,69,0.4)]"
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
            />
          )}
          <span className="relative z-10 text-base leading-none">{locale === "ar" ? cat.nameAr : cat.nameEn}</span>
        </button>
      );
    })}
  </div>
  );
}
