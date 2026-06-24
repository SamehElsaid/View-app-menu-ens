"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  getCatalogObserverRootMargin,
  isElementInCatalogPrefetchZone,
} from "@/lib/menuCatalogScroll";

export type ViewportGateProps = {
  children: ReactNode;
  /** Reserved layout while content is not yet mounted. */
  placeholder?: ReactNode;
  className?: string;
  /** Keep children mounted after first reveal (default true). */
  keepMounted?: boolean;
};

export default function ViewportGate({
  children,
  placeholder = null,
  className = "",
  keepMounted = true,
}: ViewportGateProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;

    if (isElementInCatalogPrefetchZone(element)) {
      setVisible(true);
      if (keepMounted) return;
    }

    let observer: IntersectionObserver | null = null;

    const attach = () => {
      observer?.disconnect();

      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            setVisible(true);
            if (keepMounted) {
              observer?.disconnect();
              observer = null;
            }
            return;
          }

          if (!keepMounted) {
            setVisible(false);
          }
        },
        {
          root: null,
          rootMargin: getCatalogObserverRootMargin(window.innerHeight),
          threshold: 0,
        },
      );

      observer.observe(element);
    };

    attach();

    const onResize = () => attach();
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [keepMounted]);

  return (
    <div ref={rootRef} className={`menu-deferred-item ${className}`.trim()}>
      {visible ? children : placeholder}
    </div>
  );
}
