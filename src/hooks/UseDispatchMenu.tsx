/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { MenuItem } from "@/types/menu";
import { useEffect, useState } from "react";
import { SET_ACTIVE_MENU } from "@/store/authMenu/authMenu";
import { useAppDispatch } from "@/store/hooks";
import Loader from "@/components/Global/Loader";

export default function UseDispatchMenu({ menu }: { menu: MenuItem[] | null }) {
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (menu) {
            dispatch(SET_ACTIVE_MENU(menu));
        }
        setLoading(false);
    }, [menu, dispatch]);
    return <>
        {(loading) && (
            <div className="fixed top-0 left-0 right-0 bottom-0 bg-white z-111111 flex items-center justify-center">
                <Loader />
            </div>
        )}</>
}
