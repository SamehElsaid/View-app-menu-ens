"use client";

import WorkingHoursGrid from "@/components/Global/WorkingHoursGrid";
import { useOneCardTheme } from "./OneCardThemeContext";

export default function WorkingHoursSection() {
  const { primary } = useOneCardTheme();

  return (
    <WorkingHoursGrid
      primaryColor={primary}
      variant="light"
      className="mt-8 md:mt-10 lg:mt-12"
    />
  );
}
