import type { Metadata } from 'next';
import HomeClient from '@/components/HomeClient';
import { getTranslations } from 'next-intl/server';
import { isValidLocale, locales } from '@/i18n/config';
import { notFound } from 'next/navigation';

type Props = {
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
      title: 'Santa Teresa Surf Cam | Webcam en Vivo 24/7, Costa Rica',
      description: 'Webcam en vivo 24/7 de la playa de Santa Teresa, Costa Rica. Mira las olas, el swell, el viento y la marea ahora mismo antes de entrar al agua. Gratis y sin registro.',
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
        'surf conditions Costa Rica',
        'live surf cam',
        'surf webcam',
        'Costa Rica waves',
        'Santa Teresa beach',
        'surf forecast Costa Rica'
      ],
      openGraph: {
        title: 'Santa Teresa Surf Cam | Transmisión en Vivo 24/7',
        description: 'Mira las mejores olas de Santa Teresa, Costa Rica en tiempo real. Surf cam en vivo con chat interactivo y datos de mareas.',
        url: baseUrl,
        siteName: 'Santa Teresa Surf Cam',
        locale: 'es_CR',
        type: 'website',
        images: [{ url: '/og-surfcam.jpg', width: 1200, height: 630, alt: 'Santa Teresa Surf Cam - Transmisión en Vivo' }],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Santa Teresa Surf Cam | Transmisión en Vivo 24/7',
        description: 'Mira las mejores olas de Santa Teresa, Costa Rica en tiempo real.',
        images: ['/og-surfcam.jpg'],
      },
      alternates: {
        canonical: baseUrl,
      },
    },
    en: {
      title: 'Santa Teresa Surf Cam: Costa Rica Live Beach Cam 24/7',
      description: 'Live surf and beach cam from Santa Teresa, Costa Rica, 24/7. See the waves, swell, wind and tide right now before you paddle out. Free, no sign-up.',
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
        url: `${baseUrl}/en`,
        siteName: 'Santa Teresa Surf Cam',
        locale: 'en_US',
        type: 'website',
        images: [{ url: '/og-surfcam.jpg', width: 1200, height: 630, alt: 'Santa Teresa Surf Cam - Live Stream' }],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Santa Teresa Surf Cam | 24/7 Live Stream',
        description: 'Watch the best waves of Santa Teresa, Costa Rica in real time.',
        images: ['/og-surfcam.jpg'],
      },
      alternates: {
        canonical: `${baseUrl}/en`,
      },
    },
  };

  return metadataMap[locale];
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  
  if (!isValidLocale(locale)) {
    notFound();
  }

  return <HomeClient />;
}

