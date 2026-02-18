"use client";
import { useAppSelector } from "@/store/hooks";
import Default from "@/components/Templates/Default";
import SkyTemplate from "@/components/Templates/SkyTemplate";
import NeonTemplate from "@/components/Templates/NeonTemplate";
import CoffeeTemplate from "@/components/Templates/CoffeeTemplate";

export default function Page() {
  const theme = useAppSelector((state) => state.menu.theme);
  console.log(theme);
  return (
    <main>
      {theme === "default" && <Default />}
      {theme === "sky" && <SkyTemplate />}
      {theme === "neon" && <NeonTemplate />}
      {theme === "coffee" && <CoffeeTemplate />}
    </main>
  );
}
