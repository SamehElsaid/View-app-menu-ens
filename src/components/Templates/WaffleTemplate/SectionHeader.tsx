"use client";

import { useLocale } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import { WaffleSectionTitle } from "./WaffleDecorations";

type SectionHeaderProps = {
  title?: string;
  className?: string;
};

export default function SectionHeader({ title, className = "" }: SectionHeaderProps) {
  const locale = useLocale();
  const customizations = useAppSelector((state) => state.menu.menuCustomizations);
  const isAr = locale === "ar";

  const defaultTitle = isAr ? "استكشف قائمتنا" : "Explore Our Menu";
  const displayTitle =
    title ??
    (isAr
      ? customizations?.heroTitleAr?.trim() || defaultTitle
      : customizations?.heroTitleEn?.trim() || defaultTitle);

  return <WaffleSectionTitle title={displayTitle} className={className} />;
}
