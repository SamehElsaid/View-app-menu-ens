"use client";

import { useCoffeeTheme } from "./CoffeeThemeContext";

type DecorProps = {
  className?: string;
  opacity?: number;
};
//TODO: can we try to use svg for this? **

function CoffeeCup({ className = "", opacity = 0.2 }: DecorProps) {
  const { secondary } = useCoffeeTheme();
  return (
    <svg
      viewBox="0 0 120 140"
      className={className}
      fill="none"
      stroke={secondary}
      strokeWidth="2"
      aria-hidden
      style={{ opacity }}
    >
      <path d="M28 48h52v52c0 16-12 28-26 28s-26-12-26-28V48z" />
      <path d="M80 56h8c12 0 20 8 20 18s-8 18-20 18h-8" />
      <path d="M36 48V38c0-6 5-10 12-10h28c7 0 12 4 12 10v10" strokeLinecap="round" />
      <path d="M44 72c4 6 10 8 16 8s12-2 16-8" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

function MokaPot({ className = "", opacity = 0.18 }: DecorProps) {
  const { secondary } = useCoffeeTheme();
  return (
    <svg
      viewBox="0 0 100 130"
      className={className}
      fill="none"
      stroke={secondary}
      strokeWidth="2"
      aria-hidden
      style={{ opacity }}
    >
      <path d="M30 42h40v8H30z" />
      <path d="M34 50v52c0 8 6 14 16 14s16-6 16-14V50" />
      <path d="M22 58h8M70 58h8" strokeLinecap="round" />
      <path d="M42 22h16l-4 20H46z" strokeLinejoin="round" />
      <ellipse cx="50" cy="42" rx="20" ry="4" />
    </svg>
  );
}

function BeanBag({ className = "", opacity = 0.2 }: DecorProps) {
  const { secondary } = useCoffeeTheme();
  return (
    <svg
      viewBox="0 0 110 120"
      className={className}
      fill="none"
      stroke={secondary}
      strokeWidth="2"
      aria-hidden
      style={{ opacity }}
    >
      <path d="M20 35c0-12 18-22 35-22s35 10 35 22v55c0 12-18 22-35 22S20 102 20 90V35z" />
      <path d="M35 48c8-4 16-6 25-6s17 2 25 6" strokeLinecap="round" />
      <ellipse cx="55" cy="62" rx="8" ry="12" fill={secondary} fillOpacity="0.15" stroke="none" />
      <ellipse cx="42" cy="72" rx="6" ry="9" fill={secondary} fillOpacity="0.12" stroke="none" />
      <ellipse cx="68" cy="70" rx="7" ry="10" fill={secondary} fillOpacity="0.12" stroke="none" />
    </svg>
  );
}

function HandCoffee({ className = "", opacity = 0.18 }: DecorProps) {
  const { secondary } = useCoffeeTheme();
  return (
    <svg
      viewBox="0 0 130 140"
      className={className}
      fill="none"
      stroke={secondary}
      strokeWidth="2"
      aria-hidden
      style={{ opacity }}
    >
      <path d="M45 95c-8-20-4-45 12-58 8-6 18-8 28-6 10 2 18 10 22 20 6 14 4 32-6 44" strokeLinecap="round" />
      <path d="M38 88c-6 8-8 18-4 26 4 8 14 12 24 10" strokeLinecap="round" />
      <path d="M72 38h24v40c0 10-8 18-18 18H72V38z" />
      <path d="M76 38V28c0-4 4-8 10-8h8" strokeLinecap="round" />
      <path d="M80 58c3 4 8 6 12 6" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

export default function CoffeeDecor() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-[5] overflow-hidden" aria-hidden>
      <CoffeeCup className="absolute -start-4 top-[18%] h-28 w-28 sm:h-36 sm:w-36" opacity={0.2} />
      <MokaPot className="absolute end-2 top-[12%] h-24 w-24 sm:end-8 sm:h-32 sm:w-32" opacity={0.18} />
      <BeanBag className="absolute -end-6 bottom-[22%] h-32 w-32 sm:h-40 sm:w-40" opacity={0.22} />
      <HandCoffee className="absolute -start-6 bottom-[8%] h-28 w-28 sm:h-36 sm:w-36" opacity={0.17} />
    </div>
  );
}
