import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dalecom | Regia operativa",
  description: "Un unico accesso alla demo integrata Dalecom: preventivi, flotta, persone e governance.",
};

export default function DemoLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
