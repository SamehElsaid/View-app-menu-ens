"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import type React from "react";
import { FaWhatsapp, FaInstagram, FaFacebook } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export type MenuSocialLink = {
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
  platform: string;
  label: string;
};

export function useMenuSocialLinks(): MenuSocialLink[] {
  const menuInfo = useAppSelector((state) => state.menu.menuInfo);

  return useMemo(() => {
    const links: Array<MenuSocialLink | null> = [
      menuInfo?.socialWhatsapp
        ? {
            Icon: FaWhatsapp,
            href: `https://wa.me/${menuInfo.socialWhatsapp.replace(/[^0-9]/g, "")}`,
            platform: "whatsapp",
            label: "WhatsApp",
          }
        : null,
      menuInfo?.socialTwitter
        ? {
            Icon: FaXTwitter,
            href: menuInfo.socialTwitter,
            platform: "twitter",
            label: "X (Twitter)",
          }
        : null,
      menuInfo?.socialInstagram
        ? {
            Icon: FaInstagram,
            href: menuInfo.socialInstagram,
            platform: "instagram",
            label: "Instagram",
          }
        : null,
      menuInfo?.socialFacebook
        ? {
            Icon: FaFacebook,
            href: menuInfo.socialFacebook,
            platform: "facebook",
            label: "Facebook",
          }
        : null,
    ];

    return links.filter((link): link is MenuSocialLink => link !== null);
  }, [menuInfo]);
}
