import { useLocale } from "next-intl";

interface HeroSectionProps {
  menuName?: string;
  menuDescription?: string;
}

const HeroSection = ({ menuName, menuDescription }: HeroSectionProps) => {
  const locale = useLocale();

  return (
    <section className="pt-32 pb-16 text-center">
      <div className="container mx-auto px-6">
        <h1 className="font-heading text-5xl md:text-7xl font-bold mt-4 mb-6 text-[#F2B705]">
          {menuName || (locale === "ar" ? "قائمتنا" : "Our Menu")}
        </h1>
        <p className="text-[#B6AA99] max-w-2xl mx-auto text-lg leading-relaxed">
          {menuDescription ||
            (locale === "ar"
              ? "اكتشف مجموعتنا المنتقاة بعناية من الكوكتيلات الحرفية والنبيذ الفاخر والمشروبات الروحية المميزة. كل مشروب يروي قصة."
              : "Discover our carefully curated selection of handcrafted cocktails, fine wines, and premium spirits. Each drink tells a story.")}
        </p>
        <div className="flex items-center justify-center gap-4 mt-8">
          <div className="w-16 h-px bg-[#F2B705]/50" />
          <span className="text-[#F2B705] text-2xl">✦</span>
          <div className="w-16 h-px bg-[#F2B705]/50" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
