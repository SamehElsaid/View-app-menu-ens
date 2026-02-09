import { useLocale } from "next-intl";
import { Icon } from "../components/Icon";
import LoadImage from "@/components/ImageLoad";

interface Category {
  id?: number;
  name?: string;
  nameAr?: string;
  image?: string;
}

interface MenuCategoryButtonProps {
  category: Category;
  isActive: boolean;
  onClick: () => void;
}

export default function MenuCategoryButton({
  category,
  isActive,
  onClick,
}: MenuCategoryButtonProps) {
  const locale = useLocale();

  return (
    <button
      className={`px-10 h-full! flex items-center relative gap-2 py-2 rounded-2xl text-sm font-black transition-all tracking-widest uppercase ${
        isActive
          ? "bg-(--bg-main) text-white  shadow-(--bg-main) scale-105"
          : "bg-(--bg-main)/10 text-(--bg-main) hover:text-(--bg-main)/80 border border-(--bg-main)/20"
      }`}
      onClick={onClick}
    >
      {category.name === "View All" ? (
        <Icon name="grid-line" className="text-2xl" />
      ) : (
        <></>
      )}
      {category.image && (
        <LoadImage
          src={category.image}
          alt={category.name || ""}
          disableLazy={false}
          fill
          className="w-10 border-4 border-white h-10 rounded-full object-cover"
        />
      )}
      {locale === "ar" ? category.nameAr || category.name : category.name}
    </button>
  );
}
