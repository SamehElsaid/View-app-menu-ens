"use client";
import { useAppSelector } from "@/store/hooks";
import Default from "@/components/Templates/Default";

export default function Page() {
  const theme = useAppSelector((state) => state.menu.theme);

  return <main>{theme === "default" && <Default />}</main>;
}
