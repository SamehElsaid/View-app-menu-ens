"use client";

import LoadImage from "@/components/ImageLoad";
import type { SkyCartItem } from "@/lib/skyTemplateCart";

export type SkyCartLineItemProps = {
  item: SkyCartItem;
  isArabic: boolean;
  currencyLabel: string;
  /** When false, quantity controls are hidden (order summary read-only). */
  editable?: boolean;
  onDecrease?: (lineKey: string) => void;
  onIncrease?: (lineKey: string) => void;
  decreaseLabel?: string;
  increaseLabel?: string;
  className?: string;
};

function pickLineName(item: SkyCartItem, isArabic: boolean): string {
  return isArabic
    ? item.nameAr || item.name
    : item.nameEn || item.name;
}

function pickOptionSubtitle(item: SkyCartItem, isArabic: boolean): string | null {
  if (!item.size && !item.variant) return null;
  const parts = [
    item.size
      ? isArabic
        ? item.size.nameAr || item.size.nameEn
        : item.size.nameEn || item.size.nameAr
      : null,
    item.variant
      ? isArabic
        ? item.variant.labelAr || item.variant.labelEn
        : item.variant.labelEn || item.variant.labelAr
      : null,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

/** Shared cart line UI — same data/fonts as floating cart (RequestStaffButton). */
export default function SkyCartLineItem({
  item,
  isArabic,
  currencyLabel,
  editable = false,
  onDecrease,
  onIncrease,
  decreaseLabel,
  increaseLabel,
  className = "",
}: SkyCartLineItemProps) {
  const name = pickLineName(item, isArabic);
  const optionSubtitle = pickOptionSubtitle(item, isArabic);
  const lineTotal = item.quantity * item.price;

  return (
    <li
      className={`font-body rounded-xl border border-(--bg-main)/15 bg-(--bg-main)/2 p-3 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <LoadImage
            src={item.image}
            alt={name}
            className="h-12 w-12 shrink-0 rounded-lg border border-(--bg-main)/15 bg-white object-cover"
            width={48}
            height={48}
          />
          <div className="min-w-0">
            <p className="line-clamp-1 text-base font-semibold text-zinc-900">
              {name}
            </p>
            {optionSubtitle ? (
              <p className="mt-0.5 text-sm text-zinc-500">{optionSubtitle}</p>
            ) : null}
            <p className="mt-1 text-base text-zinc-600">
              {item.price.toFixed(2)} {currencyLabel}
            </p>
          </div>
        </div>
        {editable && onDecrease && onIncrease ? (
          <div className="shrink-0 rounded-lg bg-white p-1 shadow-base">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onDecrease(item.lineKey)}
                className="h-7 w-7 rounded-md border border-(--bg-main)/20 text-(--bg-main) transition hover:bg-(--bg-main)/10"
                aria-label={decreaseLabel}
              >
                -
              </button>
              <span className="min-w-6 text-center text-base font-semibold text-(--bg-main)">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => onIncrease(item.lineKey)}
                disabled={item.quantity >= 999}
                className="h-7 w-7 rounded-md border border-(--bg-main)/20 text-(--bg-main) transition hover:bg-(--bg-main)/10 disabled:opacity-40"
                aria-label={increaseLabel}
              >
                +
              </button>
            </div>
          </div>
        ) : (
          <span className="shrink-0 text-base font-semibold tabular-nums text-(--bg-main)">
            ×{item.quantity}
          </span>
        )}
      </div>
      <p className="mt-2 text-base font-medium text-zinc-700">
        {lineTotal.toFixed(2)} {currencyLabel}
      </p>
    </li>
  );
}
