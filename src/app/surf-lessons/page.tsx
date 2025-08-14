"use client";

import SimpleHeader from "@/components/SimpleHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, Clock, Users, Star } from "lucide-react";

export default function SurfLessons() {
  const handleContact = (method: 'email' | 'whatsapp') => {
    if (method === 'email') {
      window.location.href = 'mailto:josephquesada92@gmail.com?subject=Clases de Surf en Santa Teresa';
    } else {
      window.open('https://wa.me/50683161976?text=Hola! Me interesan las clases de surf en Santa Teresa', '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <SimpleHeader />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M2.3 14.7c-1.3 1.3-1.3 3.4 0 4.7s3.4 1.3 4.7 0l2.8-2.8-4.7-4.7-2.8 2.8z" />
              <path d="M12.2 4.2 18 10l3.8-3.8c1.3-1.3 1.3-3.4 0-4.7s-3.4-1.3-4.7 0L12.2 4.2z" />
              <path d="m5.2 9.2 4-4" />
              <path d="m14.2 18.2 4-4" />
              <path d="m7.2 12.2 4.5 4.5" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Clases de Surf en Santa Teresa
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Aprende a surfear con instructores locales certificados en una de las mejores playas de Costa Rica
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center p-6">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Instructores Locales</h3>
            <p className="text-gray-600">Instructores certificados con años de experiencia en las olas de Santa Teresa</p>
          </Card>

          <Card className="text-center p-6">
            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <MapPin className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Mejores Olas</h3>
            <p className="text-gray-600">Clases en las mejores olas de Santa Teresa, perfectas para todos los niveles</p>
          </Card>

          <Card className="text-center p-6">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Star className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Experiencia Única</h3>
            <p className="text-gray-600">Disfruta de una experiencia auténtica con la cultura surf de Costa Rica</p>
          </Card>
        </div>

        {/* Services */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="p-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🏄‍♂️ Clases para Principiantes
              </CardTitle>
              <CardDescription>
                Perfecto para quienes nunca han surfado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Introducción al surf y seguridad</li>
                <li>• Técnicas básicas de remo y equilibrio</li>
                <li>• Equipo incluido (tabla y leash)</li>
                <li>• Clases de 2 horas</li>
                <li>• Grupos pequeños (máximo 3 estudiantes)</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🌊 Clases Avanzadas
              </CardTitle>
              <CardDescription>
                Para surfistas con experiencia que quieren mejorar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Técnicas avanzadas de surf</li>
                <li>• Lectura de olas y posicionamiento</li>
                <li>• Maniobras y trucos</li>
                <li>• Video análisis de tu surf</li>
                <li>• Clases personalizadas</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Pricing */}
        <Card className="mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Precios y Horarios</CardTitle>
            <CardDescription>
              Clases disponibles todos los días del año
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 border rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Clase Individual</h3>
                <p className="text-3xl font-bold text-blue-600 mb-2">$60</p>
                <p className="text-sm text-gray-600 mb-4">por 2 horas</p>
                <Badge variant="secondary" className="mb-2">1 estudiante</Badge>
              </div>
              
              <div className="text-center p-4 border rounded-lg bg-blue-50 border-blue-200">
                <h3 className="text-lg font-semibold mb-2">Clase Grupal</h3>
                <p className="text-3xl font-bold text-blue-600 mb-2">$45</p>
                <p className="text-sm text-gray-600 mb-4">por 2 horas</p>
                <Badge variant="secondary" className="mb-2">2-3 estudiantes</Badge>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Paquete 5 Clases</h3>
                <p className="text-3xl font-bold text-blue-600 mb-2">$200</p>
                <p className="text-sm text-gray-600 mb-4">ahorro de $50</p>
                <Badge variant="secondary" className="mb-2">Cualquier nivel</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">¡Reserva tu Clase!</CardTitle>
            <CardDescription>
              Contacta directamente con nuestros instructores locales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información de Contacto</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <span>josephquesada92@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-green-600" />
                    <span>+506 8316 1976</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-red-600" />
                    <span>Santa Teresa, Costa Rica</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <span>Clases disponibles 7 días a la semana</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contactar Ahora</h3>
                <div className="space-y-3">
                  <Button 
                    onClick={() => handleContact('email')}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar Email
                  </Button>
                  <Button 
                    onClick={() => handleContact('whatsapp')}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  Responde en menos de 24 horas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What's Included */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>¿Qué Incluye tu Clase?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">✅ Incluido</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Tabla de surf profesional</li>
                  <li>• Leash de seguridad</li>
                  <li>• Instructor certificado</li>
                  <li>• Seguro de responsabilidad civil</li>
                  <li>• Fotos de tu sesión</li>
                  <li>• Agua y frutas</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">🎒 Traer Contigo</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Traje de baño</li>
                  <li>• Protector solar</li>
                  <li>• Toalla</li>
                  <li>• Ropa seca</li>
                  <li>• Mucha energía</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-600">
          <p className="mb-2">
            📍 Santa Teresa, Costa Rica - Una de las mejores playas para surf del mundo
          </p>
          <p className="text-sm">
            ¡Únete a la comunidad surf de Santa Teresa y vive la experiencia Pura Vida!
          </p>
        </div>
      </main>
    </div>
  );
}
