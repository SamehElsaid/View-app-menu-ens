import type { IconType } from "react-icons";

export interface LogoProps {
  variant?: "default" | "white";
}

export interface ContactInfo {
  icon: IconType;
  type: "phone" | "email" | "address";
  value: string;
  href?: string;
  dir?: "ltr" | "rtl";
}

export interface NavLink {
  name: string;
  path: string;
  external?: boolean;
}

export interface LinkProps {
  title: string;
  href: string;
  icon: IconType;
}
