"use client";

import SimpleHeader from "@/components/SimpleHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Utensils, Clock, MapPin, Star } from "lucide-react";

export default function Restaurantes() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <SimpleHeader />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mb-6">
            <Utensils className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
            Restaurantes en Santa Teresa
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Descubre la gastronomía local y las mejores opciones para comer en Santa Teresa
          </p>
        </div>

        {/* Coming Soon */}
        <Card className="max-w-2xl mx-auto mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">🍽️ Próximamente</CardTitle>
            <CardDescription>
              Estamos trabajando en una guía completa de restaurantes
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-4">
              <p className="text-gray-600">
                Muy pronto tendremos una lista completa de los mejores restaurantes de Santa Teresa, 
                incluyendo opciones locales, internacionales y especialidades de mariscos.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                    <Utensils className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Cocina Local</h3>
                  <p className="text-sm text-gray-600">Restaurantes ticos auténticos</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                    <Star className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Cocina Internacional</h3>
                  <p className="text-sm text-gray-600">Sabores de todo el mundo</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Ubicaciones</h3>
                  <p className="text-sm text-gray-600">Cerca de las olas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>💡 Recomendaciones Generales</CardTitle>
            <CardDescription>
              Consejos para disfrutar de la gastronomía en Santa Teresa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">🍍 Gastronomía Local</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Prueba el ceviche fresco de la zona</li>
                  <li>• Disfruta del gallo pinto tradicional</li>
                  <li>• Saboréa las frutas tropicales locales</li>
                  <li>• Experimenta con la cocina tica auténtica</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">🌴 Experiencia Gastronómica</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Restaurantes con vista al océano</li>
                  <li>• Opciones vegetarianas y veganas</li>
                  <li>• Cafés con ambiente surf</li>
                  <li>• Bares con música en vivo</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact for Recommendations */}
        <Card className="mb-12">
          <CardHeader className="text-center">
            <CardTitle>¿Buscas Recomendaciones?</CardTitle>
            <CardDescription>
              Contacta con nosotros para obtener recomendaciones personalizadas
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-4">
              <p className="text-gray-600">
                Mientras trabajamos en la guía completa, podemos ayudarte con recomendaciones 
                personalizadas según tus preferencias.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => window.location.href = 'mailto:josephquesada92@gmail.com?subject=Recomendaciones de Restaurantes en Santa Teresa'}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  📧 Enviar Email
                </Button>
                <Button 
                  onClick={() => window.open('https://wa.me/50683161976?text=Hola! Me gustaría obtener recomendaciones de restaurantes en Santa Teresa', '_blank')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  📱 WhatsApp
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-600">
          <p className="mb-2">
            📍 Santa Teresa, Costa Rica - Gastronomía con sabor a Pura Vida
          </p>
          <p className="text-sm">
            ¡Próximamente una guía completa de los mejores restaurantes de la zona!
          </p>
        </div>
      </main>
    </div>
  );
}
