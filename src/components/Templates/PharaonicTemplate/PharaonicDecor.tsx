"use client";

import { usePharaonicTheme, hexToRgba } from "./PharaonicThemeContext";

/** Repeating cartouche / lotus motif strip */
export function HieroglyphBorder({ className = "" }: { className?: string }) {
  const { primary } = usePharaonicTheme();

  return (
    <div
      className={`pointer-events-none overflow-hidden opacity-40 ${className}`}
      aria-hidden
      style={{
        backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' width='120' height='24' viewBox='0 0 120 24'>
  <g fill='none' stroke='${primary}' stroke-width='0.8' opacity='0.9'>
    <ellipse cx='12' cy='12' rx='8' ry='10'/>
    <path d='M28 12h8M32 6v12M40 8c4 0 6 2 6 4s-2 4-6 4'/>
    <circle cx='56' cy='12' r='4'/>
    <path d='M68 6h12v12H68z M74 6v12'/>
    <path d='M88 12c0-4 4-8 10-8 4 0 8 3 8 8s-4 8-10 8c-6 0-8-4-8-8z'/>
  </g>
</svg>`)}")`,
        backgroundRepeat: "repeat-x",
        backgroundSize: "120px 24px",
        height: "24px",
      }}
    />
  );
}

export function LotusDivider({ className = "" }: { className?: string }) {
  const { primary, secondary } = usePharaonicTheme();

  return (
    <div
      className={`flex items-center justify-center gap-4 ${className}`}
      aria-hidden
    >
      <span
        className="h-px flex-1 max-w-[120px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${hexToRgba(primary, 0.7)}, transparent)`,
        }}
      />
      <svg width="32" height="20" viewBox="0 0 32 20" className="shrink-0">
        <path
          d="M16 2 C10 8 6 12 6 16 C6 18 10 18 16 14 C22 18 26 18 26 16 C26 12 22 8 16 2Z"
          fill={hexToRgba(secondary, 0.35)}
          stroke={primary}
          strokeWidth="0.8"
        />
        <circle cx="16" cy="10" r="2" fill={primary} opacity="0.8" />
      </svg>
      <span
        className="h-px flex-1 max-w-[120px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${hexToRgba(primary, 0.7)}, transparent)`,
        }}
      />
    </div>
  );
}

export function PyramidSilhouettes() {
  const { primary, secondary } = usePharaonicTheme();

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[min(38vh,280px)] overflow-hidden"
      aria-hidden
    >
      <svg
        className="absolute bottom-0 w-full h-full"
        viewBox="0 0 1440 280"
        preserveAspectRatio="xMidYMax slice"
      >
        <defs>
          <linearGradient id="ph-sand" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={hexToRgba(primary, 0.08)} />
            <stop offset="100%" stopColor={hexToRgba(primary, 0.22)} />
          </linearGradient>
        </defs>
        <polygon
          points="720,40 520,280 920,280"
          fill="url(#ph-sand)"
          stroke={hexToRgba(primary, 0.25)}
          strokeWidth="1"
        />
        <polygon
          points="920,80 700,280 1140,280"
          fill={hexToRgba(secondary, 0.12)}
          stroke={hexToRgba(primary, 0.18)}
          strokeWidth="1"
        />
        <polygon
          points="480,120 280,280 680,280"
          fill={hexToRgba(secondary, 0.08)}
          stroke={hexToRgba(primary, 0.15)}
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

export function PapyrusTexture() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-30 opacity-[0.04]"
      aria-hidden
      style={{
        backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>
  <filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/></filter>
  <rect width='200' height='200' filter='url(%23n)' opacity='0.5'/>
</svg>`)}")`,
      }}
    />
  );
}
