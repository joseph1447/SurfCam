import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowUpRight, HandCoins, House, Mail, Megaphone, MessageCircle, Sailboat } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { isValidLocale } from '@/i18n/config';
import { CONTACT_EMAIL, PHONE_DISPLAY, SINPE_DISPLAY, sisterUrl, whatsappUrl } from '@/lib/links';
import { SPONSORS } from '@/lib/sponsors';

type Props = { params: Promise<{ locale: string }> };
const baseUrl = 'https://santateresasurfcam.com';

// Every contact on the cam goes to Joseph (WhatsApp + SINPE Móvil). Lessons and tours are
// Santa Teresa Book's, house work is Home Care's: those cards hand off to the right site.
const COPY = {
  es: {
    title: 'Contacto',
    lead: 'La cámara es gratis y la mantenemos nosotros. Escríbenos para patrocinar, anunciar tu negocio o lo que necesites.',
    whatsTitle: 'WhatsApp',
    whatsText: 'La forma más rápida de hablar con nosotros. Respondemos el mismo día.',
    whatsMsg: 'Hola! Te escribo desde santateresasurfcam.com',
    sinpeTitle: 'Apoya la cámara',
    sinpeText: 'Si revisas las olas aquí todos los días, puedes apoyar la cámara con un SINPE Móvil de cualquier monto.',
    sponsorTitle: 'Patrocina el surf cam',
    sponsorText: (n: number) =>
      `Tu logo abre cada Short y Reel del canal (dos al día, más el resumen) y aparece en la web. Hoy nos patrocinan ${n} marcas.`,
    sponsorMsg: 'Hola! Me interesa patrocinar el Santa Teresa Surf Cam',
    sponsorCta: 'Quiero patrocinar',
    bookTitle: 'Clases de surf y tours',
    bookText: 'Se reservan en Santa Teresa Book, con instructores y guías locales.',
    bookCta: 'Ir a Santa Teresa Book',
    homeTitle: 'Mantenimiento de casas',
    homeText: 'Jardín, piscina, A/C, reparaciones y cuido de casas en la zona, con precios publicados.',
    homeCta: 'Ir a Santa Teresa Home Care',
    email: 'Correo',
  },
  en: {
    title: 'Contact',
    lead: 'The cam is free and we run it ourselves. Get in touch to sponsor it, advertise your business or anything else.',
    whatsTitle: 'WhatsApp',
    whatsText: 'The fastest way to reach us. We reply the same day.',
    whatsMsg: "Hi! I'm writing from santateresasurfcam.com",
    sinpeTitle: 'Support the cam',
    sinpeText: 'If you check the waves here every day, you can support the cam with a SINPE Móvil transfer of any amount.',
    sponsorTitle: 'Sponsor the surf cam',
    sponsorText: (n: number) =>
      `Your logo opens every Short and Reel on the channel (two a day, plus the daily recap) and shows on the site. ${n} brands sponsor us today.`,
    sponsorMsg: "Hi! I'd like to sponsor the Santa Teresa Surf Cam",
    sponsorCta: 'I want to sponsor',
    bookTitle: 'Surf lessons & tours',
    bookText: 'Booked on Santa Teresa Book, with local instructors and guides.',
    bookCta: 'Go to Santa Teresa Book',
    homeTitle: 'Home maintenance',
    homeText: 'Garden, pool, A/C, repairs and home care in the area, with published prices.',
    homeCta: 'Go to Santa Teresa Home Care',
    email: 'Email',
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const es = locale === 'es';
  return {
    title: es ? 'Contacto | Santa Teresa Surf Cam' : 'Contact | Santa Teresa Surf Cam',
    description: es
      ? 'Contacta al Santa Teresa Surf Cam por WhatsApp: patrocinios, publicidad y apoyo a la cámara por SINPE Móvil.'
      : 'Contact the Santa Teresa Surf Cam on WhatsApp: sponsorships, advertising and supporting the cam.',
    alternates: {
      canonical: es ? `${baseUrl}/contacto` : `${baseUrl}/en/contacto`,
      languages: { 'es-CR': `${baseUrl}/contacto`, 'en-US': `${baseUrl}/en/contacto` },
    },
  };
}

const card = 'surface-panel relative flex flex-col gap-2 rounded-2xl p-6';
const icon = 'flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-white/10';

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const lang = locale === 'en' ? 'en' : 'es';
  const c = COPY[lang];

  return (
    <>
      <AppHeader />
      <main className="container mx-auto max-w-5xl space-y-8 px-4 pb-16 pt-10 md:px-8">
        <header className="fade-in-up">
          <h1 className="font-headline text-4xl font-semibold text-white md:text-5xl">{c.title}</h1>
          <p className="mt-3 max-w-2xl text-white/70">{c.lead}</p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <section className={card}>
            <span className={icon} style={{ background: '#25D36622', color: '#25D366' }} aria-hidden>
              <MessageCircle className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-semibold text-white">{c.whatsTitle}</h2>
            <p className="text-sm text-white/65">{c.whatsText}</p>
            <a href={whatsappUrl(c.whatsMsg)} target="_blank" rel="noopener" className="mt-1 w-fit font-mono text-lg text-[#25D366] hover:text-white">
              {PHONE_DISPLAY}
            </a>
          </section>

          <section className={card}>
            <span className={icon} style={{ background: '#FF6A0022', color: '#FF6A00' }} aria-hidden>
              <HandCoins className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-semibold text-white">{c.sinpeTitle}</h2>
            <p className="text-sm text-white/65">{c.sinpeText}</p>
            <p className="mt-1 font-mono text-lg text-white">
              SINPE Móvil · <span className="text-[#FF8A3D]">{SINPE_DISPLAY}</span>
            </p>
          </section>

          <section className={`${card} md:col-span-2`}>
            <span className={icon} style={{ background: '#D9B98C22', color: '#D9B98C' }} aria-hidden>
              <Megaphone className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-semibold text-white">{c.sponsorTitle}</h2>
            <p className="max-w-2xl text-sm text-white/65">{c.sponsorText(SPONSORS.length)}</p>
            <p className="font-mono text-xs text-white/45">{SPONSORS.map((s) => s.name).join(' · ')}</p>
            <a
              href={whatsappUrl(c.sponsorMsg)}
              target="_blank"
              rel="noopener"
              className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-[#FF6A00] px-5 py-2.5 text-sm font-semibold text-[#0A0C10] hover:bg-[#FF8A3D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              {c.sponsorCta}
            </a>
          </section>

          <section className={card}>
            <span className={icon} style={{ background: '#00AAFF22', color: '#00AAFF' }} aria-hidden>
              <Sailboat className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-semibold text-white">{c.bookTitle}</h2>
            <p className="text-sm text-white/65">{c.bookText}</p>
            <a href={sisterUrl('book', 'contact', lang, '/')} className="mt-1 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-[#00AAFF] hover:text-white">
              {c.bookCta}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
          </section>

          <section className={card}>
            <span className={icon} style={{ background: '#00AAFF22', color: '#00AAFF' }} aria-hidden>
              <House className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-semibold text-white">{c.homeTitle}</h2>
            <p className="text-sm text-white/65">{c.homeText}</p>
            <a href={sisterUrl('homecare', 'contact', lang)} className="mt-1 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-[#00AAFF] hover:text-white">
              {c.homeCta}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
          </section>
        </div>

        <p className="flex items-center gap-2 text-sm text-white/60">
          <Mail className="h-4 w-4" aria-hidden />
          {c.email}:{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-white/80 hover:text-white">
            {CONTACT_EMAIL}
          </a>
        </p>
      </main>
    </>
  );
}
