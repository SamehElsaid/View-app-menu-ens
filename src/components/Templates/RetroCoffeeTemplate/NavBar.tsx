"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useAppSelector } from "@/store/hooks";
import { useTableCartAllowed } from "@/hooks/useTableCartAllowed";
import { isFreeMenuPlan } from "@/lib/menuPlan";
import LoadImage from "@/components/ImageLoad";
import { FiLayers, FiX } from "react-icons/fi";
import { useCoffee } from "./CoffeeContext";
import {
  RETRO_SURFACE,
  RETRO_SURFACE_BORDER,
  useCoffeeTheme,
} from "./CoffeeThemeContext";

type NavCategory = {
  id?: number;
  title: string;
  titleAr: string;
};

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const isAr = locale === "ar";
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);
  const storeCategories = useAppSelector((state) => state.menu.categories) ?? [];
  const tableCartAllowed = useTableCartAllowed();
  const isTableOrder =
    Boolean(searchParams.get("table")?.trim()) && tableCartAllowed;
  const hasEnsBanner = isFreeMenuPlan(menuInfo?.ownerPlanType);
  const { colors, primary } = useCoffeeTheme();
  const { activeCategoryId, setActiveCategoryId } = useCoffee();

  const [scrolled, setScrolled] = useState(false);
  const [fabCategoriesOpen, setFabCategoriesOpen] = useState(false);

  const categories: NavCategory[] = storeCategories.map((c) => ({
    id: c.id,
    title: c.nameEn ?? c.name,
    titleAr: c.nameAr ?? c.name,
  }));

  const displayName = menuInfo?.name?.trim() ?? "";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

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

  const toggleLanguage = () => {
    const newLocale = locale === "ar" ? "en" : "ar";
    const query = searchParams.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`, {
      locale: newLocale,
    });
  };

  const scrollToMenu = () => {
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToCategory = (categoryId: number | null) => {
    setActiveCategoryId(categoryId);
    setFabCategoriesOpen(false);
    window.setTimeout(() => {
      document.getElementById("retro-menu-products")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  const fabSideClass = isAr ? "right-5 md:right-8" : "left-5 md:left-8";
  const fabBottomClass = isTableOrder
    ? "bottom-[calc(8rem+env(safe-area-inset-bottom,0px))] md:bottom-[calc(9rem+env(safe-area-inset-bottom,0px))]"
    : hasEnsBanner
      ? "bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] sm:bottom-20"
      : "bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] md:bottom-8";
  const panelSideClass = isAr ? "right-0" : "left-0";

  return (
    <>
      <style jsx global>{`
        :root {
          --retro-nav-offset: calc(4.25rem + env(safe-area-inset-top, 0px));
        }
        @media (min-width: 640px) {
          :root {
            --retro-nav-offset: calc(4.5rem + env(safe-area-inset-top, 0px));
          }
        }
        .retro-nav-link {
          position: relative;
        }
        .retro-nav-link::after {
          content: "";
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: 55%;
          height: 2px;
          background-color: ${primary};
          border-radius: 999px;
          transition: transform 0.25s ease;
        }
        .retro-nav-link:hover::after,
        .retro-nav-link:focus-visible::after {
          transform: translateX(-50%) scaleX(1);
        }
      `}</style>

      <header
        className={`fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top,0px)] transition-all duration-300 ${
          scrolled
            ? "shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)]"
            : ""
        }`}
        style={{
          backgroundColor: RETRO_SURFACE,
        }}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:gap-4 sm:px-6">
          <Link
            href="/"
            className="flex min-w-0 flex-1 items-center gap-3"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            {menuInfo?.logo ? (
              <div
                className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border bg-white shadow-sm sm:h-11 sm:w-11"
                style={{ borderColor: RETRO_SURFACE_BORDER }}
              >
                <LoadImage
                  src={menuInfo.logo}
                  alt={displayName || "Logo"}
                  fill
                  className="object-cover"
                  disableLazy
                />
              </div>
            ) : displayName ? (
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-serif text-sm font-black text-white sm:h-11 sm:w-11 sm:text-base"
                style={{ backgroundColor: primary }}
              >
                {displayName.charAt(0)}
              </div>
            ) : null}

            {displayName ? (
              <span
                className="truncate font-serif text-base font-black tracking-tight sm:text-lg"
                style={{ color: primary }}
              >
                {displayName}
              </span>
            ) : null}
          </Link>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
         

            <button
              type="button"
              onClick={toggleLanguage}
              className="flex h-9 min-w-10 items-center justify-center rounded-full border bg-white px-2.5 text-[11px] font-black tracking-wider shadow-sm transition-all active:scale-95 hover:bg-zinc-50 sm:h-10 sm:min-w-11 sm:px-3 sm:text-xs"
              style={{ color: primary, borderColor: RETRO_SURFACE_BORDER }}
              aria-label={isAr ? "Switch to English" : "التبديل إلى العربية"}
            >
              {isAr ? "EN" : "AR"}
            </button>
          </div>
        </div>
      </header>

      {/* زر عائم مريح لفتح التصنيفات */}
      {categories.length > 0 && !fabCategoriesOpen && (
        <button
          type="button"
          onClick={() => setFabCategoriesOpen(true)}
          className={`fixed z-[70] flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition transform hover:scale-105 active:scale-95 focus:outline-none ${fabSideClass} ${fabBottomClass}`}
          style={{
            backgroundColor: primary,
            color: "#fff",
            boxShadow: `0 8px 20px -4px ${primary}55`,
          }}
          aria-label={t("categories")}
          aria-expanded={false}
          title={t("categories")}
        >
          <FiLayers className="h-5 w-5" strokeWidth={2} />
        </button>
      )}

      {/* لوحة التصنيفات المنبثقة الجانبية المحسنة */}
      {fabCategoriesOpen && categories.length > 0 && (
        <div
          className="fixed inset-0 z-[100010]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="coffee-categories-panel-title"
        >
          <button
            type="button"
            className="absolute inset-0 z-0 bg-black/35 backdrop-blur-[2px]"
            onClick={() => setFabCategoriesOpen(false)}
            aria-label={t("closeCategories")}
          />
          <aside
            className={`absolute z-10 flex w-full flex-col shadow-2xl inset-x-0 bottom-0 max-h-[70dvh] rounded-t-[2rem] sm:inset-x-auto sm:top-0 sm:bottom-0 sm:h-full sm:max-h-none sm:max-w-xs sm:rounded-none border-t sm:border-t-0 ${
              isAr ? "sm:border-l" : "sm:border-r"
            } ${panelSideClass}`}
            style={{
              backgroundColor: "#f4ebd9",
              borderColor: "#e6d9be",
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }}
          >
            <div
              className="flex items-center justify-between border-b px-5 py-4"
              style={{ borderColor: "#e6d9be" }}
            >
              <h2
                id="coffee-categories-panel-title"
                className="font-serif text-sm font-bold"
                style={{ color: primary }}
              >
                {t("categories")}
              </h2>
              <button
                type="button"
                onClick={() => setFabCategoriesOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/50 border border-[#e6d9be] text-zinc-500 transition active:scale-90"
                aria-label={t("closeCategories")}
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
            
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <ul className="flex flex-col gap-1.5">
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToCategory(null)}
                    className="w-full rounded-xl px-4 py-2.5 text-start text-xs font-bold transition-all"
                    style={
                      activeCategoryId === null
                        ? { backgroundColor: primary, color: "#fff" }
                        : { color: colors.text }
                    }
                  >
                    {isAr ? "الكل" : "All"}
                  </button>
                </li>
                {categories.map((category) => {
                  const isActive = activeCategoryId === category.id;
                  return (
                    <li key={category.id ?? category.title}>
                      <button
                        type="button"
                        onClick={() => scrollToCategory(category.id ?? null)}
                        className="w-full rounded-xl px-4 py-2.5 text-start text-xs font-bold transition-all hover:bg-white/40"
                        style={
                          isActive
                            ? { backgroundColor: primary, color: "#fff" }
                            : { color: colors.text }
                        }
                      >
                        {isAr ? category.titleAr : category.title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}