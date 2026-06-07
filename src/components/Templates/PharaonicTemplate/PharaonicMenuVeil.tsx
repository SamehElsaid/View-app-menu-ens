"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useLocale } from "next-intl";
import { prefersReducedMotion } from "./pharaonicMystery";
import { usePharaonicTouchDevice } from "./usePharaonicTouchDevice";

type PharaonicMenuVeilProps = {
  children: ReactNode;
};

export default function PharaonicMenuVeil({ children }: PharaonicMenuVeilProps) {
  const locale = useLocale();
  const isTouch = usePharaonicTouchDevice();
  const [unveiled, setUnveiled] = useState(prefersReducedMotion());

  useEffect(() => {
    if (prefersReducedMotion()) {
      setUnveiled(true);
      return;
    }

    const section = document.getElementById("menu");
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setUnveiled(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -5% 0px" },
    );

    observer.observe(section);

    const onScroll = () => {
      if (window.scrollY > window.innerHeight * 0.35) setUnveiled(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      className={`ph-menu-veil transition-[opacity,filter,transform] duration-[1.4s] ease-out motion-reduce:transition-none ${
        unveiled ? "ph-menu-veil--open" : ""
      }`}
    >
      {!unveiled ? (
        <p
          className="pointer-events-none absolute left-1/2 top-6 z-20 -translate-x-1/2 text-center text-[10px] uppercase tracking-[0.35em] text-[#a89880]/80 motion-reduce:hidden max-md:px-4"
          aria-hidden
        >
          {isTouch
            ? locale === "ar"
              ? "اسحب للأعلى لكشف الكنوز"
              : "Swipe up to unveil treasures"
            : "· · ·"}
        </p>
      ) : null}
      {children}
    </div>
  );
}
