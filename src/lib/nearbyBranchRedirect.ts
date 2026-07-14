import { axiosGet } from "@/shared/axiosCall";
import {
  readCurrentMenuSlugFromClient,
  redirectToMenuSlug,
} from "@/lib/menuBranchRedirect";
import { hasTableSessionInSearch } from "@/lib/menuTable";

type NearbyBranchResponse = {
  success?: boolean;
  data?: {
    currentSlug: string;
    redirect: { menuId: number; slug: string; distanceKm: number } | null;
  };
};

export type NearbyBranchLookupResult = {
  redirectSlug: string | null;
  currentSlug: string;
};

/** Ask API which group branch is closest to the user's coordinates. */
export async function fetchNearbyBranchRedirect(
  menuSlug: string,
  lat: number,
  lng: number,
  locale: string,
): Promise<NearbyBranchLookupResult | null> {
  const res = await axiosGet<NearbyBranchResponse>(
    `/public/menu/${encodeURIComponent(menuSlug)}/nearby-branch`,
    locale,
    undefined,
    { lat, lng },
    true,
  );

  if (!res.status || !res.data?.success) return null;

  const currentSlug =
    res.data.data?.currentSlug?.trim() ||
    readCurrentMenuSlugFromClient() ||
    menuSlug;
  const redirectSlug = res.data.data?.redirect?.slug?.trim() || null;

  return { redirectSlug, currentSlug };
}

export type BranchRedirectOutcome = "redirecting" | "same_menu" | "failed";

/** Redirect to a closer group branch when needed. Returns whether navigation started. */
export async function tryRedirectToNearestBranch(options: {
  menuSlug: string;
  lat: number;
  lng: number;
  locale: string;
  pathname: string;
  search: string;
}): Promise<BranchRedirectOutcome> {
  const { menuSlug, lat, lng, locale, pathname, search } = options;

  /** Never switch menus during a dine-in / table QR session. */
  if (hasTableSessionInSearch(search)) {
    return "same_menu";
  }

  try {
    const lookup = await fetchNearbyBranchRedirect(menuSlug, lat, lng, locale);
    if (!lookup) return "failed";

    const { redirectSlug, currentSlug } = lookup;
    if (!redirectSlug || redirectSlug === currentSlug) {
      return "same_menu";
    }

    redirectToMenuSlug(redirectSlug, pathname, search);
    return "redirecting";
  } catch {
    return "failed";
  }
}
