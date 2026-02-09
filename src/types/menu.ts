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
  slug: string;
  description: string;
  logo: string | null;
  footerLogo: string | null;
  theme: string;
  locale: string;
  currency: string;
  isActive: boolean;
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

export interface MenuItem {
  id: number;
  name: string;
  nameAr: string;
  nameEn: string;
  description: string | null;
  descriptionAr: string | null;
  descriptionEn: string | null;
  price: number;
  image: string;
  category: string;
  categoryId: number;
  categoryName: string;
  categoryNameAr: string;
  categoryNameEn: string;
  originalPrice: number | null;
  discountPercent: number | null;
  available: boolean;
  sortOrder: number;
}

export interface Category {
  id: number;
  name: string;
  nameAr?: string;
  nameEn?: string;
  image?: string | null;
  sortOrder?: number;
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
