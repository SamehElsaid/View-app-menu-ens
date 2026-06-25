"use client";

import WorkingHoursGrid from "@/components/Global/WorkingHoursGrid";

const COFFEE_PRIMARY = "#F2B705";

export default function WorkingHoursSection() {
  return (
    <WorkingHoursGrid
      primaryColor={COFFEE_PRIMARY}
      variant="dark"
      className="mt-10 mb-10 md:mt-12 md:mb-12"
    />
  );
}
