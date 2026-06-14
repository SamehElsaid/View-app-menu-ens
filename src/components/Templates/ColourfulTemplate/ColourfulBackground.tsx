"use client";

import { useId, type ReactNode } from "react";
import { useColourfulTheme, hexToRgba } from "./ColourfulThemeContext";

const STROKE = 1.35;
const OPACITY = 0.17;

function OutlineIcon({
  color,
  children,
}: {
  color: string;
  children: ReactNode;
}) {
  return (
    <g
      fill="none"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity={OPACITY}
    >
      {children}
    </g>
  );
}

function CoffeeCup({ color }: { color: string }) {
  return (
    <OutlineIcon color={color}>
      <path d="M6 5h13v11c0 2.5-2 4.5-4.5 4.5H10.5C8 20.5 6 18.5 6 16V5z" />
      <path d="M19 9h2c1.1 0 2 .9 2 2s-.9 2-2 2h-2" />
      <path d="M8 5V3.5h10V5" />
    </OutlineIcon>
  );
}

function WineGlass({ color }: { color: string }) {
  return (
    <OutlineIcon color={color}>
      <path d="M12 4l5.5 8.5v1.5c0 1.9-1.6 3.5-3.5 3.5h-4C8.1 17.5 6.5 15.9 6.5 14V12.5L12 4z" />
      <path d="M9 12h6" />
    </OutlineIcon>
  );
}

function ForkKnife({ color }: { color: string }) {
  return (
    <OutlineIcon color={color}>
      <path d="M6 4v4.5c0 1 .8 1.8 1.8 1.8V19" />
      <path d="M6 4v7" />
      <path d="M16 4v15" />
      <path d="M18 4l-2 7.5" />
    </OutlineIcon>
  );
}

function Plate({ color }: { color: string }) {
  return (
    <OutlineIcon color={color}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
    </OutlineIcon>
  );
}

function Leaf({ color }: { color: string }) {
  return (
    <OutlineIcon color={color}>
      <path d="M12 4C8 8.5 6.5 12.5 7.5 18c3.5-.8 6-3 7.5-6.5 1.5 3.5 4 5.7 7.5 6.5 1-5.5-.5-9.5-5-14-.8.8-1.6 1.5-2.5 1.5S12.8 4.8 12 4z" />
      <path d="M12 4v14" />
    </OutlineIcon>
  );
}

function Croissant({ color }: { color: string }) {
  return (
    <OutlineIcon color={color}>
      <path d="M5 14c2-5 5.5-8 10-8 2.8 0 4.8 1 6.5 2.8-3.5.5-6.5 2.8-8.5 6-2-.8-4.5-.8-8.5-0.8z" />
    </OutlineIcon>
  );
}

function Deco({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {children}
    </svg>
  );
}

export default function ColourfulBackground() {
  const { primary, secondary } = useColourfulTheme();
  const patternId = useId().replace(/:/g, "");

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${hexToRgba(primary, 0.05)} 0%, #f8f6f3 20%, #f8f6f3 80%, ${hexToRgba(secondary, 0.06)} 100%)`,
        }}
      />

      <svg
        className="absolute inset-0 h-full w-full opacity-70"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id={`${patternId}-food`}
            x="0"
            y="0"
            width="200"
            height="200"
            patternUnits="userSpaceOnUse"
          >
            <g transform="translate(24 22) scale(0.82)">
              <CoffeeCup color={primary} />
            </g>
            <g transform="translate(118 20) scale(0.78)">
              <WineGlass color={secondary} />
            </g>
            <g transform="translate(72 108) scale(0.75)">
              <Plate color={primary} />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId}-food)`} />
      </svg>

      <Deco className="absolute top-[12%] end-[5%] h-24 w-24 rotate-12 opacity-50 sm:h-28 sm:w-28">
        <CoffeeCup color={primary} />
      </Deco>

      <Deco className="absolute top-[38%] start-[3%] h-20 w-20 -rotate-6 opacity-45 sm:h-24 sm:w-24">
        <ForkKnife color={secondary} />
      </Deco>

      <Deco className="absolute bottom-[14%] end-[10%] h-20 w-20 -rotate-12 opacity-45 sm:h-24 sm:w-24">
        <Croissant color={primary} />
      </Deco>

      <Deco className="absolute bottom-[22%] start-[6%] h-16 w-16 rotate-12 opacity-40 sm:h-20 sm:w-20">
        <Leaf color={secondary} />
      </Deco>
    </div>
  );
}
