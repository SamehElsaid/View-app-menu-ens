"use client";

import { useState, useEffect } from "react";

interface Bubble {
  id: number;
  size: number;
  left: number;
  delay: number;
  duration: number;
}

const BUBBLE_COUNT = 100;

const Bubbles = () => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    // Generate bubbles only on the client side to avoid hydration mismatch
    setBubbles(
      Array.from({ length: BUBBLE_COUNT }, (_, i) => ({
        id: i,
        size: Math.random() * 34 + 8,
        left: Math.random() * 100,
        delay: Math.random() * 10,
        duration: Math.random() * 12 + 7,
      })),
    );
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute rounded-full opacity-50 animate-bubble-rise"
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
