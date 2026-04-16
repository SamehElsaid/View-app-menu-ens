"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import Image from "next/image";
import Link from "next/link";
import { FiLayers, FiX } from "react-icons/fi";

interface Category {
  id?: number;
  title: string;
  titleAr: string;
}

interface NavbarProps {
  menuName?: string;
  menuLogo?: string;
  categories?: Category[];
}

const Navbar = ({ menuName, menuLogo, categories = [] }: NavbarProps) => {
  const [fabCategoriesOpen, setFabCategoriesOpen] = useState(false);
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const navLinks = [
    { en: "Menu", ar: "القائمة" },
    { en: "Contact", ar: "تواصل معنا" },
  ];

  useEffect(() => {
    if (!fabCategoriesOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFabCategoriesOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [fabCategoriesOpen]);

  const scrollToMenu = () => {
    const menuSection = document.getElementById("menu");
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToCategory = (categoryId?: number, categoryTitle?: string) => {
    let elementId: string;
    if (categoryId) {
      elementId = `category-${categoryId}`;
    } else if (categoryTitle) {
      elementId = `category-${categoryTitle
        .replace(/\s+/g, "-")
        .toLowerCase()}`;
    } else {
      return;
    }

    const categoryElement = document.getElementById(elementId);
    if (categoryElement) {
      categoryElement.scrollIntoView({ behavior: "smooth", block: "start" });
      setFabCategoriesOpen(false);
    }
  };

  const toggleLanguage = () => {
    const newLocale = locale === "ar" ? "en" : "ar";
    router.push(pathname, { locale: newLocale });
  };

  const categoriesLabel = locale === "ar" ? "التصنيفات" : "Categories";
  const isAr = locale === "ar";
  const fabSideClass = isAr ? "right-6 md:right-8" : "left-6 md:left-8";
  const panelSideClass = isAr
    ? "right-0 border-l border-[#3B332E]"
    : "left-0 border-r border-[#3B332E]";

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#17120F]/95 backdrop-blur-md border-b border-[#3B332E]">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              {menuLogo && (
                <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                  <Image
                    src={menuLogo}
                    alt={menuName || "Logo"}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <span className="font-heading text-xl md:text-2xl font-semibold text-[#F2B705]">
                {menuName ||
                  (locale === "ar" ? "البلوط الذهبي" : "The Golden Oak")}
              </span>
            </Link>

            <div className="flex flex-wrap items-center justify-end gap-4 md:gap-8 max-w-[min(100%,calc(100vw-12rem))]">
              {navLinks.map((link) => {
                if (link.en === "Menu") {
                  return (
                    <button
                      key={link.en}
                      type="button"
                      onClick={scrollToMenu}
                      className="hidden md:block text-[#B6AA99] hover:text-[#F2B705] transition-colors duration-300 text-sm font-medium tracking-wide uppercase"
                    >
                      {locale === "ar" ? link.ar : link.en}
                    </button>
                  );
                }
                return (
                  <a
                    key={link.en}
                    href={`#${link.en.toLowerCase()}`}
                    className="hidden md:block text-[#B6AA99] hover:text-[#F2B705] transition-colors duration-300 text-sm font-medium tracking-wide uppercase"
                  >
                    {locale === "ar" ? link.ar : link.en}
                  </a>
                );
              })}

              <button
                type="button"
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#3B332E] hover:bg-[#F2B705]/20 text-[#B6AA99] hover:text-[#F2B705] transition-all duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                  />
                </svg>
                <span className="text-sm font-medium">
                  {locale === "ar" ? "EN" : "عربي"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {categories.length > 0 && !fabCategoriesOpen && (
        <button
          type="button"
          onClick={() => setFabCategoriesOpen(true)}
          className={`fixed bottom-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#F2B705] text-[#17120F] shadow-[0_8px_32px_-4px_rgba(242,183,5,0.45)] transition hover:scale-105 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705] focus-visible:ring-offset-2 focus-visible:ring-offset-[#17120F] md:bottom-8 md:h-16 md:w-16 ${fabSideClass}`}
          aria-label={categoriesLabel}
          aria-expanded="false"
        >
          <FiLayers className="h-7 w-7 md:h-8 md:w-8" strokeWidth={1.75} />
        </button>
      )}

      {fabCategoriesOpen && categories.length > 0 && (
        <div
          className="fixed inset-0 z-100"
          role="dialog"
          aria-modal="true"
          aria-labelledby="coffee-categories-panel-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
            onClick={() => setFabCategoriesOpen(false)}
            aria-label={locale === "ar" ? "إغلاق" : "Close overlay"}
          />
          <aside
            className={`absolute top-0 flex h-full w-full max-w-sm flex-col bg-[#221D1A] shadow-2xl ${panelSideClass}`}
          >
            <div className="flex items-center justify-between border-b border-[#3B332E] px-5 py-4">
              <h2
                id="coffee-categories-panel-title"
                className="font-heading text-lg font-semibold text-[#F2B705]"
              >
                {categoriesLabel}
              </h2>
              <button
                type="button"
                onClick={() => setFabCategoriesOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-[#B6AA99] transition hover:bg-[#3B332E] hover:text-[#F2B705]"
                aria-label={locale === "ar" ? "إغلاق" : "Close"}
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <ul className="flex flex-col gap-1">
                {categories.map((category) => (
                  <li key={category.id ?? category.title}>
                    <button
                      type="button"
                      onClick={() =>
                        scrollToCategory(category.id, category.title)
                      }
                      className="w-full rounded-lg px-4 py-3.5 text-start text-[0.9375rem] font-medium text-[#B6AA99] transition hover:bg-[#F2B705]/10 hover:text-[#F2B705]"
                    >
                      {locale === "ar" ? category.titleAr : category.title}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
};

export default Navbar;
