"use client"

import { useLocale } from "next-intl"

export default function HeroN() {
  const locale = useLocale()

  return (
    <section className="flex flex-col items-center justify-center text-center px-8 pt-50 pb-16 relative">
      <p className="font-body text-[0.7rem] tracking-[0.5em] uppercase text-cyan mb-6 opacity-0 animate-fade-up [animation-delay:0.2s]">
        {locale === "ar" ? "— تجربة طعام استثنائية —" : "— An Extraordinary Dining Experience —"}
      </p>

      <h1 className="font-display text-[clamp(2.5rem,7vw,5rem)] font-light leading-none tracking-tight mb-4 opacity-0 animate-fade-up [animation-delay:0.4s]">
        <span>{locale === "ar" ? "حيث يلتقي" : "Where Art"}</span>
        <em className="italic block text-lavender">{locale === "ar" ? "الفن بالنكهة" : "Meets Flavor"}</em>
      </h1>

      <p className="font-display italic text-lg text-text-secondary max-w-[500px] leading-relaxed mb-12 opacity-0 animate-fade-up [animation-delay:0.6s]">
        {locale === "ar" ? "كل طبق رحلة، كل لقمة ذاكرة. نقدم لكم تجربة مطبخ حديثة تمزج بين الموروث الكلاسيكي والإبداع المعاصر." : "Every dish is a journey, every bite a memory. We present a modern culinary experience blending classical heritage with contemporary creativity."}
      </p>

      <div className="w-20 h-px mb-12 opacity-0 animate-fade-up [animation-delay:0.8s] bg-linear-to-r from-transparent via-violet to-transparent" />

      <a
        href="#menu"
        className="font-body inline-flex items-center gap-3 text-white text-sm tracking-[0.2em] uppercase no-underline py-4 px-10 rounded-[3px] cursor-pointer transition-all duration-300
          bg-linear-to-br from-violet to-cyan shadow-[0_0_30px_rgba(124,58,237,0.3)]
          hover:shadow-[0_0_50px_rgba(124,58,237,0.5),0_0_20px_rgba(6,182,212,0.3)] hover:-translate-y-0.5 active:scale-[0.97]
          opacity-0 animate-fade-up [animation-delay:1s]"
      >
        <span>{locale === "ar" ? "استكشف القائمة" : "Explore Menu"}</span>
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </a>
    </section>
  );
}
