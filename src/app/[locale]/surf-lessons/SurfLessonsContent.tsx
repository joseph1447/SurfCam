import AppHeader from '@/components/AppHeader';
import { Link } from '@/i18n/routing';
import { ArrowUpRight, CalendarCheck, Clock, MessageCircle, Radio, Users } from 'lucide-react';
import { PHONE_DISPLAY, sisterUrl, whatsappUrl } from '@/lib/links';

// Spanish-language front door for santateresabook's surf lessons (Book is English-only).
// Prices, durations and group sizes mirror santateresabook/src/lib/tours.ts; every booking
// button lands on Book's own form, so the lead goes into its sheet with utm_content=surf-lessons.
type Locale = 'es' | 'en';

export const LESSONS = [
  {
    slug: 'group-surf-lesson',
    price: 65,
    es: { name: 'Clase grupal', duration: '90 minutos', size: 'Máx. 3 alumnos por instructor', text: 'En Playa Carmen, la mejor ola para aprender de la zona: larga, lenta y con fondo de arena.' },
    en: { name: 'Group lesson', duration: '90 minutes', size: 'Max 3 students per coach', text: 'At Playa Carmen, the best beginner wave around: long, slow and sandy-bottomed.' },
  },
  {
    slug: 'private-surf-lesson',
    price: 85,
    es: { name: 'Clase privada', duration: '90 minutos', size: '1 alumno, 1 instructor', text: 'Toda la atención del coach. El instructor elige la playa según las condiciones del día.' },
    en: { name: 'Private lesson', duration: '90 minutes', size: '1 student, 1 coach', text: "All of the coach's attention. Your instructor picks the beach for the day's conditions." },
  },
  {
    slug: 'kids-surf-lesson',
    price: 55,
    es: { name: 'Clase para niños', duration: '60 minutos', size: 'Máx. 2 niños por instructor', text: 'Desde los 5 años, con tablas suaves y la parte más tranquila de Playa Carmen.' },
    en: { name: 'Kids lesson', duration: '60 minutes', size: 'Max 2 kids per coach', text: 'Ages 5 and up, soft boards and the mellowest part of Playa Carmen.' },
  },
  {
    slug: 'surf-package-5-day',
    price: 275,
    es: { name: 'Paquete de 5 días', duration: '1 clase por día', size: 'Grupal o privada', text: 'Para pasar de pararte en la espuma a remar y agarrar tus propias olas.' },
    en: { name: '5-day package', duration: '1 lesson a day', size: 'Group or private', text: 'From standing up in the whitewater to paddling into your own waves.' },
  },
] as const;

const TOURS = {
  es: ['Isla Tortuga', 'Bioluminiscencia al atardecer', 'Cuadraciclo y cataratas de Montezuma', 'Cabalgata al atardecer'],
  en: ['Tortuga Island', 'Sunset bioluminescence', 'ATV + Montezuma waterfall', 'Sunset horseback ride'],
};

export const FAQ = {
  es: [
    { q: '¿Necesito experiencia previa?', a: 'No. La clase grupal está pensada para tu primera vez: empieza con 15 minutos en la arena sobre seguridad, remada y cómo pararte, y en el agua el instructor te elige las olas y te empuja.' },
    { q: '¿Qué incluye la clase?', a: 'Instructor local certificado, tabla suave a tu medida, lycra y leash. Solo trae traje de baño, toalla y agua.' },
    { q: '¿Cuál es la mejor hora para surfear en Santa Teresa?', a: 'Temprano en la mañana y al atardecer, cuando el viento suele estar suave. Antes de reservar puedes ver las olas y el viento en vivo en la cámara de esta página.' },
    { q: '¿Cómo reservo y pago?', a: 'Reservas en línea en Santa Teresa Book y te confirmamos por WhatsApp. Pagas en efectivo, por SINPE Móvil o con un link de pago con tarjeta.' },
    { q: '¿Dan clases todos los días?', a: 'Sí, los 7 días de la semana. El horario se ajusta a la marea y al viento de cada día.' },
  ],
  en: [
    { q: 'Do I need any experience?', a: 'No. The group lesson is built for first-timers: 15 minutes on the sand covering safety, paddling and the pop-up, then your coach picks your waves and pushes you in.' },
    { q: "What's included?", a: 'A certified local instructor, a soft-top board sized for you, rash guard and leash. Just bring a swimsuit, towel and water.' },
    { q: 'When is the best time to surf in Santa Teresa?', a: 'Early morning and around sunset, when the wind is usually light. Check the waves and wind live on the cam before you book.' },
    { q: 'How do I book and pay?', a: "Book online on Santa Teresa Book and we confirm on WhatsApp. Pay in cash, by SINPE Móvil or with a card payment link." },
    { q: 'Do you teach every day?', a: "Yes, 7 days a week. Lesson times follow each day's tide and wind." },
  ],
};

