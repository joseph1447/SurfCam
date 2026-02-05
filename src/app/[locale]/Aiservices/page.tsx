import type { Metadata } from 'next';
import AppHeader from '@/components/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Code, 
  Globe, 
  Smartphone, 
  ShoppingCart, 
  Shield, 
  MessageSquare, 
  Zap, 
  Database, 
  Layers,
  CheckCircle2,
  Mail,
  ArrowRight,
  Rocket,
  Users,
  TrendingUp,
  Webcam
} from 'lucide-react';
import { Link } from '@/i18n/routing';
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
      title: 'AIServices Santa Teresa | Desarrollo Web y Marketing Digital | Costa Rica',
      description: 'Servicios de desarrollo web, marketing digital y presencia online para negocios en Santa Teresa, Costa Rica. Landing pages desde $30/mes con hosting incluido. Next.js, React, TypeScript.',
      keywords: [
        'web development Santa Teresa Costa Rica',
        'digital marketing Santa Teresa',
        'sitio web Santa Teresa',
        'presencia online Costa Rica',
        'desarrollo web Puntarenas',
        'marketing digital Nicoya Peninsula',
        'PWA development Costa Rica',
        'live streaming integration',
        'e-commerce development Costa Rica',
        'authentication systems development',
        'Next.js developer Santa Teresa',
        'React development Costa Rica',
        'AI marketing automation Costa Rica',
        'landing page generator',
        'component library development',
        'full-stack developer Santa Teresa',
        'TypeScript developer Costa Rica'
      ],
      openGraph: {
        title: 'AIServices Santa Teresa | Desarrollo Web y Marketing Digital',
        description: 'Servicios profesionales de desarrollo web y marketing digital para negocios en Santa Teresa, Costa Rica. Desde $30/mes.',
        url: `${baseUrl}/Aiservices`,
        siteName: 'AIServices Santa Teresa',
        locale: 'es_CR',
        type: 'website',
        images: [
          {
            url: '/wave-128.png',
            width: 128,
            height: 128,
            alt: 'AIServices Santa Teresa',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'AIServices Santa Teresa | Desarrollo Web y Marketing Digital',
        description: 'Servicios profesionales de desarrollo web para negocios en Santa Teresa, Costa Rica.',
        images: ['/wave-128.png'],
      },
      alternates: {
        canonical: `${baseUrl}/Aiservices`,
      },
    },
    en: {
      title: 'AIServices Santa Teresa | Web Development & Digital Marketing | Costa Rica',
      description: 'Web development, digital marketing and online presence services for businesses in Santa Teresa, Costa Rica. Landing pages from $30/month with hosting included. Next.js, React, TypeScript.',
      keywords: [
        'web development Santa Teresa Costa Rica',
        'digital marketing Santa Teresa',
        'website Santa Teresa',
        'online presence Costa Rica',
        'web development Puntarenas',
        'digital marketing Nicoya Peninsula',
        'PWA development Costa Rica',
        'live streaming integration',
        'e-commerce development Costa Rica',
        'authentication systems development',
        'Next.js developer Santa Teresa',
        'React development Costa Rica',
        'AI marketing automation Costa Rica',
        'landing page generator',
        'component library development',
        'full-stack developer Santa Teresa',
        'TypeScript developer Costa Rica'
      ],
      openGraph: {
        title: 'AIServices Santa Teresa | Web Development & Digital Marketing',
        description: 'Professional web development and digital marketing services for businesses in Santa Teresa, Costa Rica. From $30/month.',
        url: `${baseUrl}/en/Aiservices`,
        siteName: 'AIServices Santa Teresa',
        locale: 'en_US',
        type: 'website',
        images: [
          {
            url: '/wave-128.png',
            width: 128,
            height: 128,
            alt: 'AIServices Santa Teresa',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'AIServices Santa Teresa | Web Development & Digital Marketing',
        description: 'Professional web development services for businesses in Santa Teresa, Costa Rica.',
        images: ['/wave-128.png'],
      },
      alternates: {
        canonical: `${baseUrl}/en/Aiservices`,
      },
    },
  };

  return metadataMap[locale];
}

const services = [
  {
    icon: Code,
    title: 'Desarrollo Web Full-Stack',
    description: 'Aplicaciones web modernas con Next.js, React y TypeScript. Perfectas para negocios locales en Santa Teresa, restaurantes, hoteles y empresas turísticas en Costa Rica.',
    tech: 'Next.js, React, TypeScript'
  },
  {
    icon: Webcam,
    title: 'Integración de Streaming en Vivo',
    description: 'Sistemas de transmisión en vivo con Twitch y YouTube, chat interactivo y funcionalidades en tiempo real.',
    tech: 'Twitch API, YouTube API, Socket.io'
  },
  {
    icon: Smartphone,
    title: 'Aplicaciones PWA',
    description: 'Progressive Web Apps instalables que funcionan offline y ofrecen experiencia nativa en dispositivos móviles.',
    tech: 'PWA, Service Workers'
  },
  {
    icon: ShoppingCart,
    title: 'Plataformas E-commerce',
    description: 'Tiendas en línea completas con gestión de inventario, pagos locales y sistemas de autenticación. Ideal para comercios en Santa Teresa y Puntarenas.',
    tech: 'E-commerce, Payment Integration'
  },
  {
    icon: Shield,
    title: 'Sistemas de Autenticación',
    description: 'Autenticación segura con OAuth, SMS verification y gestión de usuarios y huéspedes.',
    tech: 'OAuth, JWT, Twilio'
  },
  {
    icon: MessageSquare,
    title: 'Funcionalidades en Tiempo Real',
    description: 'Chat en vivo, notificaciones push y actualizaciones en tiempo real con WebSockets.',
    tech: 'Socket.io, WebSockets'
  },
  {
    icon: Zap,
    title: 'Automatización de Marketing con IA',
    description: 'Sistemas inteligentes de marketing que optimizan campañas y generan contenido automáticamente.',
    tech: 'AI, Marketing Automation'
  },
  {
    icon: Layers,
    title: 'Generación Automatizada de Landing Pages',
    description: 'Landing pages generadas automáticamente desde esquemas de Notion, listas para producción.',
    tech: 'Automated Generation, Notion API'
  },
  {
    icon: Database,
    title: 'Integración de Bases de Datos',
    description: 'Sistemas robustos con MongoDB, SQL Server y Prisma ORM para gestión eficiente de datos.',
    tech: 'MongoDB, SQL Server, Prisma'
  },
  {
    icon: Globe,
    title: 'Bibliotecas de Componentes',
    description: 'Sistemas de componentes reutilizables documentados con Storybook para desarrollo ágil.',
    tech: 'Storybook, Component Libraries'
  },
];

const industries = [
  { name: 'Turismo y Hospitalidad', examples: 'Santa Teresa Surf Cam, TikoTours' },
  { name: 'Estaciones de Esquí', examples: 'Bromley Mountain' },
  { name: 'Agencias de Marketing', examples: 'MarketerHire, MH-1' },
  { name: 'E-commerce', examples: 'Button platform' },
  { name: 'Negocios Locales', examples: 'Restaurantes, hoteles, escuelas de surf' },
];

const processSteps = [
  {
    step: '1',
    title: 'Descubrimiento',
    description: 'Analizamos tus necesidades y objetivos de negocio para crear la solución perfecta.'
  },
  {
    step: '2',
    title: 'Desarrollo',
    description: 'Construimos tu solución usando tecnologías modernas y mejores prácticas de la industria.'
  },
  {
    step: '3',
    title: 'Despliegue',
    description: 'Lanzamos tu proyecto con hosting incluido y optimización para máximo rendimiento.'
  },
  {
    step: '4',
    title: 'Optimización',
    description: 'Monitoreamos y mejoramos continuamente para asegurar los mejores resultados.'
  },
];

export default async function AIServicesPage({ params }: Props) {
  const { locale } = await params;
  
  if (!isValidLocale(locale)) {
    notFound();
  }

  return (
    <div className="min-h-screen relative">
      <AppHeader />
        
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-16 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-6 animate-in fade-in-up">
            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 mb-4">
              Servicios Digitales Profesionales
            </Badge>
            <h1 className="text-4xl md:text-6xl font-headline font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Presencia Online para Negocios en Costa Rica
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Desarrollo web profesional, marketing digital y soluciones tecnológicas para hacer crecer tu negocio. Especialistas en turismo, hospitalidad y comercio local.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                asChild
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
              >
                <a href="mailto:josephquesada92@gmail.com?subject=Consulta de Servicios AIServices">
                  <Mail className="mr-2 h-5 w-5" />
                  Contactar Ahora
                </a>
              </Button>
              <Button 
                asChild
                variant="outline"
                size="lg"
                className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10"
              >
                <a href="#servicios">
                  Ver Servicios
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">
              Nuestros Servicios
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Soluciones tecnológicas completas diseñadas específicamente para negocios en Santa Teresa, Puntarenas y Costa Rica. Desde landing pages hasta plataformas complejas.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card 
                  key={index}
                  className="border-cyan-500/20 bg-card/50 backdrop-blur-sm hover:border-cyan-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
                >
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-cyan-400" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                    <CardDescription className="text-base mt-2">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline" className="text-xs">
                      {service.tech}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">
              Precios Transparentes
            </h2>
            <p className="text-muted-foreground text-lg">
              Soluciones accesibles para negocios de todos los tamaños
            </p>
          </div>

          <Card className="border-cyan-500/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full mb-6">
                <Rocket className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-4xl font-bold mb-2">
                Desde $30<span className="text-2xl text-muted-foreground">/mes</span>
              </CardTitle>
              <CardDescription className="text-lg">
                Plan Básico - Landing Page + Hosting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Landing Page Profesional</p>
                    <p className="text-sm text-muted-foreground">Diseño responsive y optimizado</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Hosting Incluido</p>
                    <p className="text-sm text-muted-foreground">Sin costos adicionales de hosting</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">SEO Básico</p>
                    <p className="text-sm text-muted-foreground">Optimización para buscadores</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Diseño Responsive</p>
                    <p className="text-sm text-muted-foreground">Funciona en todos los dispositivos</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Integración de Contacto</p>
                    <p className="text-sm text-muted-foreground">Formularios y enlaces de email</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Soporte Técnico</p>
                    <p className="text-sm text-muted-foreground">Mantenimiento y actualizaciones</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t border-border">
                <p className="text-center text-muted-foreground mb-6">
                  ¿Necesitas funcionalidades avanzadas? Contáctanos para un presupuesto personalizado.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                  >
                    <a href="mailto:josephquesada92@gmail.com?subject=Solicitud de Presupuesto - AIServices">
                      Solicitar Presupuesto
                    </a>
                  </Button>
                  <Button 
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10"
                  >
                    <a href="mailto:josephquesada92@gmail.com?subject=Consulta sobre Plan Básico - AIServices">
                      Más Información
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">
              Cómo Funciona
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Un proceso simple y eficiente para llevar tu negocio al siguiente nivel
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, index) => (
              <Card key={index} className="border-cyan-500/20 text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-cyan-400">{step.step}</span>
                  </div>
                  <CardTitle>{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-16 px-4 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">
              Proyectos Exitosos
            </h2>
            <p className="text-muted-foreground text-lg">
              Casos reales de negocios que confiaron en nosotros
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-cyan-500/20">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Webcam className="h-8 w-8 text-cyan-400" />
                  <CardTitle>Santa Teresa Surf Cam</CardTitle>
                </div>
                <CardDescription>
                  Plataforma de transmisión en vivo 24/7 con chat interactivo, datos de mareas y sistema de reportes de usuarios.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Next.js</Badge>
                  <Badge variant="outline">React</Badge>
                  <Badge variant="outline">Twitch API</Badge>
                  <Badge variant="outline">MongoDB</Badge>
                  <Badge variant="outline">PWA</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-cyan-500/20">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="h-8 w-8 text-cyan-400" />
                  <CardTitle>AuthBridge</CardTitle>
                </div>
                <CardDescription>
                  Sistema completo de autenticación y gestión de huéspedes para estaciones de esquí con integración cross-origin.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Next.js 15</Badge>
                  <Badge variant="outline">Prisma</Badge>
                  <Badge variant="outline">SQL Server</Badge>
                  <Badge variant="outline">OAuth</Badge>
                  <Badge variant="outline">Twilio</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Industries Served */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">
              Industrias que Atendemos
            </h2>
            <p className="text-muted-foreground text-lg">
              Experiencia comprobada en múltiples sectores
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {industries.map((industry, index) => (
              <Card key={index} className="border-cyan-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold mb-1">{industry.name}</p>
                      <p className="text-sm text-muted-foreground">{industry.examples}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 px-4 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-cyan-500/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
              <CardTitle className="text-3xl mb-2">¿Listo para Comenzar?</CardTitle>
              <CardDescription className="text-lg">
                Transforma tu presencia digital hoy mismo. Contáctanos para una consulta gratuita.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                >
                  <a href="mailto:josephquesada92@gmail.com?subject=Consulta de Servicios - AIServices Santa Teresa">
                    <Mail className="mr-2 h-5 w-5" />
                    Enviar Email
                  </a>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Email: <a href="mailto:josephquesada92@gmail.com" className="text-cyan-400 hover:underline">josephquesada92@gmail.com</a>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "AIServices Santa Teresa",
            "description": "Servicios de desarrollo web, marketing digital y presencia online para negocios en Santa Teresa, Costa Rica",
            "url": `${baseUrl}/Aiservices`,
            "telephone": "+506 8316 1976",
            "email": "josephquesada92@gmail.com",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Santa Teresa",
              "addressRegion": "Puntarenas",
              "addressCountry": "CR"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "9.6486",
              "longitude": "-85.1564"
            },
            "priceRange": "$30",
            "areaServed": {
              "@type": "City",
              "name": "Santa Teresa"
            },
            "serviceType": [
              "Web Development",
              "Digital Marketing",
              "Landing Page Development",
              "E-commerce Development",
              "PWA Development"
            ]
          })
        }}
      />
    </div>
  );
}

