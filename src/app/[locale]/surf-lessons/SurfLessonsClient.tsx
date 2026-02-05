"use client";

import AppHeader from '@/components/AppHeader';
import SurfLessonQuote from '@/components/SurfLessonQuote';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Users,
  Star,
  CheckCircle2,
  Waves,
  Zap,
  Award,
  Shield,
  Calendar,
  Heart,
  Sun,
  Droplets
} from 'lucide-react';

export default function SurfLessonsClient() {
  const handleContact = (method: 'email' | 'whatsapp') => {
    if (method === 'email') {
      // Scroll to quoter section
      const quoterSection = document.getElementById('cotizador');
      if (quoterSection) {
        quoterSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      window.open('https://wa.me/50683161976?text=Hola! Me interesan las clases de surf en Santa Teresa', '_blank');
    }
  };

  return (
    <div className="min-h-screen">
      <AppHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-6 animate-in fade-in-up">
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-sm">
              Aprende Surf en el Paraíso Tropical
            </Badge>
            <h1 className="text-4xl md:text-6xl font-headline font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Clases de Surf en Santa Teresa
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Descubre la magia del surf en una de las playas más hermosas de Costa Rica. Clases para todos los niveles con instructores experimentados locales.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sun className="h-4 w-4 text-cyan-400" />
                <span>Clases 7 días</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4 text-cyan-400" />
                <span>Grupos pequeños</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-cyan-400" />
                <span>Seguridad garantizada</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                onClick={() => handleContact('whatsapp')}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
              >
                <Phone className="mr-2 h-5 w-5" />
                WhatsApp: +506 8316-1976
              </Button>
              <Button
                onClick={() => handleContact('email')}
                variant="outline"
                size="lg"
                className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10"
              >
                <Mail className="mr-2 h-5 w-5" />
                Enviar Email
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Santa Teresa Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">
              ¿Por Qué Santa Teresa?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Santa Teresa es uno de los mejores destinos de surf en Costa Rica
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-cyan-500/20 bg-card/50 backdrop-blur-sm text-center">
              <CardHeader>
                <div className="mx-auto w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-4">
                  <Waves className="h-7 w-7 text-cyan-400" />
                </div>
                <CardTitle>Olas Perfectas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Olas consistentes todo el año, ideales para principiantes y surfistas avanzados
                </p>
              </CardContent>
            </Card>

            <Card className="border-cyan-500/20 bg-card/50 backdrop-blur-sm text-center">
              <CardHeader>
                <div className="mx-auto w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-4">
                  <Sun className="h-7 w-7 text-cyan-400" />
                </div>
                <CardTitle>Clima Tropical</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Clima perfecto todo el año, agua cálida y playas de arena dorada
                </p>
              </CardContent>
            </Card>

            <Card className="border-cyan-500/20 bg-card/50 backdrop-blur-sm text-center">
              <CardHeader>
                <div className="mx-auto w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-4">
                  <Heart className="h-7 w-7 text-cyan-400" />
                </div>
                <CardTitle>Pura Vida</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Experimenta la auténtica cultura costarricense en un ambiente relajado
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Table Section */}
      <section className="py-16 px-4" id="precios">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">
              Precios de Clases de Surf
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Equipo completo incluido en todas las clases
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Pricing Tables */}
            <div className="space-y-6">
              {/* Private Lesson */}
              <Card className="border-cyan-500/30 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Waves className="h-5 w-5 text-cyan-400" />
                    Lección Privada
                  </CardTitle>
                  <CardDescription>Atención 100% personalizada</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-cyan-400 mb-2">$80 <span className="text-base font-normal text-muted-foreground">USD</span></div>
                  <p className="text-sm text-muted-foreground">Por persona, 1.5 horas de clase</p>
                </CardContent>
              </Card>

              {/* Group Lessons Table */}
              <Card className="border-cyan-500/30 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-cyan-400" />
                    Lecciones Grupales
                  </CardTitle>
                  <CardDescription>Mejor precio por persona en grupo</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Personas</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Por Persona</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>1 persona</TableCell>
                        <TableCell className="font-semibold">$70</TableCell>
                        <TableCell className="text-cyan-400">$70 c/u</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>2 personas</TableCell>
                        <TableCell className="font-semibold">$120</TableCell>
                        <TableCell className="text-cyan-400">$60 c/u</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>3 personas</TableCell>
                        <TableCell className="font-semibold">$180</TableCell>
                        <TableCell className="text-cyan-400">$60 c/u</TableCell>
                      </TableRow>
                      <TableRow className="bg-cyan-500/10">
                        <TableCell>4+ personas</TableCell>
                        <TableCell className="font-semibold">-</TableCell>
                        <TableCell className="text-cyan-400 font-bold">$60 c/u</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Package Discounts */}
              <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-green-400">
                    <Calendar className="h-5 w-5" />
                    Paquetes con Descuento
                  </CardTitle>
                  <CardDescription>Ahorra más con paquetes de varios días</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>2-3 días</span>
                      <Badge className="bg-green-500/20 text-green-400">desde $65/persona/día</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>4 días</span>
                      <Badge className="bg-green-500/20 text-green-400">desde $60/persona/día</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>5+ días</span>
                      <Badge className="bg-green-500/30 text-green-300 border-green-500/50">desde $55/persona/día</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quote Calculator */}
            <div id="cotizador">
              <SurfLessonQuote />
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 px-4 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">
              ¿Qué Incluye tu Clase?
            </h2>
            <p className="text-muted-foreground text-lg">
              Todo el equipo y asistencia que necesitas para tu primera ola
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-cyan-500/20 bg-card/50 backdrop-blur-sm text-center">
              <CardHeader>
                <div className="mx-auto w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-4">
                  <Waves className="h-7 w-7 text-cyan-400" />
                </div>
                <CardTitle>Equipo Completo</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-left space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                    <span>Tabla de surf adecuada a tu nivel</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                    <span>Lycra protectora</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                    <span>Leash de seguridad</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-cyan-500/20 bg-card/50 backdrop-blur-sm text-center">
              <CardHeader>
                <div className="mx-auto w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-4">
                  <Award className="h-7 w-7 text-cyan-400" />
                </div>
                <CardTitle>Instrucción Profesional</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-left space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                    <span>1.5 horas de clase completa</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                    <span>Instructores experimentados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                    <span>Técnicas de seguridad</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-cyan-500/20 bg-card/50 backdrop-blur-sm text-center">
              <CardHeader>
                <div className="mx-auto w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-4">
                  <Heart className="h-7 w-7 text-cyan-400" />
                </div>
                <CardTitle>Experiencia Completa</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-left space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                    <span>Transporte incluido*</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                    <span>Spots según tu nivel</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                    <span>Todos los niveles bienvenidos</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            *Transporte disponible desde hoteles cercanos a Santa Teresa
          </p>
        </div>
      </section>

      {/* Types of Lessons */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">
              Tipos de Clases
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Clases diseñadas para cada nivel, desde tu primera ola hasta maniobras avanzadas
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-cyan-500/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Waves className="h-6 w-6 text-cyan-400" />
                  Clases para Principiantes
                </CardTitle>
                <CardDescription className="text-base">
                  Tu primera experiencia en el surf
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Introducción a la seguridad en el agua</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Técnicas básicas de remo</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Cómo pararse en la tabla</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Práctica en olas suaves</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Grupos reducidos para atención personalizada</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-cyan-500/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Zap className="h-6 w-6 text-cyan-400" />
                  Clases Intermedias/Avanzadas
                </CardTitle>
                <CardDescription className="text-base">
                  Perfecciona tu técnica y aprende nuevas maniobras
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Técnicas avanzadas de surf</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Lectura de olas y corrientes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Maniobras: cutbacks y turns</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Diferentes spots según condiciones</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Corrección de técnica personalizada</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">
              Preguntas Frecuentes
            </h2>
          </div>

          <div className="space-y-4">
            <Card className="border-cyan-500/20 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">¿Necesito experiencia previa?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No, nuestras clases están diseñadas para todos los niveles. Si es tu primera vez surfeando, te enseñaremos todo desde cero. Si ya tienes experiencia, adaptamos la clase a tu nivel.
                </p>
              </CardContent>
            </Card>

            <Card className="border-cyan-500/20 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">¿Qué debo traer?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Solo necesitas traer tu traje de baño, protector solar, toalla y muchas ganas de aprender. Nosotros proporcionamos todo el equipo necesario (tabla, lycra, leash).
                </p>
              </CardContent>
            </Card>

            <Card className="border-cyan-500/20 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">¿Cuál es el mejor momento para tomar clases?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Las mejores condiciones suelen ser en la mañana temprano (6-9 AM) o al atardecer (3-6 PM) cuando el viento es más suave. Sin embargo, ofrecemos clases durante todo el día adaptándonos a las condiciones del mar.
                </p>
              </CardContent>
            </Card>

            <Card className="border-cyan-500/20 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">¿Hay descuentos para grupos?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Sí, los grupos grandes obtienen mejor precio por persona. Además, ofrecemos descuentos especiales para paquetes de múltiples días. Consulta nuestra tabla de precios arriba para más detalles.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-cyan-500/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl mb-2">¡Reserva tu Clase!</CardTitle>
              <CardDescription className="text-lg">
                Contáctanos para reservar o consultar disponibilidad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Información de Contacto</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
                        <Phone className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                        <a href="https://wa.me/50683161976" target="_blank" rel="noopener noreferrer" className="font-semibold text-green-400 hover:text-green-300 transition-colors">
                          +506 8316-1976
                        </a>
                        <p className="text-xs text-muted-foreground">WhatsApp disponible</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                        <Mail className="h-5 w-5 text-cyan-400" />
                      </div>
                      <div>
                        <a href="mailto:josephquesada92@gmail.com" className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                          josephquesada92@gmail.com
                        </a>
                        <p className="text-xs text-muted-foreground">Respuesta rápida garantizada</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-cyan-400" />
                      </div>
                      <div>
                        <span className="font-semibold">Santa Teresa, Cóbano</span>
                        <p className="text-xs text-muted-foreground">Puntarenas, Costa Rica</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                        <Clock className="h-5 w-5 text-cyan-400" />
                      </div>
                      <div>
                        <span className="font-semibold">7 días a la semana</span>
                        <p className="text-xs text-muted-foreground">Horarios flexibles disponibles</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Reservar Ahora</h3>
                  <div className="space-y-4">
                    <Button
                      onClick={() => handleContact('whatsapp')}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                      size="lg"
                    >
                      <Phone className="h-5 w-5 mr-2" />
                      Reservar por WhatsApp
                    </Button>
                    <Button
                      onClick={() => handleContact('email')}
                      variant="outline"
                      className="w-full border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10"
                      size="lg"
                    >
                      <Mail className="h-5 w-5 mr-2" />
                      Enviar Email
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Te respondemos en menos de 24 horas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Schema.org JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Santa Teresa Surf Lessons",
            "description": "Clases de surf en Santa Teresa, Costa Rica para todos los niveles",
            "url": "https://santateresasurfcam.com/surf-lessons",
            "telephone": "+506-8316-1976",
            "email": "josephquesada92@gmail.com",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Santa Teresa",
              "addressRegion": "Puntarenas",
              "addressCountry": "CR"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "9.6428",
              "longitude": "-85.1686"
            },
            "priceRange": "$55-$80",
            "openingHours": "Mo-Su 06:00-18:00",
            "offers": [
              {
                "@type": "Offer",
                "name": "Private Surf Lesson",
                "price": "80",
                "priceCurrency": "USD",
                "description": "1.5 hour private surf lesson with experienced instructor"
              },
              {
                "@type": "Offer",
                "name": "Group Surf Lesson",
                "price": "55",
                "priceCurrency": "USD",
                "description": "1.5 hour group surf lesson, starting from $55/person"
              }
            ]
          })
        }}
      />
    </div>
  );
}
