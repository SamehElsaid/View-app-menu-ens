"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { LanguageToggle } from "../Default/LanguageToggle";
import Link from "next/link";
import LoadImage from "@/components/ImageLoad";

interface Category {
  id?: number;
  name?: string;
  nameAr?: string;
}

interface NavbarProps {
  menuName?: string;
  menuLogo?: string;
  categories?: Category[];
  whatsapp?: string;
}

const Navbar = ({ menuName, menuLogo, whatsapp }: NavbarProps) => {
  const t = useTranslations("nav");
  const whatsappUrl = whatsapp
    ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`
    : null;

  return (
    <nav className="fixed top-0 w-full start-0 z-50 bg-(--bg-main)/5 backdrop-blur-xl border-b border-(--bg-main)/10">
      <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
        <div className="text-(--bg-main) font-black text-2xl tracking-tighter">
          <Link href="/" className="flex items-center gap-3 group">
            {menuLogo && (
              <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                <LoadImage
                  src={menuLogo}
                  alt={menuName || "Logo"}
                  disableLazy={true}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <span className="font-heading text-xl md:text-2xl font-semibold">
              {menuName || ""}
            </span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-sky-400">
          <Link
            href="#"
            className="text-(--bg-main) hover:text-(--bg-main)/80 transition-colors"
          >
            {t("home")}
          </Link>
          {whatsapp && (
            <a
              href={whatsappUrl || ""}
              target="_blank"
              className="text-(--bg-main) hover:text-(--bg-main)/80 transition-colors"
            >
              {t("contact")}
            </a>
          )}
        </div>
        <div className="flex  gap-2">
          <div className="bg-(--bg-main) text-white  rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-(--bg-main)/80 transition-all shadow-lg shadow-(--bg-main)/10">
            <LanguageToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
