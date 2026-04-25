"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import { usePathname, useRouter } from "@/i18n/navigation";
import { FaGlobe } from "react-icons/fa";

export default function HeaderO() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const siteName = menuInfo?.name?.trim() || "Oceanic";
  const logoLetter = siteName.charAt(0).toUpperCase();

  const toggleLanguage = () => {
    const newLocale = locale === "ar" ? "en" : "ar";
    router.push(pathname, { locale: newLocale });
  };

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 px-4 py-4 transition-[background,box-shadow,border-color,backdrop-filter] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        scrolled
          ? "bg-[#004861]/85 backdrop-blur-md border-b border-white/10 shadow-lg"
          : "bg-gradient-to-b from-black/50 via-black/20 to-transparent"
      }`}
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <motion.div
          className="flex items-center gap-3 cursor-pointer"
          whileHover={{
            scale: 1.02,
            transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
          }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.3)] overflow-hidden border border-white/20">
            {menuInfo?.logo ? (
              <img
                src={menuInfo.logo}
                alt={siteName}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-white font-bold text-xl tracking-tighter">
                {logoLetter}
              </span>
            )}
            <div className="absolute inset-0 rounded-full border border-white/20 animate-pulse pointer-events-none" />
          </div>

          <h1 className="text-base sm:text-xl font-bold text-white font-display tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] truncate max-w-[55vw] sm:max-w-none">
            {siteName}
          </h1>
        </motion.div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/30
                       bg-white/15 text-white backdrop-blur-md hover:bg-white/25
                       transition-[background,transform,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] text-sm font-bold shadow-md
                       drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
            aria-label="Switch language"
          >
            <FaGlobe
              className={`w-4 h-4 transition-transform ${locale === "ar" ? "rotate-180" : ""}`}
            />
            <span className="tracking-widest">
              {locale === "ar" ? "EN" : "AR"}
            </span>
          </button>
        </div>
      </div>
    </motion.header>
  );
}
