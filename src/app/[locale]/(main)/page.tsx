"use client";
import { useAppSelector } from '@/store/hooks';

export default function Page() {
  const menu = useAppSelector((state) => state.menu.menu);
  console.log(menu);
  return (
    <div>
      
    </div>
  )
}
