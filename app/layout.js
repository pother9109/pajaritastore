import { Playfair_Display } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic']
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pajaritastore.vercel.app';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Pajarita Store | Moda premium en Managua',
  description:
    'Tu estilo global, ahora más cerca. Catálogo de moda premium con piezas seleccionadas y entregas disponibles en Managua.',
  openGraph: {
    title: 'Pajarita Store | Moda premium en Managua',
    description:
      'Descubre looks seleccionados, prendas exclusivas y moda premium disponible para entregas en Managua.',
    url: siteUrl,
    siteName: 'Pajarita Store',
    images: [
      {
        url: '/og-pajarita-store.png',
        width: 1200,
        height: 630,
        alt: 'Pajarita Store - Looks que te encantarán'
      }
    ],
    locale: 'es_NI',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pajarita Store | Moda premium en Managua',
    description:
      'Tu estilo global, ahora más cerca. Moda premium disponible para entregas en Managua.',
    images: ['/og-pajarita-store.png']
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={playfair.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
