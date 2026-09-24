// Root layout - provides HTML structure for all routes
import './globals.css';
import type { Metadata } from 'next';
import { IBM_Plex_Sans, Playfair_Display, JetBrains_Mono } from 'next/font/google';

// The SurfCam type system (see CLAUDE.md): Playfair headlines, Plex body, JetBrains data.
const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-body',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
  variable: '--font-headline',
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
    <html lang="es" suppressHydrationWarning className={`${plexSans.variable} ${playfair.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* DNS prefetch for YouTube (loaded lazily, no preconnect needed) */}
        <link rel="dns-prefetch" href="https://www.youtube.com" />
        <link rel="dns-prefetch" href="https://i.ytimg.com" />
        <link rel="icon" type="image/png" sizes="16x16" href="/wave-16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/wave-32.png" />
        <link rel="shortcut icon" href="/wave-16.png" />
      </head>
      <body className={plexSans.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
