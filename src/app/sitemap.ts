import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://santateresasurfcam.com'
  const locales = ['es', 'en'] as const
  const pages = [
    { path: '', priority: 1.0, changeFrequency: 'hourly' as const },
    { path: 'calculadora-tabla-surf', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: 'surf-lessons', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: 'hospedaje', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: 'restaurantes', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: 'perfil', priority: 0.6, changeFrequency: 'weekly' as const },
    { path: 'contacto', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: 'condiciones-servicio', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: 'politica-privacidad', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: 'Aiservices', priority: 0.8, changeFrequency: 'monthly' as const },
  ]

  const entries: MetadataRoute.Sitemap = []

  // Add entries for each locale
  locales.forEach((locale) => {
    pages.forEach((page) => {
      const url = page.path === '' && locale === 'es' 
        ? baseUrl 
        : locale === 'es'
        ? `${baseUrl}/${page.path}`
        : `${baseUrl}/${locale}/${page.path}`
      
      entries.push({
        url,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [
              l === 'es' ? 'es-CR' : 'en-US',
              l === 'es' && page.path === ''
                ? baseUrl
                : l === 'es'
                ? `${baseUrl}/${page.path}`
                : `${baseUrl}/${l}/${page.path}`
            ])
          ),
        },
      })
    })
  })

  return entries
}
