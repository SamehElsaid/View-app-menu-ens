export interface WorkingDay {
  open: string;
  close: string;
  closed: boolean;
}

export interface WorkingHours {
  sunday?: WorkingDay;
  monday?: WorkingDay;
  tuesday?: WorkingDay;
  wednesday?: WorkingDay;
  thursday?: WorkingDay;
  friday?: WorkingDay;
  saturday?: WorkingDay;
}

export interface MenuInfo {
  id: number;
  name: string;
  nameAr?: string | null;
  nameEn?: string | null;
  /** When API provides a distinct venue name; otherwise frontend uses `name`. */
  restaurantName?: string | null;
  slug: string;
  description: string;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  logo: string | null;
  footerLogo: string | null;
  theme: string;
  locale: string;
  currency: string;
  isActive: boolean;
  chatbotEnabled: boolean;
  wifiEnabled?: boolean;
  wifiName?: string | null;
  wifiPassword?: string | null;
  taxEnabled?: boolean;
  taxPercent?: number | null;
  serviceEnabled?: boolean;
  servicePercent?: number | null;
  ownerPlanType: string;
  phone: string | null;
  addressAr: string | null;
  addressEn: string | null;
  footerDescriptionAr: string | null;
  footerDescriptionEn: string | null;
  socialWhatsapp: string | null;
  socialFacebook: string | null;
  socialInstagram: string | null;
  socialTwitter: string | null;
  workingHours: WorkingHours | null;
  googleReviewsEnabled?: boolean;
  googleReviewsUrl?: string | null;
  googleReviewsPosition?: "top" | "bottom" | "after_order";
  googleReviewsButtonTextAr?: string | null;
  googleReviewsButtonTextEn?: string | null;
  googleReviewsShowIcon?: boolean;
  googleReviewsOpenInNewTab?: boolean;
  /** Resolved from `?table=` on public menu bootstrap */
  table?: {
    id?: number;
    tableNumber?: string | null;
    isActive?: boolean;
  } | null;
  tables?: Array<{
    id?: number;
    tableNumber?: string | null;
    isActive?: boolean;
  }>;
}

export interface MenuCustomizations {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  heroTitleAr: string;
  heroSubtitleAr: string;
  heroTitleEn: string;
  heroSubtitleEn: string;
}

export interface MenuItemSizeOption {
  nameAr: string;
  nameEn: string;
  price: number;
}

export interface MenuItemVariantOption {
  labelAr: string;
  labelEn: string;
  price: number;
}

export interface MenuItem {
  id: number;
  name: string;
  nameAr: string;
  nameEn: string;
  description: string | null;
  descriptionAr: string | null;
  descriptionEn: string | null;
  price: number;
  image: string | null;
  category: string;
  categoryId: number;
  categoryName: string;
  categoryNameAr: string;
  categoryNameEn: string;
  originalPrice: number | null;
  discountPercent: number | null;
  available: boolean;
  sortOrder: number;
  sizes?: MenuItemSizeOption[] | null;
  variants?: MenuItemVariantOption[] | null;
  allergens?: string[] | null;
  ingredients?: string[];
}

export interface Category {
  id: number;
  name: string;
  nameAr?: string;
  nameEn?: string;
  description?: string;
  descriptionAr?: string;
  image?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  itemsCount?: number;
  menuItems?: MenuItem[];
}

export interface DeliveryGovernorate {
  id: number;
  nameAr: string;
  nameEn: string;
  price: number;
  lat: number;
  lan: number;
  createdAt: string;
  updatedAt: string;
}

export type DeliveryMode = "governorates" | "distance";

export interface MenuBranch {
  id: number;
  phone?: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  deliveryBasePrice?: number | null;
  deliveryPricePerKm?: number | null;
  maxDeliveryRadiusKm?: number | null;
  name?: string | null;
  address?: string | null;
}

export interface Delivery {
  deliveryOn: boolean;
  deliveryMode?: DeliveryMode;
  deliveryWhatsAppOn?: boolean;
  deliveryPhone: string;
  phoneNumber: string;
  governorates: DeliveryGovernorate[];
}

export interface FooterProps {
  menuName: string;
  menuLogo?: string;
  footerLogo?: string;
  footerDescriptionEn?: string;
  footerDescriptionAr?: string;
  socialFacebook?: string;
  socialInstagram?: string;
  socialTwitter?: string;
  socialWhatsapp?: string;
  addressEn?: string;
  addressAr?: string;
  phone?: string;
  workingHours?: {
    sunday?: { open?: string; close?: string; closed?: boolean };
    monday?: { open?: string; close?: string; closed?: boolean };
    tuesday?: { open?: string; close?: string; closed?: boolean };
    wednesday?: { open?: string; close?: string; closed?: boolean };
    thursday?: { open?: string; close?: string; closed?: boolean };
    friday?: { open?: string; close?: string; closed?: boolean };
    saturday?: { open?: string; close?: string; closed?: boolean };
  };
}
