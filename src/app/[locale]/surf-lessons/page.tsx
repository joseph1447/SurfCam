import type { Metadata } from 'next';
import AppHeader from '@/components/AppHeader';
import SurfLessonsClient from './SurfLessonsClient';
import { isValidLocale } from '@/i18n/config';
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
      title: 'Clases de Surf Santa Teresa Costa Rica | $70 por persona',
      description: 'Aprende a surfear en Santa Teresa con instructores locales experimentados. Tarifa única de $70 por persona, clases privadas y grupales. Equipo incluido, transporte disponible, todos los niveles. ¡Reserva tu clase hoy!',
      keywords: [
        'clases de surf Santa Teresa',
        'surf lessons Santa Teresa Costa Rica',
        'aprender a surfear Santa Teresa',
        'escuela de surf Costa Rica',
        'clases de surf principiantes Costa Rica',
        'surf Santa Teresa precios',
        'Nicoya Peninsula surf lessons',
        'clases de surf baratas Costa Rica',
        'surf camp Santa Teresa',
        'clases surf playa Santa Teresa',
        'surf Costa Rica precio',
        'paquetes surf Costa Rica',
        'surf lessons near me',
        'surf school Puntarenas',
        'aprender surf Costa Rica'
      ],
      openGraph: {
        title: 'Clases de Surf Santa Teresa | $70/persona',
        description: 'Aprende a surfear en Santa Teresa con instructores locales. Tarifa única de $70 por persona, privadas o grupales. Equipo incluido, todos los niveles.',
        url: `${baseUrl}/surf-lessons`,
        siteName: 'Santa Teresa Surf Cam',
        locale: 'es_CR',
        type: 'website',
        images: [{ url: '/wave-128.png', width: 128, height: 128, alt: 'Clases de Surf Santa Teresa Costa Rica' }],
      },
      alternates: {
        canonical: `${baseUrl}/surf-lessons`,
        languages: {
          'es-CR': `${baseUrl}/surf-lessons`,
          'en-US': `${baseUrl}/en/surf-lessons`,
        },
      },
    },
    en: {
      title: 'Surf Lessons Santa Teresa Costa Rica | $70 per person',
      description: 'Learn to surf in Santa Teresa with experienced local instructors. Flat rate of $70 per person, private or group lessons. Equipment included, transportation available, all levels. Book your lesson today!',
      keywords: [
        'surf lessons Santa Teresa',
        'Costa Rica surf lessons',
        'learn to surf Santa Teresa',
        'surf school Costa Rica',
        'beginner surf lessons Costa Rica',
        'Santa Teresa surf prices',
        'Nicoya Peninsula surf lessons',
        'cheap surf lessons Costa Rica',
        'surf camp Santa Teresa',
        'Santa Teresa beach surf lessons',
        'Costa Rica surf price',
        'surf packages Costa Rica',
        'best surf school Costa Rica',
        'Santa Teresa surfing',
        'Puntarenas surf lessons'
      ],
      openGraph: {
        title: 'Surf Lessons Santa Teresa | $70/person',
        description: 'Learn to surf in Santa Teresa with local instructors. Flat $70 per person, private or group. Equipment included, all levels.',
        url: `${baseUrl}/en/surf-lessons`,
        siteName: 'Santa Teresa Surf Cam',
        locale: 'en_US',
        type: 'website',
        images: [{ url: '/wave-128.png', width: 128, height: 128, alt: 'Surf Lessons Santa Teresa Costa Rica' }],
      },
      alternates: {
        canonical: `${baseUrl}/en/surf-lessons`,
        languages: {
          'es-CR': `${baseUrl}/surf-lessons`,
          'en-US': `${baseUrl}/en/surf-lessons`,
        },
      },
    },
  };

  return metadataMap[locale];
}

export default async function SurfLessonsPage({ params }: Props) {
  const { locale } = await params;
  
  if (!isValidLocale(locale)) {
    notFound();
  }

  return <SurfLessonsClient />;
}
