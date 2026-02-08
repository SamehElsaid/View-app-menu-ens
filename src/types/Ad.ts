// Ad interface based on the JSON structure
export interface Ad {
  id: number;
  title: string;
  titleAr: string;
  content: string;
  contentAr: string;
  imageUrl: string;
  linkUrl?: string;
  position: string;
  displayOrder: number;
}

export interface AdVBannerProps {
  ads: Ad[] | Record<string, unknown>[];
}
