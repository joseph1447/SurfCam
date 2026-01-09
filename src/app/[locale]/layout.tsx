import '../globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { isValidLocale } from '@/i18n/config';
import { ThemeProvider } from '@/context/ThemeContext';
import { Toaster } from "@/components/ui/toaster";
import PWAProvider from '@/components/PWAProvider';
import ThemeScript from '@/components/ThemeScript';
import Footer from '@/components/Footer';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from '@vercel/analytics/next';
import type { Metadata, Viewport } from 'next';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

const baseUrl = 'https://santateresasurfcam.com';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  
  if (!isValidLocale(locale)) {
    notFound();
  }

  const metadataMap: Record<string, Metadata> = {
    es: {
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
      openGraph: {
        title: 'Santa Teresa Surf Cam | Transmisión en Vivo 24/7',
        description: 'Mira las mejores olas de Santa Teresa, Costa Rica en tiempo real. Surf cam en vivo con chat interactivo y datos de mareas.',
        url: baseUrl,
        siteName: 'Santa Teresa Surf Cam',
        locale: 'es_CR',
        type: 'website',
        images: [{ url: '/wave-128.png', width: 128, height: 128, alt: 'Santa Teresa Surf Cam Logo' }],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Santa Teresa Surf Cam | Transmisión en Vivo 24/7',
        description: 'Mira las mejores olas de Santa Teresa, Costa Rica en tiempo real.',
        images: ['/wave-128.png'],
      },
    },
    en: {
      title: 'Santa Teresa Surf Cam | 24/7 Live Stream | Costa Rica',
      description: 'Watch the best waves of Santa Teresa, Costa Rica in real time. 24/7 live surf cam with interactive chat, tide data and surfer reports. HD quality on Twitch and YouTube.',
      keywords: [
        'Santa Teresa surf cam',
        'Costa Rica surf',
        'live surf',
        'Santa Teresa waves',
        'Costa Rica surf cam',
        'surf live stream',
        'Nicoya Peninsula',
        'Puntarenas surf',
        'surf conditions Costa Rica',
        'live surf cam',
        'surf webcam',
        'Costa Rica waves',
        'Santa Teresa beach',
        'surf forecast Costa Rica'
      ],
      openGraph: {
        title: 'Santa Teresa Surf Cam | 24/7 Live Stream',
        description: 'Watch the best waves of Santa Teresa, Costa Rica in real time. Live surf cam with interactive chat and tide data.',
        url: baseUrl,
        siteName: 'Santa Teresa Surf Cam',
        locale: 'en_US',
        type: 'website',
        images: [{ url: '/wave-128.png', width: 128, height: 128, alt: 'Santa Teresa Surf Cam Logo' }],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Santa Teresa Surf Cam | 24/7 Live Stream',
        description: 'Watch the best waves of Santa Teresa, Costa Rica in real time.',
        images: ['/wave-128.png'],
      },
    },
  };

  const baseMetadata = {
    authors: [{ name: 'Santa Teresa Surf Cam' }],
    creator: 'Santa Teresa Surf Cam',
    publisher: 'Santa Teresa Surf Cam',
    formatDetection: { email: false, address: false, telephone: false },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: locale === 'es' ? baseUrl : `${baseUrl}/${locale}`,
      languages: {
        'es-CR': baseUrl,
        'en-US': `${baseUrl}/en`,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    manifest: '/manifest.json',
    appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Santa Teresa Surf Cam' },
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

  return { ...baseMetadata, ...metadataMap[locale] };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#3b82f6',
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  
  if (!isValidLocale(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Serif:wght@400;700&family=Open+Sans:wght@300;400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
        <link rel="icon" type="image/png" sizes="16x16" href="/wave-16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/wave-32.png" />
        <link rel="shortcut icon" href="/wave-16.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Santa Teresa Surf Cam" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1542717605257272" crossOrigin="anonymous"></script>
        
        {/* Google Tag Manager */}
        <script dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PBK4JCWB');`
        }} />
        
        {/* Hreflang tags for SEO */}
        <link rel="alternate" hrefLang="es-CR" href={baseUrl} />
        <link rel="alternate" hrefLang="en-US" href={`${baseUrl}/en`} />
        <link rel="alternate" hrefLang="x-default" href={baseUrl} />
      </head>
      <body className="font-body antialiased">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-PBK4JCWB"
            height="0" 
            width="0" 
            style={{display: 'none', visibility: 'hidden'}}
          />
        </noscript>
        
        <ThemeScript />
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <PWAProvider>
              <div className="flex flex-col min-h-screen relative">
                {children}
                <Footer />
              </div>
              <Toaster />
            </PWAProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}

