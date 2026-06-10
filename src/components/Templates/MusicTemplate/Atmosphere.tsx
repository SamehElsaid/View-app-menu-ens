"use client";

import { useEffect, useRef } from "react";
import type { MoodKey, MusicMoodState } from "./moodEnergy";

type AtmosphereProps = {
  mood: MusicMoodState;
};

function MoodVeil({ mood }: AtmosphereProps) {
  return (
    <div
      className="music-mood-veil pointer-events-none fixed inset-0 z-0"
      aria-hidden
      data-mood={mood.atmosphereMood}
      data-category-mood={mood.categoryMood}
      data-product-mood={mood.productMood}
    />
  );
}

function AmbientBlobs({ mood }: { mood: MoodKey }) {
  const blobPeachRef = useRef<HTMLDivElement>(null);
  const blobCoralRef = useRef<HTMLDivElement>(null);
  const blobSkyRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let raf = 0;
    let t = 0;

    const onPointerMove = (event: PointerEvent) => {
      const nx = (event.clientX / window.innerWidth - 0.5) * 2;
      const ny = (event.clientY / window.innerHeight - 0.5) * 2;
      pointerRef.current = { x: nx, y: ny };
    };

    const tick = () => {
      t += 0.0045;
      const { x, y } = pointerRef.current;
      const px = x * 10;
      const py = y * 7;

      if (blobPeachRef.current) {
        blobPeachRef.current.style.transform = `translate(${Math.sin(t) * 12 + px}px, ${Math.cos(t * 0.85) * 10 + py}px)`;
      }
      if (blobCoralRef.current) {
        blobCoralRef.current.style.transform = `translate(${Math.cos(t * 0.92) * 11 - px}px, ${Math.sin(t * 0.72) * 13 - py}px)`;
      }
      if (blobSkyRef.current) {
        blobSkyRef.current.style.transform = `translate(${Math.sin(t * 1.05) * 7 + px * 0.45}px, ${Math.cos(t * 1.15) * 9 + py * 0.45}px)`;
      }

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <div className="music-ambient" aria-hidden data-mood={mood}>
      <div
        ref={blobPeachRef}
        className="music-ambient__blob music-ambient__blob--peach"
      />
      <div
        ref={blobCoralRef}
        className="music-ambient__blob music-ambient__blob--coral"
      />
      <div
        ref={blobSkyRef}
        className="music-ambient__blob music-ambient__blob--sky"
      />
      <div className="music-ambient__grain" />
    </div>
  );
}

export default function Atmosphere({ mood }: AtmosphereProps) {
  return (
    <>
      <MoodVeil mood={mood} />
      <AmbientBlobs mood={mood.atmosphereMood} />
    </>
  );
}
