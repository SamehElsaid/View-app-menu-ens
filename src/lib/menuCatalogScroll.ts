import {
  MENU_CATALOG_PREFETCH_MIN_PX,
  MENU_CATALOG_PREFETCH_VIEWPORT_MULTIPLIER,
} from "@/types/menuCatalog";

export function getCatalogPrefetchPx(viewportHeight: number): number {
  return Math.max(
    MENU_CATALOG_PREFETCH_MIN_PX,
    Math.round(viewportHeight * MENU_CATALOG_PREFETCH_VIEWPORT_MULTIPLIER),
  );
}

export function getCatalogObserverRootMargin(viewportHeight: number): string {
  return `0px 0px ${getCatalogPrefetchPx(viewportHeight)}px 0px`;
}

export function isElementInCatalogPrefetchZone(
  element: HTMLElement,
  viewportHeight = window.innerHeight,
): boolean {
  const prefetchPx = getCatalogPrefetchPx(viewportHeight);
  const rect = element.getBoundingClientRect();

  return rect.top <= viewportHeight + prefetchPx;
}
