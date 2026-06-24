"use client";

import type { ReactNode } from "react";
import { useIsMenuCatalogComplete } from "@/hooks/useIsMenuCatalogComplete";

type MenuFooterGateProps = {
  children: ReactNode;
};

export default function MenuFooterGate({ children }: MenuFooterGateProps) {
  const isCatalogComplete = useIsMenuCatalogComplete();

  if (!isCatalogComplete) {
    return null;
  }

  return children;
}
