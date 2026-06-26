"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import {
  fetchMenuCatalog,
  mergeCatalogCategoryCounts,
  type MenuCatalogFetchResult,
} from "@/lib/menuCatalogApi";
import {
  getCatalogObserverRootMargin,
  isElementInCatalogPrefetchZone,
} from "@/lib/menuCatalogScroll";
import { mergeMenuItemsById } from "@/lib/menuItemNormalize";
import {
  APPEND_MENU_ITEMS,
  SET_CATALOG_META,
  SET_CATEGORIES,
} from "@/store/authMenu/authMenu";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { MenuItem } from "@/types/menu";

type ScopeState = {
  page: number;
  hasMore: boolean;
};

function scopeKey(categoryId: number): string {
  return categoryId === 0 ? "all" : `cat:${categoryId}`;
}

export function useMenuCatalogPagination(activeCategoryId: number) {
  const locale = useLocale();
  const dispatch = useAppDispatch();
  const slug = useAppSelector((state) => state.menu.menuInfo?.slug);
  const allItems = useAppSelector((state) => state.menu.menu ?? []);
  const storeCategories = useAppSelector((state) => state.menu.categories ?? []);
  const bootstrapCatalog = useAppSelector((state) => state.menu.catalog);

  const [loading, setLoading] = useState(false);
  const [categoryItems, setCategoryItems] = useState<MenuItem[]>([]);
  const [scopeVersion, bumpScopeVersion] = useState(0);

  const scopeStatesRef = useRef<Map<string, ScopeState>>(new Map());
  const loadingRef = useRef(false);
  const bootstrapInitRef = useRef(false);
  const eagerAllLoadRef = useRef(false);
  const requestIdRef = useRef(0);
  const prevLocaleRef = useRef(locale);
  const storeCategoriesRef = useRef(storeCategories);
  const hasMoreRef = useRef(false);
  const activeCategoryRef = useRef(activeCategoryId);
  const allItemsRef = useRef(allItems);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadNextPageRef = useRef<() => Promise<void>>(async () => {});
  const schedulePrefetchIfNeededRef = useRef<() => void>(() => {});

  storeCategoriesRef.current = storeCategories;
  activeCategoryRef.current = activeCategoryId;
  allItemsRef.current = allItems;

  const key = scopeKey(activeCategoryId);

  useEffect(() => {
    if (bootstrapInitRef.current || !bootstrapCatalog) return;

    bootstrapInitRef.current = true;
    scopeStatesRef.current.set("all", {
      page: bootstrapCatalog.page,
      hasMore: bootstrapCatalog.hasMore,
    });
    bumpScopeVersion((value) => value + 1);

    // After (re-)initializing, check if the sentinel is already in the
    // prefetch zone — this covers locale-change scenarios where the user
    // hasn't scrolled since the language switch.
    queueMicrotask(() => schedulePrefetchIfNeededRef.current());
  }, [bootstrapCatalog]);

  // When the locale changes (language switch), clear all stale pagination state
  // so the hook re-initializes correctly once the new locale's catalog arrives.
  useEffect(() => {
    if (prevLocaleRef.current === locale) return;
    prevLocaleRef.current = locale;

    requestIdRef.current++;
    loadingRef.current = false;
    setLoading(false);
    setCategoryItems([]);

    // Clear per-scope page counters — they are locale-specific.
    scopeStatesRef.current.clear();
    bumpScopeVersion((v) => v + 1);

    // Allow bootstrap init and eager load to re-run with the new locale's data.
    bootstrapInitRef.current = false;
    eagerAllLoadRef.current = false;
  }, [locale]);

  const syncAllCatalogMeta = useCallback(
    (next: ScopeState) => {
      if (!bootstrapCatalog) return;

      dispatch(
        SET_CATALOG_META({
          page: next.page,
          hasMore: next.hasMore,
          limit: bootstrapCatalog.limit,
          total: bootstrapCatalog.total,
        }),
      );
    },
    [bootstrapCatalog, dispatch],
  );

  const updateScope = useCallback(
    (scopeKeyValue: string, next: ScopeState) => {
      scopeStatesRef.current.set(scopeKeyValue, next);
      bumpScopeVersion((value) => value + 1);

      if (scopeKeyValue === "all") {
        syncAllCatalogMeta(next);
      }
    },
    [syncAllCatalogMeta],
  );

  const applyCatalogCategories = useCallback(
    (incoming: MenuCatalogFetchResult) => {
      if (!incoming.categories.length) return;

      const current = storeCategoriesRef.current;
      if (!current.length) return;

      dispatch(
        SET_CATEGORIES(mergeCatalogCategoryCounts(current, incoming.categories)),
      );
    },
    [dispatch],
  );

  const hasMore = useMemo(() => {
    const scope = scopeStatesRef.current.get(key);
    let nextHasMore = scope?.hasMore ?? false;

    if (!scope) {
      if (activeCategoryId === 0) {
        nextHasMore = bootstrapCatalog?.hasMore ?? false;
      } else {
        return false;
      }
    }

    if (
      activeCategoryId === 0 &&
      typeof bootstrapCatalog?.total === "number" &&
      allItems.length >= bootstrapCatalog.total
    ) {
      return false;
    }

    return nextHasMore;
  }, [activeCategoryId, allItems.length, bootstrapCatalog, key, scopeVersion]);

  hasMoreRef.current = hasMore;

  const schedulePrefetchIfNeeded = useCallback(() => {
    if (loadingRef.current || !hasMoreRef.current) return;

    const element = sentinelRef.current;
    if (!element || !isElementInCatalogPrefetchZone(element)) return;

    void loadNextPageRef.current();
  }, []);

  schedulePrefetchIfNeededRef.current = schedulePrefetchIfNeeded;

  const loadNextPage = useCallback(async () => {
    if (!slug || loadingRef.current || !hasMoreRef.current) return;

    const categoryId = activeCategoryRef.current;
    const scopeKeyValue = scopeKey(categoryId);
    const currentScope = scopeStatesRef.current.get(scopeKeyValue) ?? {
      page: categoryId === 0 ? (bootstrapCatalog?.page ?? 0) : 0,
      hasMore:
        categoryId === 0 ? (bootstrapCatalog?.hasMore ?? false) : true,
    };

    if (!currentScope.hasMore) return;

    loadingRef.current = true;
    setLoading(true);

    const requestId = ++requestIdRef.current;
    const nextPage = currentScope.page + 1;

    try {
      const result = await fetchMenuCatalog(slug, locale, {
        page: nextPage,
        categoryId: categoryId === 0 ? undefined : categoryId,
      });

      if (requestId !== requestIdRef.current) return;

      if (!result) {
        updateScope(scopeKeyValue, { page: currentScope.page, hasMore: false });
        return;
      }

      applyCatalogCategories(result);

      if (result.items.length) {
        dispatch(APPEND_MENU_ITEMS(result.items));
      }

      if (categoryId === 0) {
        const projectedCount = result.items.length
          ? mergeMenuItemsById(allItemsRef.current, result.items).length
          : allItemsRef.current.length;

        updateScope(scopeKeyValue, {
          page: nextPage,
          hasMore:
            result.meta.hasMore &&
            (bootstrapCatalog?.total == null ||
              projectedCount < bootstrapCatalog.total),
        });
        return;
      }

      updateScope(scopeKeyValue, {
        page: nextPage,
        hasMore: result.meta.hasMore,
      });

      setCategoryItems((current) =>
        mergeMenuItemsById(current, result.items),
      );
    } finally {
      if (requestId === requestIdRef.current) {
        loadingRef.current = false;
        setLoading(false);
        queueMicrotask(schedulePrefetchIfNeeded);
      }
    }
  }, [
    applyCatalogCategories,
    bootstrapCatalog?.hasMore,
    bootstrapCatalog?.limit,
    bootstrapCatalog?.total,
    dispatch,
    locale,
    schedulePrefetchIfNeeded,
    slug,
    updateScope,
  ]);

  loadNextPageRef.current = loadNextPage;

  const loadInitialCategory = useCallback(
    async (categoryId: number) => {
      if (!slug) return;

      loadingRef.current = true;
      setLoading(true);

      const requestId = ++requestIdRef.current;

      try {
        const result = await fetchMenuCatalog(slug, locale, {
          page: 1,
          categoryId,
        });

        if (requestId !== requestIdRef.current) return;

        if (!result) {
          updateScope(scopeKey(categoryId), { page: 0, hasMore: false });
          setCategoryItems([]);
          return;
        }

        applyCatalogCategories(result);

        if (result.items.length) {
          dispatch(APPEND_MENU_ITEMS(result.items));
        }

        updateScope(scopeKey(categoryId), {
          page: 1,
          hasMore: result.meta.hasMore,
        });

        setCategoryItems(result.items);
      } finally {
        if (requestId === requestIdRef.current) {
          loadingRef.current = false;
          setLoading(false);
          queueMicrotask(schedulePrefetchIfNeeded);
        }
      }
    },
    [applyCatalogCategories, dispatch, locale, schedulePrefetchIfNeeded, slug, updateScope],
  );

  useEffect(() => {
    if (activeCategoryId === 0) {
      setCategoryItems([]);
      return;
    }

    setCategoryItems([]);
    updateScope(scopeKey(activeCategoryId), { page: 0, hasMore: true });
    void loadInitialCategory(activeCategoryId);
  }, [activeCategoryId, loadInitialCategory, updateScope]);

  // locale and bootstrapCatalog.page are both deps so this effect only fires
  // once the new locale's bootstrap data has landed in Redux (page resets to 1).
  // That prevents loading the wrong page number with a stale scope.
  useEffect(() => {
    if (
      activeCategoryId !== 0 ||
      !slug ||
      !bootstrapCatalog?.hasMore ||
      eagerAllLoadRef.current
    ) {
      return;
    }

    eagerAllLoadRef.current = true;
    void loadNextPageRef.current();
  }, [activeCategoryId, bootstrapCatalog?.hasMore, bootstrapCatalog?.page, slug, locale]);

  const items = useMemo(() => {
    if (activeCategoryId === 0) return allItems;
    return categoryItems;
  }, [activeCategoryId, allItems, categoryItems]);

  const initialLoading = loading && items.length === 0;
  const loadingMore = loading && items.length > 0;

  useEffect(() => {
    if (!hasMore) {
      observerRef.current?.disconnect();
      observerRef.current = null;
      return;
    }

    let cancelled = false;

    const attachObserver = () => {
      if (cancelled) return;

      const element = sentinelRef.current;
      if (!element) {
        requestAnimationFrame(attachObserver);
        return;
      }

      observerRef.current?.disconnect();

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting || loadingRef.current || !hasMoreRef.current) {
            return;
          }

          void loadNextPageRef.current();
        },
        {
          root: null,
          rootMargin: getCatalogObserverRootMargin(window.innerHeight),
          threshold: 0,
        },
      );

      observerRef.current.observe(element);
    };

    attachObserver();

    const onResize = () => attachObserver();
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      cancelled = true;
      observerRef.current?.disconnect();
      observerRef.current = null;
      window.removeEventListener("resize", onResize);
    };
  // locale is intentionally included: after a language switch the sentinel may
  // already be in the viewport, so the IO would never fire without a re-attach.
  // Re-attaching causes the browser to fire the callback for any already-visible
  // element, resuming pagination without requiring a scroll.
  }, [hasMore, activeCategoryId, locale]);

  return {
    items,
    loading,
    initialLoading,
    loadingMore,
    hasMore,
    loadMore: loadNextPage,
    sentinelRef,
  };
}
