import { MetadataRoute } from 'next';

const baseUrl = 'https://santateresasurfcam.com';

// Only pages that actually render under [locale]. Until 2026-10-22 this listed hospedaje,
// restaurantes, perfil and a deleted board calculator, which live outside [locale] and so
// 404 behind the next-intl middleware. /en/surf-lessons is left out on purpose: its
// canonical is santateresabook.com/surf-lessons.
const PAGES: { path: string; locales: ('es' | 'en')[]; priority: number; changeFrequency: 'hourly' | 'monthly' | 'yearly' }[] = [
  { path: '', locales: ['es', 'en'], priority: 1.0, changeFrequency: 'hourly' },
  { path: 'surf-lessons', locales: ['es'], priority: 0.8, changeFrequency: 'monthly' },
  { path: 'contacto', locales: ['es', 'en'], priority: 0.5, changeFrequency: 'monthly' },
  { path: 'condiciones-servicio', locales: ['es', 'en'], priority: 0.2, changeFrequency: 'yearly' },
  { path: 'politica-privacidad', locales: ['es', 'en'], priority: 0.2, changeFrequency: 'yearly' },
];

const url = (locale: 'es' | 'en', path: string) =>
  [baseUrl, locale === 'en' ? 'en' : '', path].filter(Boolean).join('/');

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.flatMap((page) =>
    page.locales.map((locale) => ({
      url: url(locale, page.path),
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      ...(page.locales.length > 1 && {
        alternates: {
          languages: Object.fromEntries(page.locales.map((l) => [l === 'es' ? 'es-CR' : 'en-US', url(l, page.path)])),
        },
      }),
    })),
  );
}
