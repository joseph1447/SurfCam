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
      title: 'Clases de Surf en Santa Teresa, Costa Rica | Instructores Certificados',
      description: 'Aprende a surfear con instructores locales certificados en Santa Teresa, Costa Rica. Clases privadas desde $80, grupales y paquetes. Equipo incluido, todos los niveles.',
      keywords: [
        'clases de surf Santa Teresa',
        'surf lessons Costa Rica',
        'instructores de surf certificados',
        'aprender a surfear Santa Teresa',
        'surf school Costa Rica',
        'clases de surf principiantes',
        'surf avanzado Costa Rica',
        'Santa Teresa surf',
        'Nicoya Peninsula surf lessons'
      ],
      openGraph: {
        title: 'Clases de Surf en Santa Teresa, Costa Rica',
        description: 'Aprende a surfear con instructores locales certificados. Clases privadas desde $80, grupales y paquetes.',
        url: `${baseUrl}/surf-lessons`,
        siteName: 'Santa Teresa Surf Cam',
        locale: 'es_CR',
        type: 'website',
        images: [{ url: '/wave-128.png', width: 128, height: 128, alt: 'Clases de Surf Santa Teresa' }],
      },
      alternates: {
        canonical: `${baseUrl}/surf-lessons`,
      },
    },
    en: {
      title: 'Surf Lessons in Santa Teresa, Costa Rica | Certified Instructors',
      description: 'Learn to surf with certified local instructors in Santa Teresa, Costa Rica. Private lessons from $80, group lessons and packages. Equipment included, all levels.',
      keywords: [
        'surf lessons Santa Teresa',
        'Costa Rica surf lessons',
        'certified surf instructors',
        'learn to surf Santa Teresa',
        'surf school Costa Rica',
        'beginner surf lessons',
        'advanced surf Costa Rica',
        'Santa Teresa surf',
        'Nicoya Peninsula surf lessons'
      ],
      openGraph: {
        title: 'Surf Lessons in Santa Teresa, Costa Rica',
        description: 'Learn to surf with certified local instructors. Private lessons from $80, group lessons and packages.',
        url: `${baseUrl}/en/surf-lessons`,
        siteName: 'Santa Teresa Surf Cam',
        locale: 'en_US',
        type: 'website',
        images: [{ url: '/wave-128.png', width: 128, height: 128, alt: 'Surf Lessons Santa Teresa' }],
      },
      alternates: {
        canonical: `${baseUrl}/en/surf-lessons`,
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
