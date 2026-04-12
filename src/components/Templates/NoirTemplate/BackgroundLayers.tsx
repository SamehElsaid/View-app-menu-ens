"use client";

import { useNoirTheme } from "./NoirThemeContext";
import { hexToRgba } from "./noirColorUtils";

const NOISE_SVG =
  "data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E";

export default function BackgroundLayers() {
  const { primary, secondary } = useNoirTheme();

  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none z-1000 opacity-35"
        style={{ backgroundImage: `url("${NOISE_SVG}")` }}
      />
      <div
        className="fixed inset-0 -z-20"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, ${hexToRgba(primary, 0.45)}, transparent 60%),
            radial-gradient(circle at 80% 70%, ${hexToRgba(secondary, 0.38)}, transparent 60%),
            radial-gradient(circle at 50% 50%, ${hexToRgba(primary, 0.12)}, transparent 70%),
            linear-gradient(160deg, #141422, #1a1a2e)
          `,
        }}
      />
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute rounded-full blur-[120px] w-[550px] h-[550px] -top-[60px] -left-[60px] bg-violet/30 animate-float-blob" />
        <div className="absolute rounded-full blur-[120px] w-[500px] h-[500px] bottom-[5%] -right-10 bg-cyan/25 animate-float-blob [animation-delay:-7s]" />
        <div className="absolute rounded-full blur-[100px] w-[400px] h-[400px] top-[40%] left-[30%] bg-lavender/15 animate-float-blob [animation-delay:-13s]" />
      </div>
    </>
  );
}
