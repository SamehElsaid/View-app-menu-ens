"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const ITEM_QUERY = "item";

function buildPath(pathname: string, params: URLSearchParams): string {
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function parseOpenItemId(searchParams: URLSearchParams): number {
  const raw = searchParams.get(ITEM_QUERY)?.trim();
  if (!raw) return 0;
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 && id === Math.floor(id) ? id : 0;
}

/** Sync product detail popup with `?item=<id>` in the URL (back/forward safe). */
export function useProductModalUrl() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const openedViaPushRef = useRef(false);

  const openItemId = useMemo(
    () => parseOpenItemId(searchParams),
    [searchParams],
  );

  const openModal = useCallback(
    (itemId: number) => {
      if (!itemId) return;
      const params = new URLSearchParams(searchParams.toString());
      if (params.get(ITEM_QUERY) === String(itemId)) return;
      params.set(ITEM_QUERY, String(itemId));
      openedViaPushRef.current = true;
      router.push(buildPath(pathname, params), { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const closeModal = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (!params.has(ITEM_QUERY)) return;

    if (openedViaPushRef.current) {
      openedViaPushRef.current = false;
      router.back();
      return;
    }

    params.delete(ITEM_QUERY);
    router.replace(buildPath(pathname, params), { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (!openItemId) {
      openedViaPushRef.current = false;
    }
  }, [openItemId]);

  return {
    openItemId,
    isModalOpen: openItemId > 0,
    openModal,
    closeModal,
  };
}
