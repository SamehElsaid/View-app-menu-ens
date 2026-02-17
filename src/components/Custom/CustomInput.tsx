"use client";

import { type ReactNode } from "react";

export interface CustomInputProps {
  type: string;
  placeholder: string;
  id: string;
  icon: ReactNode;
  label: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
}

export default function CustomInput({
  type,
  placeholder,
  id,
  icon,
  label,
  error,
  value,
  onChange,
}: CustomInputProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <div className="relative flex items-center rounded-lg border border-slate-200 bg-white/80 shadow-sm transition focus-within:ring-2 focus-within:ring-accent-purple/30 dark:border-slate-700 dark:bg-slate-800/80">
        <span className="pointer-events-none flex items-center pl-4 text-slate-400">
          {icon}
        </span>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border-0 bg-transparent py-3 pl-3 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0 dark:text-slate-100 dark:placeholder-slate-500"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
