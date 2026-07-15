"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { CLEAR_DELIVERY_CONTEXT } from "@/store/authMenu/authMenu";
import { isValidTableParam } from "@/lib/menuTable";
import { useTableCartAllowed } from "./useTableCartAllowed";
import { useMenuTableParam } from "./useMenuTableParam";

/**
 * Strip `?table=` when the table is invalid, inactive, or the plan is free.
 * Guest then sees the regular menu (no dine-in / table services session).
 * If table validity is unknown (no tables list yet), keep the URL.
 *
 * Valid table QR mode wins over delivery: clear any in-memory delivery session
 * so the delivery location cycle does not run / override table ordering.
 */
export function useStripInvalidTableParam(): void {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);
  const tableCartAllowed = useTableCartAllowed();
  const deliveryContext = useAppSelector((state) => state.menu.deliveryContext);
  const tableParam = useMenuTableParam();

  useEffect(() => {
    if (!tableParam || !menuInfo) return;

    function stripTableParams() {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("table");
      params.delete("tableNumber");
      params.delete("tableId");

      const nextQuery = params.toString();
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
        scroll: false,
      });
    }

    if (!tableCartAllowed) {
      stripTableParams();
      return;
    }

    const validity = isValidTableParam(menuInfo, tableParam);
    if (validity === false) {
      stripTableParams();
      return;
    }

    // Valid (or still-unknown) table: stop delivery cycle / clear session.
    const hasDeliverySession =
      deliveryContext.browseOnly ||
      deliveryContext.governorateId != null ||
      deliveryContext.distance != null;
    if (hasDeliverySession) {
      dispatch(CLEAR_DELIVERY_CONTEXT());
    }
  }, [
    searchParams,
    menuInfo,
    tableCartAllowed,
    router,
    pathname,
    deliveryContext,
    dispatch,
  ]);
}
