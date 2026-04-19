"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import { FaChevronDown } from "react-icons/fa";
import { useLocale } from 'next-intl';
import heroBg from './hero-bg.jpg';
import { useAppSelector } from '@/store/hooks';

const HeroO = () => {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);

  const scrollToMenu = () => {
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[85svh] md:min-h-[80vh] lg:min-h-[78vh] flex items-center justify-center overflow-hidden bg-[#001a23] py-20 md:py-24">
      <div className="absolute inset-0 z-0">
        <Image
          src={heroBg}
          alt="Hero Background"
          fill
          priority
          placeholder="blur"
          sizes="100vw"
          className="object-cover object-center scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-[#001a23]" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 z-10 pointer-events-none translate-y-1">
        <svg
          className="absolute bottom-0 w-full h-full opacity-60 animate-wave"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path fill="#f5fcff" fillOpacity="0.55" d="M0,64 C480,120 960,0 1440,64 L1440,120 L0,120 Z" />
        </svg>
        <svg
          className="absolute bottom-0 w-full h-full"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path fill="#f5fcff" d="M0,96 C240,60 720,120 1440,80 L1440,120 L0,120 Z" />
        </svg>
      </div>

      <div className="relative z-20 text-center px-6 max-w-4xl mx-auto">
        <motion.p
          className={`italic block text-cyan-200/90 font-serif font-bold mt-6 text-[clamp(1.8rem,5vw,3.5rem)] leading-[1.2] drop-shadow-xl max-w-4xl mx-auto ${isAr ? 'tracking-normal' : 'uppercase tracking-[0.3em]'
            }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {isAr ? 'مرحباً بك في' : 'Welcome to'}
        </motion.p>

        <motion.h1
          className="font-display text-[clamp(2.5rem,8vw,6rem)] font-light leading-[1.05] tracking-tight mb-6 text-white"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <span className="block drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            {menuInfo?.name}
          </span>
        </motion.h1>

        {menuInfo?.description && (
          <motion.p
            className="mx-auto mb-10 max-w-2xl text-base md:text-lg lg:text-xl text-white/85 leading-relaxed italic drop-shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {menuInfo.description}
          </motion.p>
        )}

        {/* CTA Button */}
        <motion.button
          onClick={scrollToMenu}
          className="group relative inline-flex items-center gap-4 px-10 py-5 rounded-full bg-cyan-600 text-white font-bold text-xl shadow-[0_10px_30px_rgba(0,163,191,0.3)] hover:bg-cyan-500 transition-all duration-300 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] transition-none" />

          <span className="relative font-arabic tracking-wide">
            {locale === "ar" ? "استكشف قائمتنا" : "Explore Our Menu"}
          </span>
          <motion.span
            className="relative"
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <FaChevronDown className="w-4 h-4 md:w-5 md:h-5" />
          </motion.span>
        </motion.button>
      </div>
    </section>
  );
};

export default HeroO;