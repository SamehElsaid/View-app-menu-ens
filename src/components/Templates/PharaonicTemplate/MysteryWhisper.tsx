"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { MYSTERY_WHISPERS } from "./pharaonicMystery";
import { pharaonicDisplayFont } from "./PharaonicFonts";
import { usePharaonicTheme } from "./PharaonicThemeContext";

type MysteryWhisperProps = {
  /** When set, whispers stay hidden — the menu’s own subtitle carries the message */
  hidden?: boolean;
};

export default function MysteryWhisper({ hidden }: MysteryWhisperProps) {
  const locale = useLocale() as "ar" | "en";
  const { secondary } = usePharaonicTheme();
  const lines = MYSTERY_WHISPERS[locale];
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (hidden) return;
    const id = window.setInterval(() => {
      setFade(false);
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % lines.length);
        setFade(true);
      }, 420);
    }, 5200);
    return () => window.clearInterval(id);
  }, [hidden, lines.length]);

  if (hidden) return null;

  return (
    <p
      className={`mx-auto mt-2 max-w-md text-sm italic tracking-wide transition-opacity duration-500 motion-reduce:transition-none ${
        fade ? "opacity-70" : "opacity-0"
      }`}
      style={{
        color: `${secondary}bb`,
        fontFamily: pharaonicDisplayFont(locale),
      }}
      aria-live="polite"
    >
      {lines[index]}
    </p>
  );
}
