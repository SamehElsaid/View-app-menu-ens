import type { Ad } from "@/types/Ad";
import type {
  Category,
  Delivery,
  MenuCustomizations,
  MenuInfo,
  MenuItem,
} from "@/types/menu";

export type MenuBootstrapRating = {
  average?: number;
  total?: number;
};

export type MenuBootstrapResponse = {
  locale?: string;
  menu: MenuInfo;
  items: MenuItem[];
  categories: Category[];
  customizations?: MenuCustomizations | null;
  delivery?: Delivery | null;
  ads?: Ad[];
  totalItems?: number;
  branches?: unknown[];
  rating?: MenuBootstrapRating | null;
};

export type MenuBootstrapApiEnvelope = {
  success?: boolean;
  data?: MenuBootstrapResponse;
};