const COPY = {
  es: {
    eyebrow: 'Playa Carmen · Santa Teresa · Costa Rica',
    title: 'Clases de surf en Santa Teresa',
    lead: 'Instructores locales certificados, grupos de máximo 3 alumnos y todo el equipo incluido. Mira el mar en vivo y reserva la clase en Santa Teresa Book.',
    book: 'Reservar clase',
    live: 'Ver las olas en vivo',
    from: 'desde',
    perPerson: 'por persona',
    reserve: 'Reservar',
    ask: 'Preguntar por WhatsApp',
    askText: (name: string) => `Hola! Me interesa la ${name.toLowerCase()} de surf en Santa Teresa`,
    lessonsTitle: 'Elige tu clase',
    liveTitle: 'Antes de reservar, mira el mar',
    liveText: 'La cámara transmite Playa Carmen todo el día con swell, viento y marea al lado. Si el viento está suave y la marea sube, es buen momento para tu clase.',
    liveCta: 'Abrir la cámara en vivo',
    toursTitle: 'Y cuando salgas del agua',
    toursText: 'Los mismos guías locales organizan tours por la península. Reservas igual, en Santa Teresa Book.',
    toursCta: 'Ver todos los tours',
    faqTitle: 'Preguntas frecuentes',
    contactTitle: '¿Dudas antes de reservar?',
    contactText: 'Escríbenos por WhatsApp y te respondemos el mismo día.',
    external: '(se abre en Santa Teresa Book)',
  },
  en: {
    eyebrow: 'Playa Carmen · Santa Teresa · Costa Rica',
    title: 'Surf lessons in Santa Teresa',
    lead: 'Certified local instructors, max 3 students per coach and all gear included. Watch the ocean live, then book on Santa Teresa Book.',
    book: 'Book a lesson',
    live: 'Watch the waves live',
    from: 'from',
    perPerson: 'per person',
    reserve: 'Book',
    ask: 'Ask on WhatsApp',
    askText: (name: string) => `Hi! I'm interested in a ${name.toLowerCase()} in Santa Teresa`,
    lessonsTitle: 'Pick your lesson',
    liveTitle: 'Check the ocean before you book',
    liveText: 'The cam streams Playa Carmen all day with swell, wind and tide alongside. Light wind and a rising tide make a good window for your lesson.',
    liveCta: 'Open the live cam',
    toursTitle: 'And once you are out of the water',
    toursText: 'The same local guides run tours around the peninsula. Book them the same way, on Santa Teresa Book.',
    toursCta: 'See all tours',
    faqTitle: 'FAQ',
    contactTitle: 'Questions before booking?',
    contactText: "Message us on WhatsApp and we'll answer the same day.",
    external: '(opens Santa Teresa Book)',
  },
};

const pill = 'inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white';

