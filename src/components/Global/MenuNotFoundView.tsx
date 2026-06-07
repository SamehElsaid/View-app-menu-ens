"use client";

import { useTranslations } from "next-intl";
import { MdOutlineLinkOff } from "react-icons/md";
import { FaGlobe } from "react-icons/fa";

const ENS_REGISTER_URL = "https://www.ensmenu.com/auth/register";
const ENS_WEBSITE_URL = "https://www.ensmenu.com/";

export default function MenuNotFoundView() {
  const t = useTranslations("menuNotFound");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-50 via-white to-zinc-100 px-4 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xl shadow-zinc-200/60">
        <div className="h-1.5 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />

        <div className="flex flex-col items-center px-8 pb-9 pt-8 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-violet-50 text-violet-600 ring-4 ring-white shadow-lg">
            <MdOutlineLinkOff className="text-3xl" aria-hidden />
          </div>

          <h1 className="mb-3 text-xl font-bold tracking-tight text-zinc-800">
            {t("title")}
          </h1>

          <p className="mb-7 max-w-sm text-sm leading-relaxed text-zinc-600">
            {t("description")}
          </p>

          <a
            href={ENS_REGISTER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition hover:scale-[1.02] hover:opacity-95 active:scale-[0.98]"
          >
            <FaGlobe className="size-4 shrink-0" aria-hidden />
            {t("registerCta")}
          </a>

          <a
            href={ENS_WEBSITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 text-sm font-medium text-violet-600 transition hover:text-violet-700 hover:underline"
          >
            {t("visitSite")}
          </a>
        </div>
      </div>
    </div>
  );
}
