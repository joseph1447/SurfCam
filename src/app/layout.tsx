// Root layout - provides HTML structure for all routes
import './globals.css';
import type { Metadata } from 'next';

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
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Serif:wght@400;700&family=Open+Sans:wght@300;400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
        <link rel="icon" type="image/png" sizes="16x16" href="/wave-16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/wave-32.png" />
        <link rel="shortcut icon" href="/wave-16.png" />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
