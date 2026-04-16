import { useState, useEffect } from "react";
import { Icon } from "../components/Icon";
import { MenuItem } from "@/types/menu";
import { arabCurrencies, Currency } from "@/constants/currencies";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import LoadImage from "@/components/ImageLoad";

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
  const locale = useLocale();
  const searchParams = useSearchParams();
  const isTableOrder = Boolean(searchParams.get("table")?.trim());
  const direction = locale === "ar" ? "rtl" : "ltr";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
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

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  const handleCardClick = () => {
    setIsModalOpen(true);
    setIsClosing(false);
    onClick();
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsClosing(false);
    }, 300); // Match animation duration
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
            src={item.image}
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
            <span className="bg-(--bg-main)/90 backdrop-blur-md text-white text-[10px] font-black px-4 py-2 rounded-full shadow-sm tracking-widest uppercase border border-white/20">
              {itemCategoryName}
            </span>
          </div>

          {/* Price Tag - Sky Blue */}
          <div className="absolute bottom-4 left-8 z-20 bg-(--bg-main) text-white px-5 py-2 rounded-2xl shadow-xl border-4 border-white">
            <span className="text-lg font-black tracking-tighter">
              {item.price} {getCurrency()}
            </span>
            {item.originalPrice && item.discountPercent && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-white/80 line-through">
                  {item.originalPrice} {getCurrency()}
                </span>
                <span className="text-xs font-black bg-white text-(--bg-main) px-2 py-0.5 rounded-full">
                  -{item.discountPercent}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 pt-2 relative z-10 text-right">
          <div className="mb-4">
            <h3 className="text-2xl font-black text-(--bg-main) mb-2 group-hover:text-(--bg-main) transition-colors tracking-tight">
              {itemName}
            </h3>
            <div className="w-8 h-1 bg-(--bg-main)/10 rounded-full group-hover:w-16 transition-all duration-500" />
          </div>

          <p className="text-(--bg-main)/70 text-sm leading-relaxed mb-8 h-12 overflow-hidden font-medium opacity-90 line-clamp-2">
            {itemDescription}
          </p>

          {isTableOrder && (
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(selectedQuantity);
                  setSelectedQuantity(1);
                }}
                className="rounded-xl bg-(--bg-main) px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
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
                  className="h-8 w-8 rounded-lg border border-(--bg-main)/40 text-(--bg-main)"
                >
                  -
                </button>
                <span className="min-w-6 text-center text-sm font-semibold text-(--bg-main)">
                  {selectedQuantity}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedQuantity((prev) => prev + 1);
                  }}
                  aria-label={increaseLabel}
                  className="h-8 w-8 rounded-lg border border-(--bg-main)/40 text-(--bg-main)"
                >
                  +
                </button>
              </div>
            </div>
          )}
          {isTableOrder && quantity > 0 && (
            <p className="mt-2 text-xs text-(--bg-main)/70">
              {locale === "ar" ? `في السلة: ${quantity}` : `In cart: ${quantity}`}
            </p>
          )}
        </div>

        {/* Side Decorative Line */}
        <div className="absolute top-0 left-0 w-1.5 h-full bg-(--bg-main)/10 group-hover:bg-(--bg-main) transition-colors duration-700" />
      </div>

      {/* Popup Modal */}
      {isModalOpen && (
        <div
          className={`fixed inset-0 z-1111111111 flex items-center justify-center p-4 transition-opacity duration-300 ${
            isClosing ? "opacity-0" : "opacity-100"
          }`}
          onClick={handleClose}
        >
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/80  backdrop-blur-md transition-opacity duration-300 ${
              isClosing ? "opacity-0" : "opacity-100"
            }`}
          />

          {/* Modal Content */}
          <div
            dir={direction}
            className={`relative w-full max-w-2xl bg-white rounded-[2.5rem] overflow-hidden border border-(--bg-main)/20 shadow-2xl transition-all duration-300 ${
              isClosing ? "animate-modal-out" : "animate-modal-in"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className={`absolute top-6 z-30 w-12 h-12 rounded-full bg-(--bg-main)/90 backdrop-blur-sm flex items-center justify-center text-white hover:bg-(--bg-main) transition-all duration-300 shadow-lg ${
                direction === "rtl" ? "left-6" : "right-6"
              }`}
            >
              <Icon name="close-line" className="text-xl" />
            </button>

            {/* Image Section */}
            <div className="relative h-80 sm:h-96 overflow-hidden">
              <LoadImage
                src={item.image}
                alt={itemName}
                disableLazy={true}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-white via-transparent to-transparent" />

              {/* Category Badge */}
              {itemCategoryName && (
                <div
                  className={`absolute top-6 bg-(--bg-main)/90 backdrop-blur-md text-white text-xs font-black px-4 py-2 rounded-full shadow-sm tracking-widest uppercase border border-white/20 ${
                    direction === "rtl" ? "right-6" : "left-6"
                  }`}
                >
                  {itemCategoryName}
                </div>
              )}

              {/* Price Badge */}
              <div
                className={`absolute bottom-6 bg-(--bg-main) text-white px-6 py-3 rounded-2xl shadow-xl border-4 border-white ${
                  direction === "rtl" ? "right-6" : "left-6"
                }`}
              >
                <span className="text-2xl font-black tracking-tighter">
                  {item.price} {getCurrency()}
                </span>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8 space-y-6">
              {/* Title */}
              <div>
                <h2 className="text-3xl font-black text-(--bg-main) mb-3 tracking-tight">
                  {itemName}
                </h2>
                <div className="w-12 h-1.5 bg-(--bg-main) rounded-full" />
              </div>

              {/* Description */}
              <p className="text-(--bg-main)/70 text-base leading-relaxed font-medium">
                {itemDescription}
              </p>

              {isTableOrder && (
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-(--bg-main)/20 p-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(selectedQuantity);
                      setSelectedQuantity(1);
                    }}
                    className="rounded-xl bg-(--bg-main) px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
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
                      className="h-8 w-8 rounded-lg border border-(--bg-main)/40 text-(--bg-main)"
                    >
                      -
                    </button>
                    <span className="min-w-6 text-center text-sm font-semibold text-(--bg-main)">
                      {selectedQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedQuantity((prev) => prev + 1);
                      }}
                      aria-label={increaseLabel}
                      className="h-8 w-8 rounded-lg border border-(--bg-main)/40 text-(--bg-main)"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
              {isTableOrder && quantity > 0 && (
                <p className="text-sm text-(--bg-main)/70">
                  {locale === "ar" ? `في السلة: ${quantity}` : `In cart: ${quantity}`}
                </p>
              )}

              {/* Divider */}
              <div className="h-px bg-(--bg-main)/10" />

              {/* Additional Info */}
              {item.originalPrice && item.discountPercent && (
                <div className="flex items-center justify-between p-4 bg-(--bg-main)/5 rounded-2xl">
                  <span className="text-(--bg-main)/70 font-medium">
                    {locale === "ar" ? "السعر الأصلي" : "Original Price"}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-lg text-(--bg-main)/50 line-through font-medium">
                      {item.originalPrice} {getCurrency()}
                    </span>
                    <span className="text-sm font-black bg-(--bg-main) text-white px-3 py-1 rounded-full">
                      -{item.discountPercent}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
