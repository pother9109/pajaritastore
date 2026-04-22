import { Playfair_Display } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic']
});

export const metadata = {
  title: 'Pajarita Store | Catálogo',
  description: 'Catálogo web responsivo conectado a Google Sheets.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={playfair.className}>{children}</body>
    </html>
  );
}
