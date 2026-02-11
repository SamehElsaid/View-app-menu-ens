import { useState } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import Image from "next/image";
import Link from "next/link";

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
  const [isOpen, setIsOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const navLinks = [
    { en: "Menu", ar: "القائمة" },
    { en: "Contact", ar: "تواصل معنا" },
  ];

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
      setIsCategoriesOpen(false);
      setIsOpen(false);
    }
  };

  const toggleLanguage = () => {
    const newLocale = locale === "ar" ? "en" : "ar";
    router.push(pathname, { locale: newLocale });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#17120F]/95 backdrop-blur-md border-b border-[#3B332E]">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              if (link.en === "Menu") {
                return (
                  <button
                    key={link.en}
                    onClick={scrollToMenu}
                    className="text-[#B6AA99] hover:text-[#F2B705] transition-colors duration-300 text-sm font-medium tracking-wide uppercase"
                  >
                    {locale === "ar" ? link.ar : link.en}
                  </button>
                );
              }
              return (
                <a
                  key={link.en}
                  href={`#${link.en.toLowerCase()}`}
                  className="text-[#B6AA99] hover:text-[#F2B705] transition-colors duration-300 text-sm font-medium tracking-wide uppercase"
                >
                  {locale === "ar" ? link.ar : link.en}
                </a>
              );
            })}

            {/* Categories Dropdown */}
            {categories.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  onBlur={() =>
                    setTimeout(() => setIsCategoriesOpen(false), 200)
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#3B332E] hover:bg-[#F2B705]/20 text-[#B6AA99] hover:text-[#F2B705] transition-all duration-300 text-sm font-medium tracking-wide uppercase"
                >
                  <span>{locale === "ar" ? "التصنيفات" : "Categories"}</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${
                      isCategoriesOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isCategoriesOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-[#3B332E] rounded-lg shadow-xl border border-[#17120F] overflow-hidden z-50">
                    <div className="py-2">
                      {categories.map((category) => (
                        <button
                          key={category.id || category.title}
                          onClick={() =>
                            scrollToCategory(category.id, category.title)
                          }
                          className="w-full px-4 py-2 text-left text-[#B6AA99] hover:bg-[#F2B705]/20 hover:text-[#F2B705] transition-colors duration-200 text-sm"
                        >
                          {locale === "ar" ? category.titleAr : category.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Language Toggle Button */}
            <button
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

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#3B332E] text-[#B6AA99] hover:text-[#F2B705] transition-colors"
            >
              <span className="text-sm font-medium">
                {locale === "ar" ? "EN" : "ع"}
              </span>
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#B6AA99] hover:text-[#F2B705] p-2 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-[#3B332E] pt-4 animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => {
                if (link.en === "Menu") {
                  return (
                    <button
                      key={link.en}
                      onClick={() => {
                        scrollToMenu();
                        setIsOpen(false);
                      }}
                      className="text-left text-[#B6AA99] hover:text-[#F2B705] transition-colors duration-300 text-sm font-medium tracking-wide uppercase"
                    >
                      {locale === "ar" ? link.ar : link.en}
                    </button>
                  );
                }
                return (
                  <a
                    key={link.en}
                    href={`#${link.en.toLowerCase()}`}
                    className="text-[#B6AA99] hover:text-[#F2B705] transition-colors duration-300 text-sm font-medium tracking-wide uppercase"
                    onClick={() => setIsOpen(false)}
                  >
                    {locale === "ar" ? link.ar : link.en}
                  </a>
                );
              })}

              {/* Categories Dropdown for Mobile */}
              {categories.length > 0 && (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                    className="flex items-center justify-between text-[#B6AA99] hover:text-[#F2B705] transition-colors duration-300 text-sm font-medium tracking-wide uppercase"
                  >
                    <span>{locale === "ar" ? "التصنيفات" : "Categories"}</span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-300 ${
                        isCategoriesOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {isCategoriesOpen && (
                    <div className="pl-4 flex flex-col gap-2 border-l-2 border-[#3B332E]">
                      {categories.map((category) => (
                        <button
                          key={category.id || category.title}
                          onClick={() =>
                            scrollToCategory(category.id, category.title)
                          }
                          className="text-left text-[#B6AA99] hover:text-[#F2B705] transition-colors duration-200 text-sm"
                        >
                          {locale === "ar" ? category.titleAr : category.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
