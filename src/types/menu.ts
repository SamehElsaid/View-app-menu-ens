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
