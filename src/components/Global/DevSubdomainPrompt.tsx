"use client";

import { writeDevSubDomainToCookie } from "@/lib/devSubDomainCookie";
import { FormEvent, useState } from "react";
import { FiX } from "react-icons/fi";

type DevSubdomainPromptProps = {
  locale: string;
  onClose?: () => void;
};

const copy = {
  ar: {
    title: "وضع التطوير",
    description: "أدخل اسم الـ subdomain للمنيو الذي تريد تجربته محلياً.",
    label: "Subdomain",
    placeholder: "sameh",
    submit: "حفظ ومتابعة",
    error: "أدخل subdomain صالح (حروف إنجليزية وأرقام و - فقط)",
  },
  en: {
    title: "Development mode",
    description: "Enter the menu subdomain you want to load locally.",
    label: "Subdomain",
    placeholder: "sameh",
    submit: "Save and continue",
    error: "Enter a valid subdomain (letters, numbers, and hyphens only)",
  },
} as const;

export default function DevSubdomainPrompt({ locale, onClose }: DevSubdomainPromptProps) {
  const lang = locale === "ar" ? "ar" : "en";
  const text = copy[lang];
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = value.trim().toLowerCase();

    if (!trimmed || !/^[a-z0-9-]+$/.test(trimmed)) {
      setError(text.error);
      return;
    }

    writeDevSubDomainToCookie(trimmed);
    window.location.reload();
  };

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => {
        if (onClose && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dev-subdomain-title"
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900"
      >
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`absolute top-4 ${
              lang === "ar" ? "left-4" : "right-4"
            } text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300`}
          >
            <FiX className="h-5 w-5" />
          </button>
        ) : null}

        <h2
          id="dev-subdomain-title"
          className="text-xl font-semibold text-zinc-900 dark:text-zinc-50"
        >
          {text.title}
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          {text.description}
        </p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-200">
              {text.label}
            </span>
            <input
              id="dev-subdomain-input"
              type="text"
              value={value}
              onChange={(event) => {
                setValue(event.target.value);
                if (error) setError("");
              }}
              placeholder={text.placeholder}
              autoFocus
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none ring-0 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </label>

          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            {text.submit}
          </button>
        </form>
      </div>
    </div>
  );
}
