// Root layout - provides HTML structure for all routes
import './globals.css';
import type { Metadata } from 'next';
import { Open_Sans, PT_Serif, JetBrains_Mono } from 'next/font/google';

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-open-sans',
});

const ptSerif = PT_Serif({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-pt-serif',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'Santa Teresa Surf Cam | Live Stream 24/7',
  description: 'Watch live surf conditions from Santa Teresa, Costa Rica',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning className={`${openSans.variable} ${ptSerif.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* DNS prefetch for YouTube (loaded lazily, no preconnect needed) */}
        <link rel="dns-prefetch" href="https://www.youtube.com" />
        <link rel="dns-prefetch" href="https://i.ytimg.com" />
        <link rel="icon" type="image/png" sizes="16x16" href="/wave-16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/wave-32.png" />
        <link rel="shortcut icon" href="/wave-16.png" />
      </head>
      <body className={openSans.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
