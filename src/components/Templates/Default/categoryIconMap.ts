export interface MenuCategoryLike {
  id: number;
  name: string;
  nameAr?: string;
  icon?: string;
  image?: string | null;
}

const categoryIcons: Record<string, string> = {
  all: "grid-line",
  appetizers: "bowl-line",
  مقبلات: "bowl-line",
  mains: "restaurant-line",
  "أطباق رئيسية": "restaurant-line",
  drinks: "cup-line",
  مشروبات: "cup-line",
  desserts: "cake-3-line",
  حلويات: "cake-3-line",
};

export function getCategoryIconName(category: MenuCategoryLike) {
  if (category?.icon === "grid-line") {
    return categoryIcons.all;
  }
  return categoryIcons[category.name.toLowerCase()] || "restaurant-line";
}
