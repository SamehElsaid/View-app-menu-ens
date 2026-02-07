
export interface MenuItem {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    categoryId?: number;
    categoryName?: string;
    originalPrice?: number;
    discountPercent?: number;
}