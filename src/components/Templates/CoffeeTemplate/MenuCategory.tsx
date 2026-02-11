import { useLocale } from "next-intl";
import MenuItem from "./MenuItem";

interface MenuItemType {
  id?: number;
  name: string;
  nameAr: string;
  description: string | null;
  descriptionAr: string | null;
  price: number | string;
  tag?: string;
  tagAr?: string;
  image?: string;
  delay?: number;
  originalPrice?: number | null;
  discountPercent?: number | null;
}

interface MenuCategoryProps {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  items?: MenuItemType[];
}

const MenuCategory = ({
  title,
  titleAr,
  description,
  descriptionAr,
  items = [],
}: MenuCategoryProps) => {
  const locale = useLocale();

  return (
    <section className="py-12">
      <div className="text-center mb-10">
        <h2 className="text-4xl md:text-5xl font-semibold text-[#F2B705] mb-3">
          {locale === "ar" ? titleAr : title}
        </h2>
        <p className="text-[#B6AA99] max-w-xl mx-auto">
          {locale === "ar" ? descriptionAr : description}
        </p>
        <div className="w-24 h-px bg-[#F2B705]/50 mx-auto mt-6" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item, index) => (
          <MenuItem
            key={item.id || item.name || index}
            {...item}
            delay={index * 100}
          />
        ))}
      </div>
    </section>
  );
};

export default MenuCategory;
