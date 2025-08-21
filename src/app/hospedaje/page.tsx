"use client";

import { useState, useEffect } from "react";
import HospedajeHeader from "@/components/HospedajeHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Star, MapPin, Wifi, Car, Loader2, Crown } from "lucide-react";
import Link from "next/link";

export default function Hospedaje() {
  const [seatayaLoaded, setSeatayaLoaded] = useState(false);
  const [leidymarLoaded, setLeidymarLoaded] = useState(false);
  const [seatayaError, setSeatayaError] = useState(false);
  const [leidymarError, setLeidymarError] = useState(false);

  // Handle iframe load errors
  const handleIframeError = (type: 'seataya' | 'leidymar') => {
    if (type === 'seataya') {
      setSeatayaError(true);
    } else {
      setLeidymarError(true);
    }
  };

  // Handle iframe load success
  const handleIframeLoad = (type: 'seataya' | 'leidymar') => {
    if (type === 'seataya') {
      setSeatayaLoaded(true);
    } else {
      setLeidymarLoaded(true);
    }
  };

  // Set timeout to detect CSP errors for Leidy Mar (Shopify sites often block iframe embedding)
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!leidymarLoaded && !leidymarError) {
        setLeidymarError(true);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeout);
  }, [leidymarLoaded, leidymarError]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <HospedajeHeader />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2-2Z"/>
              <path d="M8 5V3a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              <path d="M12 12v.01"/>
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Hospedaje en Santa Teresa
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Descubre las mejores opciones de alojamiento cerca de las olas de Santa Teresa
          </p>
        </div>

        {/* Accommodation Options */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
                           {/* Seataya Luxury Villas */}
                 <Card className="overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
                   <div className="aspect-video relative">
                     {!seatayaLoaded && !seatayaError && (
                       <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                         <div className="text-center text-white">
                           <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                           <p>Cargando Seataya Luxury Villas...</p>
                         </div>
                       </div>
                     )}
                     {seatayaError && (
                       <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                         <div className="text-center text-white">
                           <p className="mb-2">No se pudo cargar la página</p>
                           <Button 
                             onClick={() => window.open('https://seataya.com/', '_blank')}
                             className="bg-white text-blue-600 hover:bg-gray-100"
                           >
                             <ExternalLink className="h-4 w-4 mr-2" />
                             Visitar Sitio Web
                           </Button>
                         </div>
                       </div>
                     )}
                     <iframe 
                       src="https://surf-cam-one.vercel.app/"
                       className="w-full h-full border-0"
                       title="SurfCam"
                       loading="lazy"
                       sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                       onLoad={() => handleIframeLoad('seataya')}
                       onError={() => handleIframeError('seataya')}
                       style={{ opacity: seatayaLoaded ? 1 : 0 }}
                     />
                     <div className="absolute top-4 right-4">
                       <Badge className="bg-white/90 text-blue-600 font-semibold">
                         <Star className="h-3 w-3 mr-1" />
                         Lujo
                       </Badge>
                     </div>
                   </div>
            <CardHeader>
              <CardTitle className="text-xl">SurfCam</CardTitle>
              <CardDescription>
                Transmisión en vivo de las mejores olas de Costa Rica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Ubicación</p>
                    <p className="text-sm text-gray-600">Colinas de Santa Teresa, Costa Rica</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">Características:</h4>
                  <div className="flex flex-wrap gap-2">
                                         <Badge variant="secondary" className="text-xs">
                       🌊
                       Piscina Infinita
                     </Badge>
                    <Badge variant="secondary" className="text-xs">
                      <Wifi className="h-3 w-3 mr-1" />
                      WiFi
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      <Car className="h-3 w-3 mr-1" />
                      Estacionamiento
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      🌊 Vista al Océano
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      🧘 Yoga & Surf
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Tipos de Villa:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Villa de 4 habitaciones con vista al océano</li>
                    <li>• Villa de 3 habitaciones con piscina infinita</li>
                    <li>• Seataya Palace - Villa de lujo</li>
                    <li>• Villas Jungle View</li>
                    <li>• Honeymoon Suite</li>
                  </ul>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={() => window.open('https://surf-cam-one.vercel.app/', '_blank')}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver SurfCam
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

                           {/* Leidymar Apartments */}
                 <Card className="overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
                   <div className="aspect-video relative flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-600">
                     <img 
                       src="/leidymar-preview.png" 
                       alt="Preview Leidymar Apartments" 
                       className="mx-auto rounded-lg shadow-lg max-h-60 object-contain bg-white/80 p-2"
                       style={{ background: 'rgba(255,255,255,0.8)' }}
                     />
                     <div className="absolute top-4 right-4">
                       <Badge className="bg-white/90 text-green-600 font-semibold">
                         <Star className="h-3 w-3 mr-1" />
                         Local
                       </Badge>
                     </div>
                   </div>
                   <CardHeader>
                     <CardTitle className="text-xl">Leidymar Apartments</CardTitle>
                     <CardDescription>
                       Apartamentos locales a solo 150m de las mejores olas de Santa Teresa
                     </CardDescription>
                   </CardHeader>
                   <CardContent>
                     <div className="space-y-4">
                       <div className="flex items-start gap-3">
                         <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                         <div>
                           <p className="font-medium">Ubicación</p>
                           <p className="text-sm text-gray-600">150m del mejor spot de surf, Santa Teresa Norte</p>
                         </div>
                       </div>
                       <div className="space-y-2">
                         <h4 className="font-semibold">Características:</h4>
                         <div className="flex flex-wrap gap-2">
                           <Badge variant="secondary" className="text-xs">
                             <Wifi className="h-3 w-3 mr-1" />
                             WiFi 100MB
                           </Badge>
                           <Badge variant="secondary" className="text-xs">
                             <Car className="h-3 w-3 mr-1" />
                             Estacionamiento
                           </Badge>
                           <Badge variant="secondary" className="text-xs">
                             🏄‍♂️ Cerca del Surf
                           </Badge>
                           <Badge variant="secondary" className="text-xs">
                             🏠 Familiar
                           </Badge>
                           <Badge variant="secondary" className="text-xs">
                             🐕 Mascotas
                           </Badge>
                         </div>
                       </div>
                       <div className="space-y-2">
                         <h4 className="font-semibold">Opciones Disponibles:</h4>
                         <ul className="text-sm text-gray-600 space-y-1">
                           <li>• Casa Capulín - 2 habitaciones</li>
                           <li>• Studio Pochote - Estudio completo</li>
                           <li>• Casa Papaya - 2 habitaciones</li>
                           <li>• TK Studio - Estudio con área de trabajo</li>
                         </ul>
                       </div>
                       <div className="pt-4">
                         <Button 
                           onClick={() => window.open('https://leidymar-apartments.com/', '_blank')}
                           className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                         >
                           <ExternalLink className="h-4 w-4 mr-2" />
                           Ver Leidymar Apartments
                         </Button>
                       </div>
                     </div>
                   </CardContent>
                 </Card>
        </div>

        {/* Why Choose These Options */}
        <Card className="mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">¿Por Qué Elegir Estas Opciones?</CardTitle>
            <CardDescription>
              Las mejores ubicaciones para disfrutar de Santa Teresa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Ubicación Privilegiada</h3>
                <p className="text-sm text-gray-600">
                  Ambas opciones están estratégicamente ubicadas cerca de las mejores olas y atracciones
                </p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Experiencia Local</h3>
                <p className="text-sm text-gray-600">
                  Conecta con la comunidad local y vive la auténtica experiencia de Santa Teresa
                </p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Wifi className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Comodidades Modernas</h3>
                <p className="text-sm text-gray-600">
                  WiFi rápido, estacionamiento y todas las comodidades que necesitas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Información Adicional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">🏄‍♂️ Para Surfistas</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Acceso directo a las mejores olas</li>
                  <li>• Almacenamiento de tablas</li>
                  <li>• Área de limpieza de equipo</li>
                  <li>• Información sobre condiciones del mar</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">🌴 Para Viajeros</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Restaurantes y supermercados cercanos</li>
                  <li>• Vida nocturna a poca distancia</li>
                  <li>• Transporte público disponible</li>
                  <li>• Actividades turísticas organizadas</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="mb-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2">¿Te Gustó Santa Teresa?</h3>
              <p className="text-lg mb-6 opacity-90">
                ¡Adquiere nuestro Plan Premium y disfruta de la transmisión en vivo de las olas sin interrupciones!
              </p>
              <Link href="/contacto">
                <Button className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-3">
                  <Crown className="h-5 w-5 mr-2" />
                  Adquirir Plan Premium - Solo $5/mes
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-600">
          <p className="mb-2">
            📍 Santa Teresa, Costa Rica - El paraíso del surf en el Pacífico
          </p>
          <p className="text-sm">
            ¡Reserva tu estadía y disfruta de las mejores olas de Costa Rica!
          </p>
        </div>
      </main>
    </div>
  );
}
