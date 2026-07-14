"use client";

import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "@/i18n/navigation";
import LoadImage from "@/components/ImageLoad";
import Link from "next/link";
import MenuWifiDropdown from "@/components/Global/MenuWifiDropdown";
import CallWaiterButton from "@/components/Global/CallWaiterButton";
import RateMenuButton from "@/components/Global/RateMenuButton";

interface NavbarProps {
  menuName?: string;
  menuLogo?: string;
}

const Navbar = ({ menuName, menuLogo }: NavbarProps) => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  const toggleLanguage = () => {
    const newLocale = locale === "ar" ? "en" : "ar";
    const query = searchParams.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`, {
      locale: newLocale,
    });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#17120F]/95 backdrop-blur-md border-b border-[#3B332E]">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            {menuLogo && (
              <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                <LoadImage
                  src={menuLogo}
                  alt={menuName || "Logo"}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <span className="font-body text-xl md:text-lg font-semibold text-[#F2B705]">
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
                    className="hidden md:block text-[#B6AA99] hover:text-[#F2B705] transition-colors duration-300 text-base font-medium tracking-wide uppercase"
                  >
                    {locale === "ar" ? link.ar : link.en}
                  </button>
                );
              }
              return (
                <a
                  key={link.en}
                  href={`#${link.en.toLowerCase()}`}
                  className="hidden md:block text-[#B6AA99] hover:text-[#F2B705] transition-colors duration-300 text-base font-medium tracking-wide uppercase"
                >
                  {locale === "ar" ? link.ar : link.en}
                </a>
              );
            })}

            <RateMenuButton
              buttonClassName="bg-[#3B332E] text-[#B6AA99] hover:bg-[#F2B705]/20 hover:text-[#F2B705]"
            />
            <CallWaiterButton
              buttonClassName="bg-[#3B332E] text-[#B6AA99] hover:bg-[#F2B705]/20 hover:text-[#F2B705]"
              panelClassName="border-[#3B332E] bg-[#2a241f]/95 text-[#F5EDE0]"
            />
            <MenuWifiDropdown
              buttonClassName="bg-[#3B332E] text-[#B6AA99] hover:bg-[#F2B705]/20 hover:text-[#F2B705]"
              panelClassName="border-[#3B332E] bg-[#2a241f]/95 text-[#F5EDE0]"
            />
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
              <span className="text-base font-medium">
                {locale === "ar" ? "EN" : "AR"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
