"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { MdOutlineWatchLater } from "react-icons/md";
import { useAppSelector } from "@/store/hooks";
import { useOneCardTheme } from "./OneCardThemeContext";
import type { WorkingHours } from "@/types/menu";

const DAY_KEYS: (keyof WorkingHours)[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

function getTodayKey(): keyof WorkingHours {
  return DAY_KEYS[new Date().getDay()];
}

export default function WorkingHoursSection() {
  const t = useTranslations("footer");
  const { primary } = useOneCardTheme();
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

  return (
    <section className="mt-8 px-2 md:mt-10 md:px-3 lg:mt-12">
      <div className="mb-5 flex items-center gap-3 md:mb-6">
        <span
          className="h-px flex-1"
          style={{ backgroundColor: `${primary}33` }}
          aria-hidden
        />
        <h2
          className="shrink-0 flex items-center gap-2 text-base font-black sm:text-lg md:text-xl lg:text-2xl"
          style={{ color: primary }}
        >
          <MdOutlineWatchLater className="text-xl" />
          {t("workingHours")}
        </h2>
        <span
          className="h-px flex-1"
          style={{ backgroundColor: `${primary}33` }}
          aria-hidden
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
        {days.map((day) => {
          if (!day) return null;
          const isToday = day.key === todayKey;
          return (
            <div
              key={day.key}
              className={`flex items-center justify-between gap-2 rounded-2xl border px-4 py-3.5 text-sm font-semibold shadow-[0_4px_16px_-8px_rgba(0,0,0,0.1)] transition sm:rounded-3xl sm:px-5 sm:py-4 sm:text-base ${
                isToday
                  ? "border-transparent text-white"
                  : "border-zinc-100 bg-white text-zinc-700"
              }`}
              style={isToday ? { backgroundColor: primary } : undefined}
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
                  className={`text-xs sm:text-sm ${isToday ? "text-white/90" : "text-zinc-400"}`}
                >
                  {day.open} – {day.close}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
