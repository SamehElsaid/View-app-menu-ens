/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { MenuItem, MenuInfo, MenuCustomizations, Category, Delivery } from "@/types/menu";
import { Ad } from "@/types/Ad";
import { useEffect, useState } from "react";
import {
  SET_ACTIVE_MENU,
  SET_MENU_INFO,
  SET_ADS,
  SET_MENU_CUSTOMIZATIONS,
  SET_CATEGORIES,
  SET_DELIVERY,
} from "@/store/authMenu/authMenu";
import { useAppDispatch } from "@/store/hooks";
import Loader from "@/components/Global/Loader";
import {
  sortCategories,
  sortMenuItemsForDisplay,
} from "@/lib/menuCategoryOrder";

function normalizePrice(val: unknown): number {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
}

function normalizeMenuItem(item: MenuItem): MenuItem {
  return {
    ...item,
    price: normalizePrice(item.price),
    originalPrice:
      item.originalPrice != null ? normalizePrice(item.originalPrice) : null,
    sizes: Array.isArray(item.sizes)
      ? item.sizes
          .filter(Boolean)
          .map((s) => ({ ...s, price: normalizePrice(s.price) }))
      : null,
    variants: Array.isArray(item.variants)
      ? item.variants
          .filter(Boolean)
          .map((v) => ({ ...v, price: normalizePrice(v.price) }))
      : null,
  };
}

function normalizeMenuItems(items: MenuItem[]): MenuItem[] {
  return items.map(normalizeMenuItem);
}

function normalizeCategories(cats: Category[]): Category[] {
  return cats.map((cat) => ({
    ...cat,
    menuItems: Array.isArray(cat.menuItems)
      ? normalizeMenuItems(cat.menuItems)
      : cat.menuItems,
  }));
}

type Props = {
  menu: MenuItem[] | null;
  menuInfo: MenuInfo | null;
  ads: Ad[] | null;
  menuCustomizations: MenuCustomizations | null;
  categories: Category[] | null;
  delivery: Delivery | null;
};

export default function UseDispatchMenu({
  menu,
  menuInfo,
  ads,
  menuCustomizations,
  categories,
  delivery,
}: Props) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const sortedCategories = categories
      ? normalizeCategories(sortCategories(categories))
      : null;
    if (menu) {
      dispatch(
        SET_ACTIVE_MENU(
          normalizeMenuItems(
            sortMenuItemsForDisplay(menu, sortedCategories ?? undefined),
          ),
        ),
      );
    }
    if (sortedCategories) {
      dispatch(SET_CATEGORIES(sortedCategories));
    }
    if (menuInfo) {
      dispatch(SET_MENU_INFO(menuInfo));
    }
    if (ads) {
      dispatch(SET_ADS(ads));
    }
    if (menuCustomizations) {
      dispatch(SET_MENU_CUSTOMIZATIONS(menuCustomizations));
    }
    dispatch(SET_DELIVERY(delivery ?? null));
    setLoading(false);
  }, [menu, menuInfo, ads, menuCustomizations, categories, delivery, dispatch]);
  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-white z-111111 flex items-center justify-center">
          <Loader />
        </div>
      )}
    </>
  );
}
