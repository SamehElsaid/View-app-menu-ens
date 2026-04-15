"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type CategoryNavContextValue = {
  activeCategory: number;
  setActiveCategory: (id: number) => void;
  showCategoryBurger: boolean;
  setShowCategoryBurger: (value: boolean) => void;
};

const CategoryNavContext = createContext<CategoryNavContextValue | null>(null);

export function CategoryNavProvider({ children }: { children: ReactNode }) {
  const [activeCategory, setActiveCategoryState] = useState(0);
  const [showCategoryBurger, setShowCategoryBurger] = useState(false);

  const setActiveCategory = useCallback((id: number) => {
    setActiveCategoryState(id);
  }, []);

  const value = useMemo(
    () => ({
      activeCategory,
      setActiveCategory,
      showCategoryBurger,
      setShowCategoryBurger,
    }),
    [activeCategory, setActiveCategory, showCategoryBurger],
  );

  return (
    <CategoryNavContext.Provider value={value}>
      {children}
    </CategoryNavContext.Provider>
  );
}

export function useCategoryNav() {
  const ctx = useContext(CategoryNavContext);
  if (!ctx) {
    throw new Error("useCategoryNav must be used within CategoryNavProvider");
  }
  return ctx;
}