export default function SurfLessonsContent({ locale }: { locale: Locale }) {
  const c = COPY[locale];
  const book = (path: string) => sisterUrl('book', 'surf-lessons', locale, path);

  return (
    <>
      <AppHeader />
      <main className="container mx-auto max-w-6xl space-y-14 px-4 pb-16 pt-10 md:px-8">
        <section className="fade-in-up">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#00AAFF]">{c.eyebrow}</p>
          <h1 className="mt-2 font-headline text-4xl font-semibold tracking-tight text-white md:text-6xl">{c.title}</h1>
          <p className="mt-4 max-w-2xl text-base text-white/70 md:text-lg">{c.lead}</p>
          <ul className="mt-6 flex flex-wrap gap-2 font-mono text-xs text-white/70">
            <li className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5"><span className="text-[#FF6A00]">$55+</span></li>
            <li className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5"><Clock className="h-3.5 w-3.5" aria-hidden />60–90 min</li>
            <li className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5"><Users className="h-3.5 w-3.5" aria-hidden />3:1</li>
            <li className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5"><CalendarCheck className="h-3.5 w-3.5" aria-hidden />7/7</li>
          </ul>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href={book('/surf-lessons')} className={`${pill} bg-[#FF6A00] text-[#0A0C10] hover:bg-[#FF8A3D]`}>
              {c.book}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
              <span className="sr-only">{c.external}</span>
            </a>
            <Link href="/" className={`${pill} border border-white/15 text-white hover:bg-white/5`}>
              <Radio className="h-4 w-4 text-[#FF6A00]" aria-hidden />
              {c.live}
            </Link>
          </div>
        </section>

        <section aria-labelledby="lessons-title">
          <h2 id="lessons-title" className="font-headline text-2xl font-semibold text-white md:text-3xl">{c.lessonsTitle}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LESSONS.map((l) => {
              const t = l[locale];
              return (
                <article key={l.slug} className="surface-panel flex flex-col rounded-2xl p-5">
                  <h3 className="text-lg font-semibold text-white">{t.name}</h3>
                  <p className="mt-1 font-mono text-[11px] tracking-wide text-[#D9B98C]">{t.duration} · {t.size}</p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-white/65">{t.text}</p>
                  <p className="mt-4 text-white">
                    <span className="text-xs text-white/50">{c.from} </span>
                    <span className="font-headline text-3xl font-semibold">${l.price}</span>
                    <span className="text-xs text-white/50"> USD {l.slug === 'surf-package-5-day' ? '' : c.perPerson}</span>
                  </p>
                  <a href={book(`/tours/${l.slug}`)} className={`${pill} mt-4 justify-center bg-[#00AAFF] text-[#06101A] hover:bg-[#33BBFF]`}>
                    {c.reserve}
                    <ArrowUpRight className="h-4 w-4" aria-hidden />
                    <span className="sr-only">{t.name} {c.external}</span>
                  </a>
                  <a href={whatsappUrl(c.askText(t.name))} target="_blank" rel="noopener" className="mt-2 text-center text-xs text-white/55 underline-offset-4 hover:text-white hover:underline">
                    {c.ask}
                  </a>
                </article>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="surface-panel rounded-2xl p-6">
            <h2 className="font-headline text-2xl font-semibold text-white">{c.liveTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/65">{c.liveText}</p>
            <Link href="/" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#FF8A3D] hover:text-white">
              <Radio className="h-4 w-4" aria-hidden />
              {c.liveCta}
            </Link>
          </div>
          <div className="surface-panel rounded-2xl p-6">
            <h2 className="font-headline text-2xl font-semibold text-white">{c.toursTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/65">{c.toursText}</p>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-white/80">
              {TOURS[locale].map((tour) => <li key={tour}>· {tour}</li>)}
            </ul>
            <a href={book('/tours')} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#00AAFF] hover:text-white">
              {c.toursCta}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
              <span className="sr-only">{c.external}</span>
            </a>
          </div>
        </section>

        <section aria-labelledby="faq-title" className="max-w-3xl">
          <h2 id="faq-title" className="font-headline text-2xl font-semibold text-white md:text-3xl">{c.faqTitle}</h2>
          <div className="mt-5 divide-y divide-white/10 border-y border-white/10">
            {FAQ[locale].map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00AAFF]">
                  {f.q}
                  <span className="text-[#00AAFF] transition-transform group-open:rotate-45" aria-hidden>+</span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="surface-panel flex flex-col items-start justify-between gap-4 rounded-2xl p-6 md:flex-row md:items-center">
          <div>
            <h2 className="font-headline text-2xl font-semibold text-white">{c.contactTitle}</h2>
            <p className="mt-1 text-sm text-white/65">{c.contactText}</p>
          </div>
          <a href={whatsappUrl(c.askText(LESSONS[0][locale].name))} target="_blank" rel="noopener" className={`${pill} bg-[#25D366] text-[#06101A] hover:bg-[#4BE07F]`}>
            <MessageCircle className="h-4 w-4" aria-hidden />
            {PHONE_DISPLAY}
          </a>
        </section>
      </main>
    </>
  );
}
