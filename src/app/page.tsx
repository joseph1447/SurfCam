import type { Metadata } from 'next';
import HomeClient from '@/components/HomeClient';

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
    url: 'https://santateresasurfcam.com',
    siteName: 'Santa Teresa Surf Cam',
    locale: 'es_CR',
    type: 'website',
    images: [
      {
        url: '/wave-128.png',
        width: 128,
        height: 128,
        alt: 'Santa Teresa Surf Cam - Transmisión en Vivo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Santa Teresa Surf Cam | Transmisión en Vivo 24/7',
    description: 'Mira las mejores olas de Santa Teresa, Costa Rica en tiempo real.',
    images: ['/wave-128.png'],
  },
  alternates: {
    canonical: 'https://santateresasurfcam.com',
  },
};

export default function HomePage() {
  return <HomeClient />;
}
