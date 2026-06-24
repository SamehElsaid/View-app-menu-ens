"use client";

import { LanguageToggle } from "../Default/LanguageToggle";
import { useMenuSocialLinks } from "@/hooks/useMenuSocialLinks";
import { useOneCardTheme } from "./OneCardThemeContext";

export default function NavBar() {
  const { primary } = useOneCardTheme();
  const socialLinks = useMenuSocialLinks();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-200 px-5 pt-4 pb-3 pointer-events-none">
        <div
          dir="ltr"
          className="pointer-events-auto flex items-center justify-between gap-3 px-5 py-4 one-card-header bg-[rgba(255,255,255,0.97)] shadow-[0_4px_16px_rgba(0,0,0,0.12)] max-[380px]:px-4"
        >
          <div
            className="onecard-lang-pill inline-flex items-center gap-1.5 px-4 py-2 rounded-[50px] text-sm font-bold text-white leading-none"
            style={{ backgroundColor: primary }}
          >
            <LanguageToggle />
          </div>

          {socialLinks.length > 0 ? (
            <div className="flex items-center gap-2 max-[380px]:gap-1.5">
              {socialLinks.map((social) => {
                const SocialIcon = social.Icon;
                return (
                  <a
                    key={social.platform}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-zinc-100 text-zinc-500 text-[18px] transition-all duration-200 hover:bg-zinc-200 hover:text-zinc-800 hover:scale-105 max-[380px]:w-8 max-[380px]:h-8 max-[380px]:text-md"
                    aria-label={social.label}
                  >
                    <SocialIcon />
                  </a>
                );
              })}
            </div>
          ) : (
            <span className="w-5" aria-hidden />
          )}
        </div>
      </header>

      {/* Spacer – keeps the white card below the fixed header + leaves gradient gap for the logo */}
      <div className="h-[155px] pointer-events-none" aria-hidden />
    </>
  );
}
