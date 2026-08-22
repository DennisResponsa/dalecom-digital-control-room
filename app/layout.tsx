import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dalecom | Preventivo immediato',
  description: 'Verifica disponibilità e richiedi un preventivo Dalecom in pochi passaggi.',
  openGraph: {
    title: 'Dalecom | La macchina giusta. Quando ti serve.',
    description: 'Disponibilità e preventivo immediato.',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dalecom | La macchina giusta. Quando ti serve.',
    description: 'Disponibilità e preventivo immediato.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
