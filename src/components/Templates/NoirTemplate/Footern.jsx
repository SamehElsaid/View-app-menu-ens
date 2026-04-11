"use client"

import { useLocale } from "next-intl"
import { useAppSelector } from "@/store/hooks"

export default function Footer() {
  const locale = useLocale()
  const menuInfo = useAppSelector((state) => state.menu.menuInfo)
  const displayName = menuInfo?.name?.trim() || "NØIR"
  const year = new Date().getFullYear()

  return (
    <footer className="py-8 px-8 border-t border-violet/[0.08]">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-logo text-base text-text-secondary tracking-[0.3em]">
          {displayName}
        </span>

        <p className="text-sm text-text-muted">
          {locale === "ar"
            ? `© ${year} ${displayName}. جميع الحقوق محفوظة.`
            : `© ${year} ${displayName}. All rights reserved.`}
        </p>

        <p dir="ltr" className="text-sm text-text-muted flex items-center gap-1">
          {locale === "ar" ? "تصميم وتطوير" : "Designed & Developed by"}{" "}
          <a
            href="https://www.facebook.com/ENSEGYPTEG"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-lavender hover:underline transition-colors"
          >
            ENS
          </a>
        </p>
      </div>
    </footer>
  )
}
