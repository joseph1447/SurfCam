import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { Toaster } from "@/components/ui/toaster";
import PWAProvider from '@/components/PWAProvider';
import ThemeScript from '@/components/ThemeScript';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: 'Santa Teresa Surf Cam | Transmisión en Vivo 24/7 | Costa Rica',
  description: 'Mira las mejores olas de Santa Teresa, Costa Rica en tiempo real. Surf cam en vivo 24/7 con chat interactivo, datos de mareas y reportes de surfistas. Calidad HD en Twitch y YouTube.',
  keywords: [
    'Santa Teresa surf cam',
    'Costa Rica surf',
    'surf en vivo',
    'olas Santa Teresa',
    'surf cam Costa Rica',
    'transmisión surf',
    'surf live stream',
    'Nicoya Peninsula',
    'Puntarenas surf',
    'surf conditions Costa Rica'
  ],
  authors: [{ name: 'Santa Teresa Surf Cam' }],
  creator: 'Santa Teresa Surf Cam',
  publisher: 'Santa Teresa Surf Cam',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://santateresasurfcam.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Santa Teresa Surf Cam | Transmisión en Vivo 24/7',
    description: 'Mira las mejores olas de Santa Teresa, Costa Rica en tiempo real. Surf cam en vivo con chat interactivo y datos de mareas.',
    url: 'https://santateresasurfcam.com',
    siteName: 'Santa Teresa Surf Cam',
    locale: 'es_CR',
    type: 'website',
    images: [
      {
        url: '/wave-128.png',
        width: 128,
        height: 128,
        alt: 'Santa Teresa Surf Cam Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Santa Teresa Surf Cam | Transmisión en Vivo 24/7',
    description: 'Mira las mejores olas de Santa Teresa, Costa Rica en tiempo real.',
    images: ['/wave-128.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
     crossOrigin="anonymous"></script>
      </head>
      <body className="font-body antialiased">
        <ThemeScript />
        <ThemeProvider>
          <PWAProvider>
            {children}
            <Toaster />
          </PWAProvider>
        </ThemeProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
