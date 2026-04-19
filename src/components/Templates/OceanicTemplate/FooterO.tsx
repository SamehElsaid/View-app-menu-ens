"use client";

import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { useAppSelector } from '@/store/hooks';
import Image from 'next/image';

const Footer = () => {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);

  return (
    <footer className="relative pt-24 pb-8 px-4 overflow-hidden bg-gradient-to-b from-[#001a23] via-[#000d14] to-[#00060a]">
      <div className="absolute top-0 left-0 right-0 h-24 pointer-events-none overflow-hidden">
        <svg
          className="absolute top-0 w-full h-full opacity-60 animate-wave"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            fill="#fdfdfd"
            fillOpacity="0.35"
            d="M0,40 C360,110 720,0 1080,55 C1260,80 1350,50 1440,40 L1440,0 L0,0 Z"
          />
        </svg>
        <svg
          className="absolute top-0 w-full h-full"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            fill="#fdfdfd"
            d="M0,20 C240,90 720,-10 1080,40 C1260,65 1350,35 1440,25 L1440,0 L0,0 Z"
          />
        </svg>
      </div>

      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-cyan-500/10 blur-[160px]" />
        <div className="absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full bg-sky-600/10 blur-[140px]" />
        <div className="absolute -top-16 -right-16 w-[360px] h-[360px] rounded-full bg-teal-400/10 blur-[140px]" />
      </div>

      {/* Floating bubbles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="absolute top-16 left-[14%] w-2 h-2 rounded-full bg-cyan-300/50 shadow-[0_0_14px_rgba(34,211,238,0.6)] animate-pulse" />
        <span className="absolute top-24 right-[18%] w-1.5 h-1.5 rounded-full bg-cyan-200/40 shadow-[0_0_10px_rgba(165,243,252,0.6)] animate-pulse [animation-delay:.6s]" />
        <span className="absolute bottom-28 left-[22%] w-3 h-3 rounded-full bg-sky-300/40 shadow-[0_0_18px_rgba(125,211,252,0.6)] animate-pulse [animation-delay:1.2s]" />
        <span className="absolute bottom-20 right-[14%] w-2 h-2 rounded-full bg-teal-300/40 shadow-[0_0_14px_rgba(94,234,212,0.6)] animate-pulse [animation-delay:1.8s]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-cyan-400/40 blur-xl" />
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.3)] overflow-hidden border border-white/20">
                {menuInfo?.logo ? (
                  <Image
                    src={menuInfo.logo}
                    alt={menuInfo?.name || ''}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <span className="text-cyan-700 font-bold text-xl tracking-tighter">
                    {menuInfo?.name?.substring(0, 1) || 'O'}
                  </span>
                )}
                <div className="absolute inset-0 rounded-full border border-white/20 animate-pulse pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col items-start">
              <h3 className="text-xl font-bold text-white font-display tracking-tight leading-tight">
                {menuInfo?.name || 'Oceanic'}
              </h3>
              {menuInfo?.description && (
                <span className="text-[10px] uppercase tracking-[0.35em] text-cyan-400/70 mt-0.5">
                  {menuInfo.description}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p
              dir={isAr ? "rtl" : "ltr"}
              className="text-white/35 text-xs font-arabic tracking-wide text-center md:text-start"
            >
              {isAr ? (
                <>
                  {'جميع الحقوق محفوظة © '}
                  {new Date().getFullYear()} {menuInfo?.name}
                </>
              ) : (
                <>
                  © {new Date().getFullYear()} {menuInfo?.name}. All rights reserved.
                </>
              )}
            </p>

            <div
              dir={isAr ? "rtl" : "ltr"}
              className={`flex items-center gap-2 text-[10px] tracking-[0.3em] text-white/25 ${
                isAr ? "font-arabic" : "uppercase"
              }`}
            >
              <span>
                {isAr ? "تصميم وتطوير بواسطة" : "Designed & Developed by"}
              </span>
              <a
                href="https://www.facebook.com/ENSEGYPTEG"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400/70 hover:text-cyan-300 transition-colors font-bold uppercase"
              >
                ENS
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
