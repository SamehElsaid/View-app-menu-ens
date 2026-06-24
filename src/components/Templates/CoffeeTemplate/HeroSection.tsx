import { useLocale } from "next-intl";

interface HeroSectionProps {
  menuName?: string;
  menuDescription?: string;
}

const HeroSection = ({ menuName, menuDescription }: HeroSectionProps) => {
  const locale = useLocale();

  return (
    <section className="pt-32 pb-16 text-center">
      <div className="container mx-auto w-full min-w-0 px-4 sm:px-6">
        <h1 className="font-body !text-3xl md:!text-5xl font-bold mt-4 mb-6 text-[#F2B705] text-balance wrap-break-word">
          {menuName || (locale === "ar" ? "قائمتنا" : "Our Menu")}
        </h1>
        <p className="w-full max-w-2xl mx-auto text-[#B6AA99] text-base md:text-base leading-relaxed text-balance wrap-break-word">
          {menuDescription ||
            (locale === "ar"
              ? "اكتشف مجموعتنا المنتقاة بعناية من الكوكتيلات الحرفية والنبيذ الفاخر والمشروبات الروحية المميزة. كل مشروب يروي قصة."
              : "Discover our carefully curated selection of handcrafted cocktails, fine wines, and premium spirits. Each drink tells a story.")}
        </p>
        <div className="flex items-center justify-center gap-4 mt-8">
          <div className="w-16 h-px bg-[#F2B705]/50" />
          <span className="text-[#F2B705] text-lg md:text-xl">✦</span>
          <div className="w-16 h-px bg-[#F2B705]/50" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
