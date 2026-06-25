"use client";

import MaintenanceView from "./MaintenanceView";
import dynamic from "next/dynamic";

const OneCardMaintenanceScreen = dynamic(
  () => import("@/components/Templates/OneCardTemplate/MaintenanceScreen"),
  { ssr: false },
);

const CoffeeMaintenanceScreen = dynamic(
  () => import("@/components/Templates/CoffeeTemplate/MaintenanceScreen"),
  { ssr: false },
);

type Props = {
  name: string;
  logo?: string | null;
  theme: string;
};

export default function ThemedMaintenanceView({ name, logo, theme }: Props) {
  switch (theme) {
    case "onecard":
      return <OneCardMaintenanceScreen name={name} logo={logo} />;
    case "coffee":
      return <CoffeeMaintenanceScreen name={name} logo={logo} />;
    default:
      return <MaintenanceView name={name} logo={logo} />;
  }
}
