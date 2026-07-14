"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { isValidTableParam, readTableSessionParam } from "@/lib/menuTable";
import { useTableCartAllowed } from "./useTableCartAllowed";

/**
 * Strip `?table=` only when we know the table is invalid or the plan is free.
 * If table validity is unknown (no tables list yet), keep the URL.
 * Never strip a valid dine-in session just because delivery context exists in memory.
 */
export function useStripInvalidTableParam(): void {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);
  const tableCartAllowed = useTableCartAllowed();

  useEffect(() => {
    const tableParam = readTableSessionParam(searchParams);

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
    if (validity !== false) return;

    stripTableParams();
  }, [searchParams, menuInfo, tableCartAllowed, router, pathname]);
}
