"use client";

import { type ButtonHTMLAttributes } from "react";

export interface CustomBtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  loading?: boolean;
}

export default function CustomBtn({ text, type = "button", loading = false, disabled, className = "", ...props }: CustomBtnProps) {
  return (
    <button
      type={type}
      disabled={disabled ?? loading}
      className={`flex w-full items-center justify-center gap-2 rounded-lg bg-accent-purple px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-accent-purple/90 focus:outline-none focus:ring-2 focus:ring-accent-purple/50 disabled:opacity-60 disabled:pointer-events-none ${className}`}
      {...props}
    >
      {loading ? (
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden />
      ) : null}
      <span className={loading ? "opacity-90" : ""}>{text}</span>
    </button>
  );
}
