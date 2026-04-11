"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type MenuContextType = {
  activeCategory: string;
  setActiveCategory: (id: string) => void;
};

const MenuContext = createContext<MenuContextType>({
  activeCategory: "all",
  setActiveCategory: () => {},
});

export function MenuProvider({ children }: { children: ReactNode }) {
  const [activeCategory, setActiveCategory] = useState("all");
  return (
    <MenuContext.Provider value={{ activeCategory, setActiveCategory }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenuContext() {
  return useContext(MenuContext);
}
