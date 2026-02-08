import React, { ReactNode } from "react";

// ============================
// Design Tokens (Button Variants & Sizes)
// ============================

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50";

const BUTTON_VARIANTS = {
  default:
    "bg-[var(--accent)] text-white hover:opacity-90 shadow-lg hover:shadow-xl",
  outline:
    "border-2 border-[var(--border-main)] hover:border-[var(--accent)] hover:text-[var(--accent)] bg-transparent",
  ghost: "hover:bg-white/5",
  hero: "bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-white shadow-xl hover:shadow-[0_0_50px_var(--accent)/40] hover:scale-105",
  glow: "bg-[var(--accent)] text-white shadow-[0_0_40px_var(--accent)]",
  category:
    "bg-[var(--bg-card)] border border-[var(--border-main)] hover:bg-[var(--accent)] hover:border-[var(--accent)] hover:text-white",
  secondary:
    "bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-[var(--bg-card)]/80",
} as const;

const BUTTON_SIZES = {
  sm: "px-3 py-1.5 text-[var(--text-sm)]",
  default: "px-4 py-2 text-[var(--text-base)]",
  lg: "px-5 py-2.5 md:px-6 md:py-3 text-[var(--text-base)] md:text-[var(--text-lg)]",
  xl: "px-6 py-3 md:px-8 md:py-4 text-[var(--text-lg)] md:text-[var(--text-xl)]",
  icon: "h-10 w-10 p-0",
} as const;

// ============================
// Button Component
// ============================

interface ButtonProps {
  children: ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: keyof typeof BUTTON_VARIANTS;
  size?: keyof typeof BUTTON_SIZES;
  className?: string;
  style?: React.CSSProperties;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = "default",
  size = "default",
  className = "",
  style,
}) => {
  return (
    <button
      onClick={onClick}
      className={`${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${className}`}
      style={style}
    >
      {children}
    </button>
  );
};
