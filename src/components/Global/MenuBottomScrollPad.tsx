"use client";

import { Suspense, useSyncExternalStore } from "react";
import { useAppSelector } from "@/store/hooks";
import { useIsMenuCornerDockSession } from "@/hooks/useIsMenuCornerDockSession";

/**
 * Extra scroll room under the template/footer so the ordering tab bar /
 * stacked FABs do not cover footer content.
 *
 * Only applied during an active delivery / table / cart session.
 * Lone rate FAB (browse mode) needs no full-width pad.
 *
 * SSR / first paint must stay null so it matches the Suspense fallback
 * and avoids hydration mismatch when searchParams differ server vs client.
 */
function MenuBottomScrollPadInner() {
  const hasMounted = useSyncExternalStore(
    () => () => { },
    () => true,
    () => false,
  );
  const hasMenu = Boolean(useAppSelector((s) => s.menu.menuInfo?.id));
  const isMenuCornerDockSession = useIsMenuCornerDockSession();

  if (!hasMounted || !hasMenu) return null;

  // No delivery / cart / table session → no bottom pad.
  if (!isMenuCornerDockSession) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none h-[calc(2.8rem+env(safe-area-inset-bottom,0px))] shrink-0 md:h-[calc(10rem+env(safe-area-inset-bottom,0px))]"
    />
  );
}

export default function MenuBottomScrollPad() {
  return (
    <Suspense fallback={null}>
      <MenuBottomScrollPadInner />
    </Suspense>
  );
}
