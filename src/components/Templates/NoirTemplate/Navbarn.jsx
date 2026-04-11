"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useLocale } from "next-intl"
import { useRouter, usePathname } from "@/i18n/navigation"
import { useAppSelector } from "@/store/hooks"

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const menuInfo = useAppSelector((state) => state.menu.menuInfo)

  const siteName = menuInfo?.name?.trim()
  const displayName = siteName || "NØIR"

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [menuOpen])

  const close = () => setMenuOpen(false)
  const toggleLanguage = () => {
    const newLocale = locale === "ar" ? "en" : "ar";
    router.push(pathname, { locale: newLocale });
  };
  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 h-[72px] z-100 flex items-center justify-between px-8 backdrop-blur-[20px] transition-colors duration-300 border-b border-violet/10 ${
          scrolled ? "bg-black/[0.92]" : "bg-black/60"
        }`}
      >
        <a href="#" className="flex items-center gap-3 no-underline shrink-0">
          {menuInfo?.logo ? (
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-violet/20 shadow-[0_0_20px_rgba(124,58,237,0.25)]">
              <Image src={menuInfo.logo} alt="" fill className="object-cover" sizes="32px" />
            </div>
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-violet to-cyan shadow-[0_0_20px_rgba(124,58,237,0.35)]">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                <path d="M12 3C12 3 7 8 7 13a5 5 0 0010 0c0-5-5-10-5-10z" fill="white" fillOpacity=".9" />
              </svg>
            </div>
          )}
          <span className="font-logo text-xl tracking-[0.2em] text-lavender">
            {displayName}
          </span>
        </a>

        <ul className="hidden md:flex gap-8 list-none">
          <li>
          <a href="#menu" className="text-xs tracking-[0.15em] uppercase text-text-secondary no-underline transition-colors duration-300 relative
              before:content-[''] before:absolute before:bottom-[-4px] before:left-0 before:w-0 before:h-px before:bg-lavender
              before:transition-[width] before:duration-300 hover:before:w-full">
             {locale === "ar" ? "القائمة" : "Menu"}
            </a>
          </li>
        
        </ul>

        <div className="flex items-center gap-3 shrink-0">
          <button
            className="font-body bg-transparent text-sm text-lavender tracking-widest py-1.5 px-4 rounded-[2px] border border-violet/30 cursor-pointer transition-all duration-300
              hover:shadow-[0_0_20px_rgba(124,58,237,0.3)]"
            onClick={toggleLanguage}
          >
            {locale === "ar" ? "EN" : "AR"}
          </button>

          <button
            className="flex md:hidden flex-col justify-center items-center gap-1.5 w-10 h-10 p-1 rounded border border-violet/20 bg-violet/5 cursor-pointer shrink-0 transition-all duration-300"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            <span className={`block h-[1.5px] w-[18px] rounded-sm bg-lavender transition-all duration-300 origin-center ${menuOpen ? "translate-y-[7.5px] rotate-45" : ""}`} />
            <span className={`block h-[1.5px] rounded-sm bg-lavender transition-all duration-300 origin-center ${menuOpen ? "w-0 opacity-0" : "w-[18px]"}`} />
            <span className={`block h-[1.5px] w-[18px] rounded-sm bg-lavender transition-all duration-300 origin-center ${menuOpen ? "-translate-y-[7.5px] -rotate-45" : ""}`} />
          </button>
        </div>
      </header>

      <div className={`fixed inset-0 z-200 ${menuOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        role="dialog" aria-modal="true" aria-hidden={!menuOpen}>
        <div
          className={`absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-350 ${menuOpen ? "opacity-100" : "opacity-0"}`}
          onClick={close}
        />
        <div
          className={`absolute top-0 right-0 bottom-0 w-[min(300px,82vw)] flex flex-col pt-[4.5rem] px-8 pb-10 overflow-y-auto transition-transform duration-400
            bg-linear-[160deg] from-charcoal/[0.99] to-black/[0.99] border-s border-glass-border
            ${menuOpen ? "translate-x-0" : "translate-x-[110%]"}`}
        >
          <button
            className="absolute top-5 end-6 w-9 h-9 rounded-full flex items-center justify-center bg-violet/5 border border-violet/20 text-text-secondary cursor-pointer transition-all duration-300 text-sm"
            onClick={close} aria-label="Close menu"
          >✕</button>

          <nav className="flex flex-col">
            <a href="#menu" onClick={close}
              className="font-display text-2xl text-text-secondary font-light italic no-underline py-5 block transition-all duration-300 hover:ps-2 border-b border-violet/[0.07]">
              {locale === "ar" ? "القائمة" : "Menu"}
            </a>
           
            <button
              className="font-body mt-6 text-sm text-lavender tracking-[0.2em] uppercase py-3 px-6 rounded-[2px] border border-violet/30 cursor-pointer transition-all duration-300 w-fit bg-transparent"
              onClick={() => { toggleLanguage(); close() }}>
              {locale === "ar" ? "EN" : "AR"}
            </button>
          </nav>
        </div>
      </div>
    </>
  )
}
