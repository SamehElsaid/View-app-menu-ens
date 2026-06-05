"use client";

import { useEffect } from "react";

const PHARAONIC_FONTS_ID = "pharaonic-display-fonts";
const PHARAONIC_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cinzel:wght@400;600;700&display=swap";

export function pharaonicDisplayFont(locale: string): string {
  return locale === "ar"
    ? '"Amiri", "Tajawal", serif'
    : '"Cinzel", "Google Sans", serif';
}

export default function PharaonicFonts() {
  useEffect(() => {
    if (document.getElementById(PHARAONIC_FONTS_ID)) return;
    const link = document.createElement("link");
    link.id = PHARAONIC_FONTS_ID;
    link.rel = "stylesheet";
    link.href = PHARAONIC_FONTS_HREF;
    document.head.appendChild(link);
  }, []);

  return null;
}
