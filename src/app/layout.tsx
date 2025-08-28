import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Toaster } from "@/components/ui/toaster";
import PWAProvider from '@/components/PWAProvider';
import ThemeScript from '@/components/ThemeScript';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: 'Santa Teresa Surf Cam',
  description: 'Transmisión en vivo de las olas de Santa Teresa, Costa Rica. Disfruta de las mejores olas en tiempo real.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Santa Teresa Surf Cam',
  },
  icons: {
    icon: [
      { url: '/wave-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/wave-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/wave-128.png', sizes: '128x128', type: 'image/png' },
      { url: '/wave-128.png', sizes: '192x192', type: 'image/png' },
      { url: '/wave-128.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/wave-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/wave-128.png', sizes: '192x192', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#3b82f6',
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
        <link rel="icon" type="image/png" sizes="32x32" href="/wave-32.png" />
        <link rel="shortcut icon" href="/wave-16.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Santa Teresa Surf Cam" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7316466179789028"
     crossorigin="anonymous"></script>
      </head>
      <body className="font-body antialiased">
        <ThemeScript />
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
          <ThemeProvider>
            <AuthProvider>
              <PWAProvider>
                {children}
                <Toaster />
              </PWAProvider>
            </AuthProvider>
          </ThemeProvider>
        </GoogleOAuthProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
