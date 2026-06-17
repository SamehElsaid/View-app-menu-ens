"use client";

import { useState, useEffect } from "react";
import { readDevSubDomainFromDocumentCookie } from "@/lib/devSubDomainCookie";
import DevSubdomainPrompt from "./DevSubdomainPrompt";
import { FiEdit2 } from "react-icons/fi";

type DevSubdomainEditButtonProps = {
  locale: string;
};

const copy = {
  ar: {
    buttonText: "تغيير الـ subdomain",
  },
  en: {
    buttonText: "Change Subdomain",
  },
} as const;

export default function DevSubdomainEditButton({ locale }: DevSubdomainEditButtonProps) {
  const lang = locale === "ar" ? "ar" : "en";
  const text = copy[lang];
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const activeSubdomain = readDevSubDomainFromDocumentCookie();
    if (activeSubdomain) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSubdomain(activeSubdomain);
    }
  }, []);

  if (!subdomain) return null;

  const containerClass =
    lang === "ar"
      ? "fixed bottom-6 right-5 z-[9990]"
      : "fixed bottom-6 left-5 z-[9990]";

  return (
    <>
      <div className={containerClass}>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white shadow-lg border border-zinc-700 transition hover:bg-zinc-800 active:scale-95 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-200 dark:hover:bg-white"
        >
          <FiEdit2 className="h-3.5 w-3.5" />
          <span>
            {text.buttonText}:{" "}
            <strong className="underline underline-offset-2">{subdomain}</strong>
          </span>
        </button>
      </div>

      {isOpen ? (
        <DevSubdomainPrompt locale={locale} onClose={() => setIsOpen(false)} />
      ) : null}
    </>
  );
}
