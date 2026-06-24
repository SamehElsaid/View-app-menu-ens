import { useState } from "react";
import { MenuItem } from "@/types/menu";
import SkyDetailModal from "./SkyDetailModal";
import { arabCurrencies, Currency } from "@/constants/currencies";
import { useLocale } from "next-intl";
import { useIsOrderingEnabled } from "@/hooks/useIsOrderingEnabled";
import LoadImage from "@/components/ImageLoad";
import { useTrackMenuItemClick } from "@/hooks/useTrackMenuItemClick";
import {
  getMenuItemMinPrice,
  hasMenuItemOptions,
} from "@/lib/menuItemOptions";

interface MenuCardProps {
  item: MenuItem;
  currency?: string;
  onClick: () => void;
  quantity?: number;
  addToCartLabel: string;
  increaseLabel: string;
  decreaseLabel: string;
  onAddToCart: (quantity: number) => void;
}

export default function MenuCard({
  item,
  currency = "AED",
  onClick,
  quantity = 0,
  addToCartLabel,
  increaseLabel,
  decreaseLabel,
  onAddToCart,
}: MenuCardProps) {
  const { trackItem } = useTrackMenuItemClick();
  const locale = useLocale();
  const { isOrderingEnabled: isTableOrder } = useIsOrderingEnabled();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  // Get translated name and description based on locale
  const itemName =
    locale === "ar" ? item.nameAr || item.name : item.nameEn || item.name;
  const itemDescription =
    locale === "ar"
      ? item.descriptionAr || item.description
      : item.descriptionEn || item.description;
  const itemCategoryName =
    locale === "ar"
      ? item.categoryNameAr || item.categoryName
      : item.categoryNameEn || item.categoryName;

  const getCurrency = () => {
    let currencySymbol: string = currency;
    if (locale === "ar") {
      const foundCurrency = arabCurrencies.find(
        (currencyList: Currency) => currencyList.code === currency,
      );
      if (foundCurrency && foundCurrency.symbol) {
        currencySymbol = foundCurrency.symbol;
      }
    }
    return currencySymbol;
  };

  const itemHasOptions = hasMenuItemOptions(item);
  const displayMinPrice = getMenuItemMinPrice(item);
  const priceDisplay = itemHasOptions
    ? locale === "ar"
      ? `يبدأ من ${displayMinPrice}`
      : `From ${displayMinPrice}`
    : `${item.price}`;

  const handleCardClick = () => {
    trackItem(item.id);
    setIsModalOpen(true);
    onClick();
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="group relative bg-white border border-(--bg-main)/10 rounded-[2.5rem] overflow-hidden transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(14,165,233,0.15)] cursor-pointer"
      >
        {/* Image Section - Full Width with Modern Cut */}
        <div className="relative h-64 w-full overflow-hidden">
          {/* Sky Blue Smoke */}

          <LoadImage
            src={item.image ?? ""}
            alt={itemName}
            className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1"
            disableLazy={true}
          />

          {/* Diagonal Overlay Cut */}
          <div
            className="absolute bottom-0 left-0 right-0 h-16 bg-white"
            style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0, 0 80%)" }}
          />

          {/* Floating Category Tag - Sky Blue */}
          <div className="absolute top-6 right-6 z-10">
            <span className="bg-(--bg-main)/90 backdrop-blur-md text-white text-xs font-black px-3 py-1.5 rounded-full shadow-base tracking-widest uppercase border border-white/20">
              {itemCategoryName}
            </span>
          </div>

          {/* Price Tag - Sky Blue */}
          <div className="absolute bottom-4 left-8 z-20 bg-(--bg-main) text-white px-3 py-1 rounded-2xl shadow-xl border-4 border-white">
            <span className="text-xs font-black tracking-tighter">
              {priceDisplay} {getCurrency()}
            </span>
            {item.originalPrice && item.discountPercent && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-white/80 line-through">
                  {item.originalPrice} {getCurrency()}
                </span>
                <span className="text-xs font-black bg-white text-(--bg-main) px-1.5 py-0.5 rounded-full">
                  -{item.discountPercent}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 pt-2 relative z-10 text-right">
          <div className="mb-3">
            <h3 className="text-lg font-black text-(--bg-main) mb-1.5 group-hover:text-(--bg-main) transition-colors tracking-tight">
              {itemName}
            </h3>
            <div className="w-8 h-1 bg-(--bg-main)/10 rounded-full group-hover:w-16 transition-all duration-500" />
          </div>

          <p className="text-(--bg-main)/70 text-sm leading-relaxed mb-5 overflow-hidden font-medium opacity-90 line-clamp-2">
            {itemDescription}
          </p>

          {isTableOrder && (
            <div className="flex items-center justify-between gap-3">
              {itemHasOptions ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick();
                  }}
                  className="rounded-xl bg-(--bg-main) px-3 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  {locale === "ar" ? "أضف للسلة" : "Add to cart"}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(selectedQuantity);
                      setSelectedQuantity(1);
                    }}
                    className="rounded-xl bg-(--bg-main) px-3 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    {addToCartLabel}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedQuantity((prev) => Math.max(1, prev - 1));
                      }}
                      aria-label={decreaseLabel}
                      className="h-7 w-7 rounded-lg border border-(--bg-main)/40 text-(--bg-main) text-sm"
                    >
                      -
                    </button>
                    <span className="min-w-5 text-center text-sm font-semibold text-(--bg-main)">
                      {selectedQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedQuantity((prev) => prev + 1);
                      }}
                      aria-label={increaseLabel}
                      className="h-7 w-7 rounded-lg border border-(--bg-main)/40 text-(--bg-main) text-sm"
                    >
                      +
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
          {isTableOrder && quantity > 0 && (
            <p className="mt-1.5 text-xs text-(--bg-main)/70">
              {locale === "ar"
                ? `في السلة: ${quantity}`
                : `In cart: ${quantity}`}
            </p>
          )}
        </div>

        {/* Side Decorative Line */}
        <div className="absolute top-0 left-0 w-1.5 h-full bg-(--bg-main)/10 group-hover:bg-(--bg-main) transition-colors duration-700" />
      </div>

      {isModalOpen ? (
        <SkyDetailModal
          item={item}
          onClose={() => setIsModalOpen(false)}
          currency={currency}
          isTableOrder={isTableOrder}
          quantity={quantity}
          addToCartLabel={addToCartLabel}
          increaseLabel={increaseLabel}
          decreaseLabel={decreaseLabel}
          onAddToCart={onAddToCart}
        />
      ) : null}
    </>
  );
}
