import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isValidLocale } from '@/i18n/config';
import { CONTACT_EMAIL, WHATSAPP_NUMBER } from '@/lib/links';
import SurfLessonsContent, { FAQ, LESSONS } from './SurfLessonsContent';

type Props = {
  params: Promise<{ locale: string }>;
};

const baseUrl = 'https://santateresasurfcam.com';
const BOOK = 'https://santateresabook.com';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  if (locale === 'en') {
    // Book already has the English page; point Google there instead of competing with it.
    return {
      title: 'Surf Lessons in Santa Teresa, Costa Rica — From $55',
      description: 'Group, private and kids surf lessons at Playa Carmen, Santa Teresa. Certified local instructors, max 3 students per coach, all gear included. Book on Santa Teresa Book.',
      alternates: { canonical: `${BOOK}/surf-lessons` },
    };
  }
  return {
    title: 'Clases de Surf en Santa Teresa, Costa Rica | Desde $55',
    description: 'Clases de surf grupales, privadas y para niños en Playa Carmen, Santa Teresa. Instructores locales certificados, máximo 3 alumnos por instructor y equipo incluido. Mira las olas en vivo y reserva.',
    keywords: ['clases de surf Santa Teresa', 'clases de surf Costa Rica', 'aprender a surfear Santa Teresa', 'escuela de surf Santa Teresa', 'clases de surf Playa Carmen', 'clases de surf para niños Costa Rica', 'tours Santa Teresa'],
    openGraph: {
      title: 'Clases de Surf en Santa Teresa | Desde $55',
      description: 'Grupales, privadas y para niños en Playa Carmen. Equipo incluido, máximo 3 alumnos por instructor.',
      url: `${baseUrl}/surf-lessons`,
      siteName: 'Santa Teresa Surf Cam',
      locale: 'es_CR',
      type: 'website',
    },
    alternates: { canonical: `${baseUrl}/surf-lessons` },
  };
}

export default async function SurfLessonsPage({ params }: Props) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const lang = locale === 'en' ? 'en' : 'es';

  // The lessons belong to Santa Teresa Book: same entity, phone and prices as that site.
  const provider = {
    '@type': 'TravelAgency',
    name: 'Santa Teresa Book',
    url: BOOK,
    telephone: `+${WHATSAPP_NUMBER}`,
    email: CONTACT_EMAIL,
    address: { '@type': 'PostalAddress', addressLocality: 'Santa Teresa', addressRegion: 'Puntarenas', addressCountry: 'CR' },
  };
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      serviceType: lang === 'es' ? 'Clases de surf' : 'Surf lessons',
      areaServed: ['Santa Teresa', 'Mal País', 'Playa Carmen', 'Playa Hermosa'],
      provider,
      offers: LESSONS.map((l) => ({
        '@type': 'Offer',
        name: l[lang].name,
        description: `${l[lang].duration} · ${l[lang].size}`,
        price: String(l.price),
        priceCurrency: 'USD',
        url: `${BOOK}/tours/${l.slug}`,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ[lang].map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ];

  return (
    <>
      <SurfLessonsContent locale={lang} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
