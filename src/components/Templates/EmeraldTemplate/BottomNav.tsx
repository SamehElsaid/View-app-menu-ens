"use client";

import { useLocale } from "next-intl";
import { Category } from "@/types/menu";
import { useEmeraldTheme } from "./EmeraldThemeContext";
import { hexToRgba } from "./emeraldThemeUtils";

interface Props {
  categories: Category[];
  active: number;
  onChange: (id: string) => void;
}

export default function BottomNav({ categories, active, onChange }: Props) {
  const locale = useLocale() as "ar" | "en";
  const { primary, secondary } = useEmeraldTheme();

  const navShadow = `0 -4px 24px ${hexToRgba(primary, 0.1)}`;
  const activeShadow = `0 4px 20px ${hexToRgba(primary, 0.4)}`;
  const hoverBg = hexToRgba(primary, 0.06);

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/94 backdrop-blur-[20px] px-2 pb-safe"
      style={{ boxShadow: navShadow }}
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
                    ? "text-white"
                    : "text-stone-500"
                }
              `}
              style={
                isActive
                  ? {
                      background: `linear-gradient(to bottom right, ${primary}, ${secondary})`,
                      boxShadow: activeShadow,
                    }
                  : undefined
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = hoverBg;
                  e.currentTarget.style.color = primary;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "";
                }
              }}
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
