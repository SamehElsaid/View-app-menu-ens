import { useTranslations } from "next-intl";

interface HeroSectionProps {
  menuName?: string;
  menuDescription?: string;
}

export default function HeroSection({
  menuName,
  menuDescription,
}: HeroSectionProps) {
  const t = useTranslations("menu");

  return (
    <section className=" min-h-[60vh] py-30 relative w-full flex items-center justify-center overflow-hidden!">
      <div className="absolute inset-0 bg-linear-to-b from-(--bg-main)/10 via-white to-transparent" />

      {/* Large Decorative Circles */}
      <div className="absolute top-[-10%] end-[-5%] w-160 h-160 bg-(--bg-main)/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] end-0 w-140 h-140 bg-(--bg-main)/10 rounded-full blur-[80px]" />
      <div className="relative z-10 text-center px-4 max-w-4xl">
        <div>
          <h1 className="text-4xl md:text-6xl! font-black mb-8 tracking-tighter text-(--bg-main) leading-[1.1]">
            {menuName || t("ourMenu")} <br />{" "}
            <span className="text-(--bg-main)"></span>
          </h1>
          <div className="w-16 h-1.5 bg-(--bg-main) mx-auto mb-10 rounded-full" />
          <p className="text-(--text-muted) text-xl max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            {menuDescription || t("enjoyFood")}
          </p>
        </div>
      </div>
    </section>
  );
}
