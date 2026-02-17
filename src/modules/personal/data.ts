export interface PersonalNavigationItem {
  href: string;
  key: string;
  label: string;
}

export const navigationItems: PersonalNavigationItem[] = [
  { href: "/specialist/personal/overview", key: "overview", label: "Overview" },
  { href: "/specialist/personal/sessions", key: "sessions", label: "Sessions" },
  { href: "/specialist/personal/progress", key: "progress", label: "Progress" },
  { href: "/specialist/personal/documents", key: "documents", label: "Documents" },
  { href: "/specialist/personal/settings", key: "settings", label: "Settings" },
];

export const parentNavigationItems: PersonalNavigationItem[] = [
  { href: "/parent/personal/overview", key: "overview", label: "Overview" },
  { href: "/parent/personal/sessions", key: "sessions", label: "Sessions" },
  { href: "/parent/personal/progress", key: "progress", label: "Progress" },
  { href: "/parent/personal/documents", key: "documents", label: "Documents" },
  { href: "/parent/personal/settings", key: "settings", label: "Settings" },
];
