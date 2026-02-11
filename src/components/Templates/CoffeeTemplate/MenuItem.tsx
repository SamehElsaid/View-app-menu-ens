import LoadImage from "@/components/ImageLoad";
import { useLocale } from "next-intl";

interface MenuItemProps {
  id?: number;
  name: string;
  nameAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  price: number | string;
  tag?: string;
  tagAr?: string;
  image?: string;
  delay?: number;
  originalPrice?: number | null;
  discountPercent?: number | null;
}

const MenuItem = ({
  name,
  nameAr,
  description,
  descriptionAr,
  price,
  tag,
  tagAr,
  image,
  delay = 0,
  originalPrice,
  discountPercent,
}: MenuItemProps) => {
  const locale = useLocale();
  const displayNameAr = nameAr || name;
  const displayDescription = description || "";
  const displayDescriptionAr = descriptionAr || displayDescription;
  const normalizedPrice =
    typeof price === "number" ? price.toString() : (price || "");

  // Calculate discounted price if discount exists
  const displayPrice =
    originalPrice && discountPercent
      ? `${normalizedPrice} (${discountPercent}% off)`
      : normalizedPrice;

  return (
    <div
      className="group p-4 bg-[#221D1A] rounded-lg border border-[#3B332E] hover:border-[#F2B705]/40 transition-all duration-300 animate-fade-in flex gap-4 hover:[box-shadow:0_0_40px_hsl(38_92%_50%/0.15)]"
      style={{
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Image */}
      {image && (
        <div className="shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden">
          <LoadImage
            src={image}
            alt={locale === "ar" ? displayNameAr : name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            disableLazy={false}
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h3 className="font-heading text-lg md:text-xl font-medium text-[#F4EEE7] group-hover:text-[#F2B705] transition-colors">
              {locale === "ar" ? displayNameAr : name}
            </h3>
            {(tag || tagAr) && (
              <span className="px-2 py-1 text-xs font-medium bg-[#F2B705]/20 text-[#F2B705] rounded">
                {locale === "ar" ? tagAr : tag}
              </span>
            )}
          </div>
          {(displayDescription || displayDescriptionAr) && (
            <p className="text-[#B6AA99] text-sm leading-relaxed">
              {locale === "ar" ? displayDescriptionAr : displayDescription}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end shrink-0">
          {originalPrice &&
            originalPrice >
              parseFloat(normalizedPrice.replace(/[^0-9.]/g, "") || "0") && (
              <span className="text-sm text-[#B6AA99] line-through">
                {originalPrice}
              </span>
            )}
          <span className="font-heading text-xl md:text-2xl font-semibold text-[#F2B705]">
            {displayPrice}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MenuItem;
