"use client";

import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Category } from "@/types/menu";
import { useEmeraldTheme } from "./EmeraldThemeContext";
import { hexToRgba } from "./emeraldThemeUtils";

interface Props {
  categories: Category[];
  active: number;
  onChange: (id: string) => void;
}

export default function CategoryTabs({ categories, active, onChange }: Props) {
  const locale = useLocale() as "ar" | "en";
  const { primary, secondary } = useEmeraldTheme();

  const hoverBg = hexToRgba(primary, 0.06);
  const inactiveShadow = `0 2px 20px ${hexToRgba(primary, 0.06)}, 0 1px 4px rgba(0,0,0,0.04)`;
  const activeShadow = `0 4px 20px ${hexToRgba(primary, 0.4)}`;

  return (
    <div
      className="flex overflow-x-auto md:flex-wrap md:justify-center gap-2.5 pb-2 px-4 w-full"
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
            relative shrink-0 flex items-center gap-2 px-5 py-2.5
            rounded-full text-sm font-semibold font-sans tracking-wide
            transition-[background-color,color,box-shadow] duration-300
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400/50 focus-visible:ring-offset-2
            ${
              isActive
                ? "text-white"
                : "text-stone-500 bg-white"
            }
          `}
            style={
              isActive
                ? undefined
                : { boxShadow: inactiveShadow }
            }
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = hoverBg;
                e.currentTarget.style.color = primary;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = "white";
                e.currentTarget.style.color = "";
              }
            }}
          >
            {isActive && (
              <motion.span
                layoutId="tab-pill"
                className="absolute inset-0 rounded-full"
                style={{
                  background: `linear-gradient(to bottom right, ${primary}, ${secondary})`,
                  boxShadow: activeShadow,
                }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative z-10 text-base leading-none">
              {locale === "ar" ? cat.nameAr : cat.nameEn}
            </span>
          </button>
        );
      })}
    </div>
  );
}
