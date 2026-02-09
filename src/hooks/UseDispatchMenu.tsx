/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { MenuItem, MenuInfo, MenuCustomizations, Category } from "@/types/menu";
import { Ad } from "@/types/Ad";
import { useEffect, useState } from "react";
import {
  SET_ACTIVE_MENU,
  SET_MENU_INFO,
  SET_ADS,
  SET_MENU_CUSTOMIZATIONS,
  SET_CATEGORIES,
} from "@/store/authMenu/authMenu";
import { useAppDispatch } from "@/store/hooks";
import Loader from "@/components/Global/Loader";

type Props = {
  menu: MenuItem[] | null;
  menuInfo: MenuInfo | null;
  ads: Ad[] | null;
  menuCustomizations: MenuCustomizations | null;
  categories: Category[] | null;
};

export default function UseDispatchMenu({
  menu,
  menuInfo,
  ads,
  menuCustomizations,
  categories,
}: Props) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (menu) {
      dispatch(SET_ACTIVE_MENU(menu));
    }
    if (categories) {
      dispatch(SET_CATEGORIES(categories));
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
    setLoading(false);
  }, [menu, menuInfo, ads, menuCustomizations, categories, dispatch]);
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
