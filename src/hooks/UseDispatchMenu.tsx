/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { MenuItem, MenuInfo } from "@/types/menu";
import { Ad } from "@/types/Ad";
import { useEffect, useState } from "react";
import { SET_ACTIVE_MENU, SET_MENU_INFO, SET_ADS } from "@/store/authMenu/authMenu";
import { useAppDispatch } from "@/store/hooks";
import Loader from "@/components/Global/Loader";

type Props = {
    menu: MenuItem[] | null;
    menuInfo: MenuInfo | null;
    ads: Ad[] | null;
};

export default function UseDispatchMenu({ menu, menuInfo, ads }: Props) {
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (menu) {
            dispatch(SET_ACTIVE_MENU(menu));
        }
        if (menuInfo) {
            dispatch(SET_MENU_INFO(menuInfo));
        }
        if (ads) {
            dispatch(SET_ADS(ads));
        }
        setLoading(false);
    }, [menu, menuInfo, ads, dispatch]);
    return <>
        {(loading) && (
            <div className="fixed top-0 left-0 right-0 bottom-0 bg-white z-111111 flex items-center justify-center">
                <Loader />
            </div>
        )}</>
}
