import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Attrezzatura 4.0 | Dalecom",
  description: "Controllo delle attrezzature Turbosol e delle sorgenti dati Cleve e Diaboard.",
};

export default function EquipmentLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
