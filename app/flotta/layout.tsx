import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dalecom | Flotta in tempo reale",
  description: "Indicatori operativi della flotta Dalecom alimentati dalla telemetria TOPFLY.",
};

export default function FleetLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
