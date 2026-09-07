import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dalecom | Magazzino, officina e manutenzione",
  description: "Preparazione cantieri, mezzi, manutenzioni, ricambi e persone in un unico calendario operativo.",
};

export default function WorkshopLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
