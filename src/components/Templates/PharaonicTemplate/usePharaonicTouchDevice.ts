"use client";

import { useEffect, useState } from "react";

/** Coarse pointer or narrow viewport — mobile-first pharaonic UX */
export function usePharaonicTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse), (max-width: 767px)");
    const update = () => setIsTouch(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isTouch;
}

export function pharaonicHaptic(pattern: number | number[] = 14) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    /* unsupported */
  }
}
