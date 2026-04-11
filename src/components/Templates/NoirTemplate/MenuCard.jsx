"use client"

import Image from "next/image"
import { useLocale } from "next-intl"
import { motion } from "framer-motion"

export default function MenuCard({ item, idx, onOpen, currency }) {
  const locale = useLocale()
  const name = locale === "ar" ? item.nameAr : item.nameEn
  const desc = locale === "ar" ? item.descriptionAr : item.descriptionEn
  const catLabel = locale === "ar" ? item.categoryNameAr : item.categoryNameEn

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: idx * 0.07,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative backdrop-blur-[16px] rounded-[4px] overflow-hidden cursor-pointer
        bg-glass border border-violet/[0.08]
        hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-[0_16px_48px_rgba(0,0,0,0.5),0_0_24px_rgba(124,58,237,0.2)]
        transition-[transform,box-shadow] duration-300 group"
      onClick={() => onOpen(item)}
    >
      <div className="relative h-[150px] overflow-hidden">
        <Image
          src={item.image}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover saturate-[0.7] brightness-[0.85] transition-[filter,transform] duration-400
            group-hover:saturate-[0.85] group-hover:brightness-[0.9] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent from-40% to-black/90" />
        {item.discountPercent && (
          <div className="absolute top-3 end-3 text-white text-xs tracking-[0.15em] uppercase py-0.5 px-2 rounded-[2px] bg-violet/90">
            {item.discountPercent}% off
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs tracking-[0.3em] uppercase text-cyan mb-1">
          {catLabel}
        </p>
        <h3 className="font-display text-lg font-light leading-tight mb-1">
          {name}
        </h3>
        {desc && (
          <p className="text-xs text-text-secondary leading-relaxed mb-3 line-clamp-2">
            {desc}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="font-display text-lg font-light text-lavender">
            {currency} {item.price}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
