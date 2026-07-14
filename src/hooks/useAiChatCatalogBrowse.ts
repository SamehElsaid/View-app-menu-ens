"use client";

import { useCallback, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { fetchMenuCatalog } from "@/lib/menuCatalogApi";
import { mergeMenuItemsById } from "@/lib/menuItemNormalize";
import { APPEND_MENU_ITEMS } from "@/store/authMenu/authMenu";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { MenuItem } from "@/types/menu";

export type AiChatCatalogBrowseState = {
  categoryId: number | null;
  title: string;
  items: MenuItem[];
  page: number;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
};

const emptyBrowse: AiChatCatalogBrowseState = {
  categoryId: null,
  title: "",
  items: [],
  page: 0,
  hasMore: false,
  loading: false,
  loadingMore: false,
};

/**
 * Chat-scoped catalog pagination. Reuses fetchMenuCatalog + Redux APPEND
 * so loaded items feed the shared menu / AI catalog. Themes keep using
 * useMenuCatalogPagination for their own scroll UX.
 */
export function useAiChatCatalogBrowse() {
  const locale = useLocale();
  const dispatch = useAppDispatch();
  const slug = useAppSelector((state) => state.menu.menuInfo?.slug);
  const [state, setState] = useState<AiChatCatalogBrowseState>(emptyBrowse);
  const requestIdRef = useRef(0);

  const clearBrowse = useCallback(() => {
    requestIdRef.current += 1;
    setState(emptyBrowse);
  }, []);

  const startBrowse = useCallback(
    async (opts: { categoryId: number; title: string }) => {
      if (!slug) return;

      const requestId = ++requestIdRef.current;
      setState({
        categoryId: opts.categoryId,
        title: opts.title,
        items: [],
        page: 0,
        hasMore: false,
        loading: true,
        loadingMore: false,
      });

      const result = await fetchMenuCatalog(slug, locale, {
        page: 1,
        categoryId: opts.categoryId > 0 ? opts.categoryId : undefined,
      });

      if (requestId !== requestIdRef.current) return;

      if (!result) {
        setState({
          categoryId: opts.categoryId,
          title: opts.title,
          items: [],
          page: 0,
          hasMore: false,
          loading: false,
          loadingMore: false,
        });
        return;
      }

      if (result.items.length) {
        dispatch(APPEND_MENU_ITEMS(result.items));
      }

      setState({
        categoryId: opts.categoryId,
        title: opts.title,
        items: result.items,
        page: 1,
        hasMore: result.meta.hasMore,
        loading: false,
        loadingMore: false,
      });
    },
    [dispatch, locale, slug],
  );

  const loadMore = useCallback(async () => {
    if (!slug) return;
    if (state.categoryId == null) return;
    if (!state.hasMore || state.loading || state.loadingMore) return;

    const requestId = ++requestIdRef.current;
    const categoryId = state.categoryId;
    const nextPage = state.page + 1;

    setState((prev) => ({ ...prev, loadingMore: true }));

    const result = await fetchMenuCatalog(slug, locale, {
      page: nextPage,
      categoryId: categoryId > 0 ? categoryId : undefined,
    });

    if (requestId !== requestIdRef.current) return;

    if (!result) {
      setState((prev) => ({
        ...prev,
        hasMore: false,
        loadingMore: false,
      }));
      return;
    }

    if (result.items.length) {
      dispatch(APPEND_MENU_ITEMS(result.items));
    }

    setState((prev) => ({
      ...prev,
      items: mergeMenuItemsById(prev.items, result.items),
      page: nextPage,
      hasMore: result.meta.hasMore,
      loadingMore: false,
    }));
  }, [
    dispatch,
    locale,
    slug,
    state.categoryId,
    state.hasMore,
    state.loading,
    state.loadingMore,
    state.page,
  ]);

  return {
    ...state,
    isBrowsing: state.categoryId != null || state.loading,
    startBrowse,
    loadMore,
    clearBrowse,
  };
}
