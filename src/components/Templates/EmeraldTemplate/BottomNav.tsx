"use client";

import { useLocale } from "next-intl";
import { Category } from "@/types/menu";

interface Props {
  categories: Category[];
  active: number;
  onChange: (id: string) => void;
}

export default function BottomNav({ categories, active, onChange }: Props) {
  const locale = useLocale() as "ar" | "en";

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/94 backdrop-blur-[20px] shadow-[0_-4px_24px_rgba(76,17,33,0.1)] px-2 pb-safe"
      aria-label="Categories"
    >
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2.5 px-1">
        {categories.map((cat: Category) => {
          const isActive = cat.id === Number(active);
          return (
            <button
              key={cat.id}
              onClick={() => onChange(cat.id.toString())}
              className={`
                shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full
                text-xs font-semibold font-sans transition-all duration-200
                ${
                  isActive
                    ? "bg-linear-to-br from-[#4c1121] to-[#9b2545] text-white shadow-[0_4px_20px_rgba(155,37,69,0.4)]"
                    : "text-stone-500 hover:bg-[#fef1f5] hover:text-[#62162a]"
                }
              `}
            >
              <span className="text-sm leading-none">{cat.name}</span>
              <span>
                {locale === "ar"
                  ? cat.nameAr || cat.name
                  : cat.nameEn || cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
