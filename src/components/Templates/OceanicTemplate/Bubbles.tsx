"use client";

import { useState, useEffect } from "react";

interface Bubble {
  id: number;
  size: number;
  left: number;
  delay: number;
  duration: number;
}

const DEFAULT_BUBBLE_COUNT = 100;

interface BubblesProps {
  className?: string;
  count?: number;
  /** viewport = full-page fixed layer; section = rises from container bottom (menu/footer) */
  variant?: "viewport" | "section";
}

const Bubbles = ({
  className = "fixed inset-0",
  count = DEFAULT_BUBBLE_COUNT,
  variant = "viewport",
}: BubblesProps) => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    setBubbles(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        size: Math.random() * 34 + 8,
        left: Math.random() * 100,
        delay: Math.random() * 22,
        duration:
          variant === "section"
            ? Math.random() * 20 + 32
            : Math.random() * 12 + 7,
      })),
    );
  }, [count, variant]);

  const animationClass =
    variant === "section"
      ? "animate-bubble-rise-section"
      : "animate-bubble-rise";

  return (
    <div
      className={`${className} pointer-events-none overflow-hidden z-0`}
      aria-hidden="true"
    >
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className={`absolute rounded-full opacity-50 ${animationClass}`}
          style={{
            width: bubble.size,
            height: bubble.size,
            left: `${bubble.left}%`,
            animationDelay: `${bubble.delay}s`,
            animationDuration: `${bubble.duration}s`,
            background:
              "radial-gradient(circle at 30% 30%, hsl(185 100% 90%), hsl(190 80% 70%))",
          }}
        />
      ))}
    </div>
  );
};

export default Bubbles;
