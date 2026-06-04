"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { IoCartOutline } from "react-icons/io5";
import type { MenuItem } from "@/types/menu";
import LoadImage from "@/components/ImageLoad";
import {
  usePharaonicTheme,
  hexToRgba,
  shadowGlow,
} from "./PharaonicThemeContext";
import { pharaonicDisplayFont } from "./PharaonicFonts";
import {
  usePharaonicTouchDevice,
  pharaonicHaptic,
} from "./usePharaonicTouchDevice";
import { useTableCartAllowed } from "@/hooks/useTableCartAllowed";
import {
  subscribeSkyCartUpdated,
  readSkyCartFromCookie,
  upsertSkyCartQuantityFromMenuItem,
} from "@/lib/skyTemplateCart";

type PharaonicDetailModalProps = {
  item: MenuItem;
  onClose: () => void;
  currencyLabel: string;
};

export default function PharaonicDetailModal({
  item,
  onClose,
  currencyLabel,
}: PharaonicDetailModalProps) {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const tableCartAllowed = useTableCartAllowed();
  const isTableOrder =
    Boolean(searchParams.get("table")?.trim()) && tableCartAllowed;
  const [selectedQty, setSelectedQty] = useState(1);
  const [inCartQty, setInCartQty] = useState(0);
  const { primary, secondary } = usePharaonicTheme();
  const isTouch = usePharaonicTouchDevice();
  const displayFont = pharaonicDisplayFont(locale);

  const name = locale === "ar" ? item.nameAr : item.nameEn;
  const desc = locale === "ar" ? item.descriptionAr : item.descriptionEn;
  const catLabel = locale === "ar" ? item.categoryNameAr : item.categoryNameEn;

  const panelShadow = `0 0 40px ${hexToRgba(primary, 0.18)}, 0 20px 40px rgba(0,0,0,0.5)`;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handler);
    };
  }, [onClose]);

  useEffect(() => {
    setSelectedQty(1);
    const sync = () => {
      const c = readSkyCartFromCookie();
      setInCartQty(c[item.id]?.quantity ?? 0);
    };
    sync();
    return subscribeSkyCartUpdated(sync);
  }, [item.id]);

  const handleAdd = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    upsertSkyCartQuantityFromMenuItem(item, selectedQty);
    setSelectedQty(1);
    if (isTouch) pharaonicHaptic([10, 28, 10]);
    onClose();
  };

  const closeModal = () => onClose();

  const priceBlock = (
    <div className="flex flex-wrap items-end justify-between gap-2">
      <div>
        <span
          className="block text-xl font-bold leading-none"
          style={{ color: primary }}
        >
          {item.price}
        </span>
        <span className="mt-0.5 block text-xs tracking-wide text-[#a89880]">
          {currencyLabel}
        </span>
      </div>
      {item.originalPrice && item.originalPrice > item.price ? (
        <div className="text-end">
          <span className="block text-xs text-[#8a7d68] line-through">
            {item.originalPrice} {currencyLabel}
          </span>
          {item.discountPercent ? (
            <span
              className="mt-0.5 inline-block rounded-sm px-1.5 py-0.5 text-[9px] font-bold uppercase text-[#0c0a08]"
              style={{ background: primary }}
            >
              {locale === "ar"
                ? `${item.discountPercent}٪`
                : `-${item.discountPercent}%`}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  const cartBlock = isTableOrder ? (
    <div
      className="mt-3 border-t pt-3"
      style={{ borderColor: hexToRgba(primary, 0.22) }}
    >
      {inCartQty > 0 ? (
        <p
          className="mb-2 flex items-center justify-center gap-1.5 text-xs font-medium"
          style={{ color: primary }}
        >
          <IoCartOutline className="h-3.5 w-3.5" aria-hidden />
          {locale === "ar" ? `في السلة: ${inCartQty}` : `In cart: ${inCartQty}`}
        </p>
      ) : null}
      <div className="flex items-center gap-2">
        <div
          className="flex shrink-0 items-center rounded-md border"
          style={{ borderColor: hexToRgba(primary, 0.38) }}
        >
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center text-[#e8dcc8]"
            onClick={() => setSelectedQty((q) => Math.max(1, q - 1))}
            aria-label={locale === "ar" ? "تقليل" : "Decrease"}
          >
            −
          </button>
          <span className="min-w-7 text-center text-sm font-semibold text-[#f5e6c8]">
            {selectedQty}
          </span>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center text-[#e8dcc8]"
            onClick={() => setSelectedQty((q) => q + 1)}
            aria-label={locale === "ar" ? "زيادة" : "Increase"}
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex h-9 min-h-9 flex-1 items-center justify-center gap-1.5 rounded-md px-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#0c0a08] active:scale-[0.98]"
          style={{
            background: `linear-gradient(135deg, ${primary}, ${secondary})`,
          }}
        >
          <IoCartOutline className="h-4 w-4 shrink-0" aria-hidden />
          {locale === "ar" ? "أضف للسلة" : "Add"}
        </button>
      </div>
    </div>
  ) : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ph-detail-title"
      className={`ph-modal-backdrop fixed inset-0 z-[100000] flex bg-black/82 p-3 motion-reduce:animate-none ${
        isTouch ? "items-center p-0" : "items-center justify-center md:p-4"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <div
        className={`mx-auto flex w-full max-w-[min(100%,400px)] flex-col overflow-hidden rounded-xl border motion-reduce:animate-none ${
          isTouch
            ? "ph-modal-sheet-up mb-2 max-h-[min(72dvh,480px)] w-[calc(100%-1.25rem)] rounded-b-xl rounded-t-xl"
            : "ph-modal-emerge max-h-[min(80vh,520px)]"
        }`}
        style={{
          borderColor: hexToRgba(primary, 0.4),
          background:
            "linear-gradient(180deg, rgba(22,18,14,1) 0%, rgba(12,10,8,1) 100%)",
          boxShadow: panelShadow,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-40 shrink-0 overflow-hidden sm:h-44">
          <LoadImage
            src={item.image ?? ""}
            alt={name}
            fill
            className="object-cover"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(12,10,8,0.75) 0%, transparent 55%)",
            }}
          />
          {item.discountPercent &&
          !(item.originalPrice && item.originalPrice > item.price) ? (
            <span
              className="absolute top-2.5 end-2.5 rounded-sm px-2 py-0.5 text-[9px] font-bold uppercase text-[#0c0a08]"
              style={{ background: primary }}
            >
              {locale === "ar"
                ? `${item.discountPercent}٪`
                : `-${item.discountPercent}%`}
            </span>
          ) : null}
          <button
            type="button"
            className="absolute end-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm text-[#0c0a08] shadow-md active:scale-95"
            style={{
              border: `1px solid ${hexToRgba(primary, 0.5)}`,
              background: primary,
            }}
            onClick={closeModal}
            aria-label={locale === "ar" ? "إغلاق" : "Close"}
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3.5">
          <p
            className="mb-1 text-[9px] uppercase tracking-[0.26em]"
            style={{ color: secondary }}
          >
            {catLabel}
          </p>
          <h2
            id="ph-detail-title"
            className="mb-2 text-lg font-semibold leading-snug text-[#f5e6c8]"
            style={{ fontFamily: displayFont }}
          >
            {name}
          </h2>
          {desc ? (
            <p className="mb-3 line-clamp-4 text-sm leading-relaxed text-[#c4b59a]">
              {desc}
            </p>
          ) : null}
          {priceBlock}
          {cartBlock}
        </div>
      </div>
    </div>
  );
}
