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
  SET_CATALOG_META,
} from "@/store/authMenu/authMenu";
import { useAppDispatch } from "@/store/hooks";
import Loader from "@/components/Global/Loader";
import {
  sortCategories,
  sortMenuItemsForDisplay,
} from "@/lib/menuCategoryOrder";
import {
  normalizeCategories,
  normalizeMenuItems,
} from "@/lib/menuItemNormalize";
import { resolveBootstrapCatalogMeta } from "@/lib/menuCatalogApi";
import type { MenuCatalogMeta } from "@/types/menuCatalog";

type Props = {
  menu: MenuItem[] | null;
  menuInfo: MenuInfo | null;
  ads: Ad[] | null;
  menuCustomizations: MenuCustomizations | null;
  categories: Category[] | null;
  delivery: Delivery | null;
  catalog: MenuCatalogMeta | null;
};

export default function UseDispatchMenu({
  menu,
  menuInfo,
  ads,
  menuCustomizations,
  categories,
  delivery,
  catalog,
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
    dispatch(
      SET_CATALOG_META(
        catalog ?? (menu ? resolveBootstrapCatalogMeta(menu.length) : null),
      ),
    );
    queueMicrotask(() => setLoading(false));
  }, [
    menu,
    menuInfo,
    ads,
    menuCustomizations,
    categories,
    delivery,
    catalog,
    dispatch,
  ]);
  return (
    <>
      {loading && (
        <div className="fixed inset-0 bg-white z-111111 flex items-center justify-center">
          <Loader
            logo={menuInfo?.logo}
            name={menuInfo?.restaurantName ?? menuInfo?.name}
            primaryColor={menuCustomizations?.primaryColor}
            secondaryColor={menuCustomizations?.secondaryColor}
          />
        </div>
      )}
    </>
  );
}
