import { axiosGet } from "@/shared/axiosCall";

export type BranchDeliveryQuote = {
  inRange: boolean;
  distanceKm: number;
  deliveryFee: number | null;
  maxDeliveryRadiusKm: number | null;
};

type QuoteResponse = {
  success?: boolean;
  data?: BranchDeliveryQuote;
};

export async function fetchBranchDeliveryQuote(
  menuSlug: string,
  branchId: number,
  lat: number,
  lng: number,
  locale: string,
): Promise<BranchDeliveryQuote | null> {
  const res = await axiosGet<QuoteResponse>(
    `/public/menu/${encodeURIComponent(menuSlug)}/branches/${branchId}/delivery-quote`,
    locale,
    undefined,
    { lat, lng },
    true,
  );

  if (!res.status || !res.data?.success || !res.data.data) return null;
  return res.data.data;
}
