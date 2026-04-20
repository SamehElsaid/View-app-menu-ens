import type { IconType } from "react-icons";
import type { MenuItem } from "./menu";

export interface MenuItemOProps {
  item: MenuItem;
  index: number;
  currency: string;
  onClick: (item: MenuItem) => void;
  /** `?table=` + Pro plan — show quantity + add-to-cart on card */
  isTableOrder?: boolean;
  cartQuantity?: number;
  onAddToCart?: (item: MenuItem, quantity: number) => void;
}

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
