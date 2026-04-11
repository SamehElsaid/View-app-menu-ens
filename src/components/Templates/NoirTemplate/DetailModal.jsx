"use client"

import { useEffect } from "react"
import Image from "next/image"
import { useLocale } from "next-intl"

export default function DetailModal({ item, onClose, currency }) {
  const locale = useLocale()
  const name = locale === "ar" ? item.nameAr : item.nameEn
  const desc = locale === "ar" ? item.descriptionAr : item.descriptionEn
  const catLabel = locale === "ar" ? item.categoryNameAr : item.categoryNameEn

  useEffect(() => {
    document.body.style.overflow = "hidden"
    const handler = (e) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handler)
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-[10px] z-50 flex items-center justify-center p-8"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="rounded-[4px] max-w-[600px] w-full max-h-[90vh] overflow-y-auto animate-[fade-up_0.4s_ease-out] bg-charcoal/95 border border-violet/20 shadow-[0_0_60px_rgba(124,58,237,0.2),0_40px_80px_rgba(0,0,0,0.6)]">
        <div className="relative h-[280px] overflow-hidden">
          <Image
            src={item.image}
            alt={name}
            fill
            className="object-cover saturate-[0.7]"
            sizes="600px"
          />
          <div className="absolute inset-0 bg-linear-to-b from-transparent from-30% to-charcoal/95" />
          <button
            className="absolute top-4 end-4 w-9 h-9 rounded-full flex items-center justify-center bg-black/80 border border-violet/30 text-text-secondary cursor-pointer transition-all duration-300 text-base"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-8">
          <p className="text-sm tracking-[0.3em] uppercase text-cyan mb-3">
            {catLabel}
          </p>
          <h3 className="font-display text-4xl font-light leading-tight mb-4">
            {name}
          </h3>
          {desc && (
            <p className="text-sm text-text-secondary leading-relaxed mb-6">
              {desc}
            </p>
          )}

          <div className="flex items-center justify-between gap-4">
            <span className="font-display text-3xl font-light text-lavender">
              {currency} {item.price}
            </span>
            {item.originalPrice && item.originalPrice > item.price && (
              <span className="text-sm text-text-secondary line-through">
                {currency} {item.originalPrice}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
