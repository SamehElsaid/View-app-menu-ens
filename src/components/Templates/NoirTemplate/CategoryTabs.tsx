"use client";

import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import { Category } from "@/types/menu";
import { useNoirTheme } from "./NoirThemeContext";
import { hexToRgba } from "./noirColorUtils";

interface CategoryTabsProps {
  categories: Category[];
  active: number;
  onChange: (id: string) => void;
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

export default function CategoryTabs({
  categories,
  active,
  onChange,
}: CategoryTabsProps) {
  const locale = useLocale() as "ar" | "en";
  const { primary } = useNoirTheme();

  return (
    <div className="overflow-x-auto mb-10 [scrollbar-width:none]">
      <motion.div
        className="flex gap-2 w-max mx-auto px-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {[{ id: 0, nameAr: "الكل", nameEn: "All" }, ...categories].map(
          (cat) => {
            const isActive = cat.id === Number(active);
            return (
              <motion.button
                key={cat.id}
                variants={itemVariants}
                transition={{ duration: 0.3, ease: "easeOut" }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onChange(cat.id.toString())}
                style={
                  isActive
                    ? {
                        boxShadow: `0 0 18px ${hexToRgba(primary, 0.45)}, 0 2px 8px rgba(0,0,0,0.3)`,
                      }
                    : undefined
                }
                className={`font-body flex items-center gap-1.5 text-sm tracking-[0.12em] uppercase py-2 px-5 rounded-full cursor-pointer whitespace-nowrap transition-all duration-300
                ${
                  isActive
                    ? "bg-linear-to-br from-violet to-cyan text-white border border-transparent"
                    : "bg-violet/[0.04] text-text-secondary border border-violet/[0.18]"
                }`}
              >
                <span>{locale === "ar" ? cat.nameAr : cat.nameEn}</span>
              </motion.button>
            );
          },
        )}
      </motion.div>
    </div>
  );
}
