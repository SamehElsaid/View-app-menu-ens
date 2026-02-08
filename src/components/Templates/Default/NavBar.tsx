"use client";
import React from "react";
import { Link } from "@/i18n/navigation";
import { MdRestaurant } from "react-icons/md";
import { FiHome, FiPhoneCall } from "react-icons/fi";
import { LanguageToggle } from "./LanguageToggle";
import { useTranslations } from "next-intl";

function NavBar({
  logo,
  menuName,
  whatsappUrl,
}: {
  logo: string | null;
  menuName: string | null;
  whatsappUrl: string | null;
  whatsapp: string | null;
}) {
  const t = useTranslations("nav");

  return (
    <nav className="fixed left-0 right-0 top-0 z-50  w-full flex justify-center items-center py-6 ">
      <div className="w-[90%] max-w-4xl">
        {" "}
        <div className="bg-white/80 backdrop-blur-xl border border-purple-100 px-8 py-4 rounded-full flex items-center justify-between shadow-lg shadow-purple-500/5">
          <div className="flex items-center gap-2 text-(--bg-main) ">
            <div className="text-2xl font-black tracking-tighter flex items-center gap-2">
              {logo ? (
                <img
                  src={logo}
                  alt={menuName || ""}
                  className="relative w-10 h-10 rounded-full object-contain transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <>
                  <MdRestaurant className="relative text-3xl transition-transform duration-300 group-hover:scale-110" />
                  <span className="text-2xl font-black tracking-tighter">
                    {menuName}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-zinc-600">
            <Link
              href="/"
              className="hover:text-(--bg-main) transition-colors flex items-center gap-1"
            >
              <FiHome className="text-lg" />
              <span>{t("home")}</span>
            </Link>

            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-(--bg-main) transition-colors flex items-center gap-1"
              >
                <FiPhoneCall className="text-lg" />
                <span>{t("contact")}</span>
              </a>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-(--bg-main) text-white  rounded-full font-bold text-sm shadow-md shadow-purple-200">
              <LanguageToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
