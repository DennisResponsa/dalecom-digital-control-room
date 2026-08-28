import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dalecom | Logista",
  description: "Pianificazione mensile di cantieri, macchine, mezzi e squadre Dalecom.",
};

export default function LogisticsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
