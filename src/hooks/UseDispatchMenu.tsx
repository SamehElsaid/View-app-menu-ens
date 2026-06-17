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
    const sortedCategories = categories ? sortCategories(categories) : null;
    if (menu) {
      dispatch(
        SET_ACTIVE_MENU(
          sortMenuItemsForDisplay(menu, sortedCategories ?? undefined),
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
