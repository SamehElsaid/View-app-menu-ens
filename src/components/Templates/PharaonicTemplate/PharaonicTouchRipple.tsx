"use client";

import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
  type TouchEvent,
} from "react";
import { usePharaonicTouchDevice } from "./usePharaonicTouchDevice";
import { usePharaonicTheme, hexToRgba } from "./PharaonicThemeContext";

type PharaonicTouchRippleProps = ComponentPropsWithoutRef<"div"> & {
  children: ReactNode;
};

export const PharaonicTouchRipple = forwardRef<HTMLDivElement, PharaonicTouchRippleProps>(
  function PharaonicTouchRipple(
    { children, className = "", onTouchStart, ...rest },
    forwardedRef,
  ) {
    const isTouch = usePharaonicTouchDevice();
    const { primary } = usePharaonicTheme();
    const innerRef = useRef<HTMLDivElement>(null);
    const [ripple, setRipple] = useState<{
      x: number;
      y: number;
      key: number;
    } | null>(null);

    const setRefs = (node: HTMLDivElement | null) => {
      innerRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    };

    const handleTouchStart = useCallback(
      (e: TouchEvent<HTMLDivElement>) => {
        onTouchStart?.(e);
        if (!isTouch || !innerRef.current) return;
        const t = e.touches[0];
        if (!t) return;
        const rect = innerRef.current.getBoundingClientRect();
        setRipple({
          x: t.clientX - rect.left,
          y: t.clientY - rect.top,
          key: Date.now(),
        });
        window.setTimeout(() => setRipple(null), 650);
      },
      [isTouch, onTouchStart],
    );

    return (
      <div
        ref={setRefs}
        className={`relative overflow-hidden ${className}`}
        onTouchStart={handleTouchStart}
        {...rest}
      >
        {children}
        {ripple ? (
          <span
            key={ripple.key}
            className="pointer-events-none absolute z-10 rounded-full ph-touch-ripple"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 120,
              height: 120,
              marginLeft: -60,
              marginTop: -60,
              background: hexToRgba(primary, 0.35),
            }}
            aria-hidden
          />
        ) : null}
      </div>
    );
  },
);
