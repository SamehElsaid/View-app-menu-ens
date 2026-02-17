export interface ClientNavigationItem {
  key: string;
  label: string;
}

export const clientNavigationItems: ClientNavigationItem[] = [
  { key: "overview", label: "Overview" },
  { key: "sessions", label: "Sessions" },
  { key: "progress", label: "Progress" },
  { key: "documents", label: "Documents" },
];
