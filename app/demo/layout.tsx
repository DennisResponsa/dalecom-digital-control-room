import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dalecom Digital Control Room",
  description: "Un solo flusso. Tutto sotto controllo: preventivi, flotta, persone e governance Dalecom.",
  openGraph: {
    title: "Dalecom Digital Control Room",
    description: "Un solo flusso. Tutto sotto controllo: preventivi, flotta, persone e governance Dalecom.",
    url: "https://dalecom-digital-control-room.dalecom-control-room.workers.dev/demo",
    images: [{ url: "https://dalecom-digital-control-room.dalecom-control-room.workers.dev/og-control-room.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dalecom Digital Control Room",
    description: "Un solo flusso. Tutto sotto controllo: preventivi, flotta, persone e governance Dalecom.",
    images: ["https://dalecom-digital-control-room.dalecom-control-room.workers.dev/og-control-room.png"],
  },
};

export default function DemoLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
