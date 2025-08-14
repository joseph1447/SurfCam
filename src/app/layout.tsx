import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from "@/components/ui/toaster";
import PWAProvider from '@/components/PWAProvider';

export const metadata: Metadata = {
  title: 'Santa Teresa Surf Cam',
  description: 'Transmisión en vivo de las olas de Santa Teresa, Costa Rica. Disfruta de las mejores olas en tiempo real.',
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Santa Teresa Surf Cam',
  },
  icons: {
    icon: [
      { url: '/wave-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/wave-16.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/wave-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
        <link rel="icon" type="image/png" sizes="16x16" href="/wave-16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/wave-16.png" />
        <link rel="shortcut icon" href="/wave-16.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Santa Teresa Surf Cam" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <PWAProvider>
            {children}
            <Toaster />
          </PWAProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
