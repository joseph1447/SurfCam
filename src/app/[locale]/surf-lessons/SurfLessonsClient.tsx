"use client";

import AppHeader from '@/components/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MapPin, Clock, Users, Star, CheckCircle2, Waves, Zap, Award } from 'lucide-react';

export default function SurfLessonsClient() {
  const handleContact = (method: 'email' | 'whatsapp') => {
    if (method === 'email') {
      window.location.href = 'mailto:josephquesada92@gmail.com?subject=Clases de Surf en Santa Teresa';
    } else {
      window.open('https://wa.me/50683161976?text=Hola! Me interesan las clases de surf en Santa Teresa', '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-6 animate-in fade-in-up">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full mb-6">
              <Waves className="h-10 w-10 text-cyan-400" />
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Clases de Surf en Santa Teresa
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Aprende a surfear con instructores locales certificados en una de las mejores playas de Costa Rica
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                onClick={() => handleContact('whatsapp')}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
              >
                <Phone className="mr-2 h-5 w-5" />
                Reservar Ahora
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

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-cyan-500/20 bg-card/50 backdrop-blur-sm text-center">
              <CardHeader>
                <div className="mx-auto w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-7 w-7 text-cyan-400" />
                </div>
                <CardTitle>Instructores Certificados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Instructores locales con años de experiencia en las olas de Santa Teresa
                </p>
              </CardContent>
            </Card>

            <Card className="border-cyan-500/20 bg-card/50 backdrop-blur-sm text-center">
              <CardHeader>
                <div className="mx-auto w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="h-7 w-7 text-cyan-400" />
                </div>
                <CardTitle>Mejores Olas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Clases en las mejores olas de Santa Teresa, perfectas para todos los niveles
                </p>
              </CardContent>
            </Card>

            <Card className="border-cyan-500/20 bg-card/50 backdrop-blur-sm text-center">
              <CardHeader>
                <div className="mx-auto w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-4">
                  <Star className="h-7 w-7 text-cyan-400" />
                </div>
                <CardTitle>Experiencia Única</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Disfruta de una experiencia auténtica con la cultura surf de Costa Rica
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 px-4 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">
              Nuestras Clases
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Clases adaptadas a todos los niveles, desde principiantes hasta surfistas avanzados
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
                  Perfecto para quienes nunca han surfado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Introducción al surf y seguridad</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Técnicas básicas de remo y equilibrio</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Equipo incluido (tabla y leash)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Clases de 2 horas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Grupos pequeños (máximo 3 estudiantes)</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-cyan-500/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Zap className="h-6 w-6 text-cyan-400" />
                  Clases Avanzadas
                </CardTitle>
                <CardDescription className="text-base">
                  Para surfistas con experiencia que quieren mejorar
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
                    <span>Lectura de olas y posicionamiento</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Maniobras y trucos</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Video análisis de tu surf</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Clases personalizadas</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">
              Precios y Horarios
            </h2>
            <p className="text-muted-foreground text-lg">
              Clases disponibles todos los días del año
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-cyan-500/20 text-center">
              <CardHeader>
                <CardTitle className="text-xl">Clase Privada</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-4xl font-bold text-cyan-400 mb-2">$80</p>
                  <p className="text-sm text-muted-foreground">por 2 horas</p>
                </div>
                <Badge variant="outline" className="mb-4 border-cyan-500/30 text-cyan-300">
                  1 estudiante
                </Badge>
                <ul className="text-left space-y-2 text-sm mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                    <span>Atención personalizada</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                    <span>Equipo incluido</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                    <span>Fotos de sesión</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-cyan-500/40 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 text-center">
              <CardHeader>
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full mb-4">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Clase Grupal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-4xl font-bold text-cyan-400 mb-2">$70</p>
                  <p className="text-sm text-muted-foreground">por 2 horas</p>
                </div>
                <Badge variant="outline" className="mb-4 border-cyan-500/50 text-cyan-300 bg-cyan-500/20">
                  2-3 estudiantes
                </Badge>
                <ul className="text-left space-y-2 text-sm mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                    <span>Aprendizaje grupal</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                    <span>Equipo incluido</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                    <span>Precio accesible</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-cyan-500/20 text-center">
              <CardHeader>
                <CardTitle className="text-xl">Paquete 4 Clases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-4xl font-bold text-cyan-400 mb-2">$280</p>
                  <p className="text-sm text-muted-foreground">ahorro de $40</p>
                </div>
                <Badge variant="outline" className="mb-4 border-cyan-500/30 text-cyan-300">
                  Cualquier nivel
                </Badge>
                <ul className="text-left space-y-2 text-sm mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                    <span>4 clases completas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                    <span>Válido por 30 días</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                    <span>Mejor precio por clase</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 px-4 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent">
        <div className="container mx-auto max-w-6xl">
          <Card className="border-cyan-500/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">¿Qué Incluye tu Clase?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-4 text-cyan-400 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Incluido
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                      <span>Tabla de surf profesional</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                      <span>Leash de seguridad</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                      <span>Instructor certificado</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                      <span>Fotos de tu sesión</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                      <span>Agua y frutas</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4 text-cyan-400 flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Traer Contigo
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full border-2 border-cyan-400 flex-shrink-0"></div>
                      <span>Traje de baño</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full border-2 border-cyan-400 flex-shrink-0"></div>
                      <span>Protector solar</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full border-2 border-cyan-400 flex-shrink-0"></div>
                      <span>Toalla</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full border-2 border-cyan-400 flex-shrink-0"></div>
                      <span>Ropa seca</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full border-2 border-cyan-400 flex-shrink-0"></div>
                      <span>Mucha energía</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-cyan-500/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl mb-2">¡Reserva tu Clase!</CardTitle>
              <CardDescription className="text-lg">
                Contacta directamente con nuestros instructores locales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Información de Contacto</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                        <Mail className="h-5 w-5 text-cyan-400" />
                      </div>
                      <a href="mailto:josephquesada92@gmail.com" className="text-muted-foreground hover:text-cyan-400 transition-colors">
                        josephquesada92@gmail.com
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
                        <Phone className="h-5 w-5 text-green-400" />
                      </div>
                      <a href="https://wa.me/50683161976" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-green-400 transition-colors">
                        +506 8316 1976
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-cyan-400" />
                      </div>
                      <span className="text-muted-foreground">Santa Teresa, Costa Rica</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                        <Clock className="h-5 w-5 text-cyan-400" />
                      </div>
                      <span className="text-muted-foreground">Clases disponibles 7 días a la semana</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Contactar Ahora</h3>
                  <div className="space-y-4">
                    <Button 
                      onClick={() => handleContact('whatsapp')}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                      size="lg"
                    >
                      <Phone className="h-5 w-5 mr-2" />
                      WhatsApp
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
                    Responde en menos de 24 horas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

