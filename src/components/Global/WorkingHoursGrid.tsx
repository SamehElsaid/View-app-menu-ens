"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { MdOutlineWatchLater } from "react-icons/md";
import { useAppSelector } from "@/store/hooks";
import type { WorkingHours } from "@/types/menu";

const ALL_DAYS: (keyof WorkingHours)[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const DAY_KEYS: (keyof WorkingHours)[] = [
  "saturday",
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
];

function getTodayKey(): keyof WorkingHours {
  return ALL_DAYS[new Date().getDay()];
}

export interface WorkingHoursGridProps {
  /** Accent color used for the section heading and today's card highlight */
  primaryColor: string;
  /**
   * "light" → white card background for non-today days (OneCard style)
   * "dark"  → dark card background for non-today days (Coffee style)
   */
  variant?: "light" | "dark";
  className?: string;
}

export default function WorkingHoursGrid({
  primaryColor,
  variant = "light",
  className = "",
}: WorkingHoursGridProps) {
  const t = useTranslations("footer");
  const workingHours = useAppSelector(
    (state) => state.menu.menuInfo?.workingHours ?? null,
  );

  const todayKey = useMemo(() => getTodayKey(), []);

  const days = useMemo(() => {
    if (!workingHours) return [];
    return DAY_KEYS.map((key) => {
      const d = workingHours[key];
      if (!d) return null;
      if (!d.closed && !d.open && !d.close) return null;
      return { key, ...d };
    }).filter(Boolean);
  }, [workingHours]);

  if (days.length === 0) return null;

  const isDark = variant === "dark";

  const formatTime = (time?: string) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    const hour = parseInt(h, 10);
    const isPm = hour >= 12;
    const display = hour % 12 || 12;
    const period = isPm ? t("pm") : t("am");
    return `${display}:${m} ${period}`;
  };

  return (
    <section className={`px-2 md:px-3 ${className}`}>
      <div className="mb-5 flex items-center gap-3 md:mb-6">
        <span
          className="h-px flex-1"
          style={{ backgroundColor: `${primaryColor}33` }}
          aria-hidden
        />
        <h2
          className="shrink-0 flex items-center gap-2 text-base font-black sm:text-lg md:text-xl lg:text-2xl"
          style={{ color: primaryColor }}
        >
          <MdOutlineWatchLater className="text-xl" />
          {t("workingHours")}
        </h2>
        <span
          className="h-px flex-1"
          style={{ backgroundColor: `${primaryColor}33` }}
          aria-hidden
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
        {days.map((day, index) => {
          if (!day) return null;
          const isToday = day.key === todayKey;
          const isLastOdd = index === days.length - 1 && days.length % 2 !== 0;

          const baseCardClass =
            "flex items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-sm font-semibold shadow-[0_4px_16px_-8px_rgba(0,0,0,0.1)] transition sm:rounded-3xl sm:px-5 sm:py-4 sm:text-base";

          const variantCardClass = isToday
            ? "border-transparent text-white"
            : isDark
              ? "border-[#3B332E] bg-[#2A231F] text-[#F4EEE7]"
              : "border-zinc-100 bg-white text-zinc-700";

          return (
            <div
              key={day.key}
              className={`${baseCardClass} ${variantCardClass} ${isLastOdd ? "col-span-2 mx-auto w-[calc(50%-6px)] sm:w-[calc(50%-8px)] lg:w-[calc(50%-10px)]" : ""}`}
              style={isToday ? { backgroundColor: primaryColor } : undefined}
            >
              <span className={isToday ? "font-bold" : "font-semibold"}>
                {t(`days.${day.key}`)}
              </span>

              {day.closed ? (
                <span
                  className={`text-xs font-bold uppercase tracking-wide ${isToday ? "text-white/80" : "text-red-400"}`}
                >
                  {t("closed")}
                </span>
              ) : (
                <span
                  dir="ltr"
                  className={`flex items-center gap-1.5 tabular-nums text-xs sm:text-sm ${isToday ? "text-white/90" : isDark ? "text-[#B6AA99]" : "text-zinc-500"}`}
                >
                  <span>{formatTime(day.open)}</span>
                  <span
                    className={`text-[10px] ${isToday ? "text-white/50" : isDark ? "text-[#5A5047]" : "text-zinc-300"}`}
                    aria-hidden
                  >
                    ●
                  </span>
                  <span>{formatTime(day.close)}</span>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
