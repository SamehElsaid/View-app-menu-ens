"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX } from "react-icons/fi";
import { useLocale } from 'next-intl';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar = ({ value, onChange }: SearchBarProps) => {
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <motion.div
      className="relative max-w-lg mx-auto px-2"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative group">
        <div className={`absolute ${isAr ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 z-10 transition-colors duration-300`}>
          <FiSearch className={`w-5 h-5 ${value ? 'text-cyan-600' : 'text-slate-400'} group-focus-within:text-cyan-500`} />
        </div>

        <input
          type="text"
          placeholder={isAr ? "ابحث عن طبقك المفضل..." : "Search for your favorite dish..."}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            w-full h-14 rounded-full
            bg-white/40 backdrop-blur-xl
            border-2 border-white/50
            ${isAr ? 'pr-14 pl-12' : 'pl-14 pr-12'}
            text-lg text-[#001a23] font-medium
            placeholder:text-slate-400 placeholder:italic
            shadow-[0_8px_30px_rgb(0,0,0,0.04)]
            focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500/30
            focus:bg-white/80 transition-all duration-300
            font-arabic
          `}
        />

        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5, x: isAr ? 10 : -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              onClick={() => onChange('')}
              className={`
                absolute ${isAr ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2
                w-8 h-8 rounded-full bg-slate-200/50 backdrop-blur-sm
                flex items-center justify-center hover:bg-red-50 hover:text-red-500
                transition-all duration-200 group
              `}
            >
              <FiX className="w-4 h-4 transition-transform group-hover:rotate-90" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent blur-sm" />
    </motion.div>
  );
};

export default SearchBar;