"use client";
import { useAppSelector } from "@/store/hooks";
import Default from "@/components/Templates/Default";
import SkyTemplate from "@/components/Templates/SkyTemplate";

export default function Page() {
  const menu = useAppSelector((state) => state.menu);
  console.log(menu);
  const theme = useAppSelector((state) => state.menu.theme);

  return (
    <main>
      {theme === "default" && <Default />}
      {theme === "sky" && <SkyTemplate />}
    </main>
  );
}
