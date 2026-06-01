import { useTranslations } from "next-intl";

interface HeroSectionProps {
  menuName?: string;
  menuDescription?: string;
  compact?: boolean;
}

export default function HeroSection({
  menuName,
  menuDescription,
  compact = false,
}: HeroSectionProps) {
  const t = useTranslations("menu");

  return (
    <section className="relative w-full flex items-center justify-center overflow-hidden! min-h-[38svh] md:min-h-[60vh] py-16 md:py-30">
      <div className="absolute inset-0 bg-linear-to-b from-(--bg-main)/10 via-white to-transparent" />

      {/* Large Decorative Circles */}
      <div className="absolute top-[-10%] end-[-5%] w-160 h-160 bg-(--bg-main)/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] end-0 w-140 h-140 bg-(--bg-main)/10 rounded-full blur-[80px]" />
      <div className="relative z-10 w-full min-w-0 text-center px-4 max-w-4xl mx-auto">
        <div className="w-full min-w-0">
          <h1
            className={`font-black mb-4 md:mb-8 tracking-tighter text-(--bg-main) leading-[1.1] text-balance wrap-break-word ${
              compact
                ? "!text-3xl md:!text-5xl"
                : "text-4xl md:text-6xl!"
            }`}
          >
            {menuName || t("ourMenu")} <br />{" "}
            <span className="text-(--bg-main)"></span>
          </h1>
          <div className="w-16 h-1.5 bg-(--bg-main) mx-auto mb-6 md:mb-10 rounded-full" />
          <p
            className={`w-full max-w-2xl mx-auto text-[#2b1d58] mb-6 md:mb-12 font-medium leading-relaxed text-balance wrap-break-word ${
              compact ? "text-base md:text-base" : "text-xl"
            }`}
          >
            {menuDescription || " "}
          </p>
        </div>
      </div>
    </section>
  );
}
