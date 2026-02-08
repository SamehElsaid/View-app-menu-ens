"use client";

import { useState, useEffect } from "react";
import { IoPricetagOutline } from "react-icons/io5";
import { FiChevronRight, FiChevronLeft } from "react-icons/fi";
import { MenuItem } from "@/types/menu";

import { arabCurrencies, Currency } from "@/constants/currencies";
import { useLocale } from "next-intl";
import { Icon } from "../components/Icon";

interface MenuCardProps {
  item: MenuItem;
  index: number;
  currency?: string;
  onClick: () => void;
  isModalOpen: number;
  setIsModalOpen: (isModalOpen: number) => void;
}

export const MenuCardDefault = ({
  item,
  isModalOpen,
  setIsModalOpen,
  currency = "AED",
  onClick,
}: MenuCardProps) => {
  const locale = useLocale();
  const direction = locale === "ar" ? "rtl" : "ltr";
  const [isClosing, setIsClosing] = useState(false);

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
    setIsModalOpen(item.id);
    setIsClosing(false);
    onClick();
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsModalOpen(0);
      setIsClosing(false);
    }, 300); // Match animation duration
  };

  const ArrowIcon = locale === "ar" ? FiChevronLeft : FiChevronRight;

  return (
    <>
      <div
        onClick={handleCardClick}
        className="relative bg-white/95 backdrop-blur-sm  rounded-[2.5rem] shadow-xl shadow-(--bg-main)/5 border border-(--bg-main)/10 flex flex-col items-center text-center group transition-shadow hover:shadow-(--bg-main)/15 overflow-hidden cursor-pointer"
      >
        {/* FULL CARD SMOKE BACKGROUND */}

        <div className="relative w-full h-52 mb-6 flex items-center justify-center z-10">
          {/* INNER SMOKE FOR THE IMAGE CIRCLE */}

          {/* Circular image */}
          <div className="w-full h-full overflow-hidden  relative z-20 bg-white">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </div>

          {/* Subtle glow behind circle */}
          <div className="absolute inset-0 rounded-full bg-(--bg-main)/10 blur-3xl z-0 group-hover:bg-(--bg-main)/20 transition-colors" />
        </div>

        <div className="relative z-10 w-full p-6">
          <h3 className="text-2xl font-black mb-2 text-zinc-900 group-hover:text-(--bg-main) transition-colors">
            {itemName}
          </h3>

          <p className="text-zinc-500 text-sm leading-relaxed mb-6 h-12 overflow-hidden line-clamp-2">
            {itemDescription}
          </p>

          <div className="w-full flex items-center justify-between mt-auto pt-6 border-t border-(--bg-main)/10">
            <span className="text-(--bg-main) font-black text-2xl flex items-end gap-1 ">
              <span className="flex items-center gap-1">
                <span
                  style={{
                    transform:
                      locale === "ar" ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  <IoPricetagOutline className="text-2xl text-gray-500 animate-bounce" />
                </span>
                {item.price}
              </span>

              <span className="text-xs sm:text-sm font-medium text-gray-500">
                {getCurrency()}
              </span>
            </span>

            {/* Moving/Animated Action Button */}
            <button className="bg-(--bg-main) hover:bg-(--bg-main)/80 transition-all duration-300 text-white w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shadow-lg">
              <ArrowIcon className="text-lg sm:text-xl" />
            </button>
          </div>
        </div>
      </div>

      {/* Popup Modal */}
      {isModalOpen === item.id && (
        <div
          className={`fixed inset-0 z-11111111111 flex items-center justify-center p-4 transition-opacity duration-300 ${
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
              <img
                src={item.image}
                alt={itemName}
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
};
