"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import HlsPlayer from "./HlsPlayer";

const FREE_TIER_DURATION_SECONDS = 60;

export default function SurfCam() {
  const { user, logout } = useAuth();
  const [timeLeft, setTimeLeft] = useState(FREE_TIER_DURATION_SECONDS);
  const [isTimeExpired, setIsTimeExpired] = useState(false);

  useEffect(() => {
    if (user?.accessType === "free") {
      setTimeLeft(FREE_TIER_DURATION_SECONDS);
      setIsTimeExpired(false);

      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            setIsTimeExpired(true);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [user]);

  // Ya no redirigimos automáticamente, dejamos que el usuario elija

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1 p-4 md:p-8">
        <div className="container mx-auto">
          <div className="flex-grow w-full relative">
            <div className="aspect-video w-full relative rounded-xl overflow-hidden shadow-2xl shadow-primary/20">
              <HlsPlayer src="/api/hls-proxy/surfcam.m3u8" isPaused={isTimeExpired} />
              {user?.accessType === "free" && (
                <>
                  <div className={`absolute top-2 right-2 text-white text-sm px-3 py-1 rounded-full z-20 transition-all duration-300 ${
                    timeLeft <= 10 ? 'bg-red-600 animate-pulse' : 'bg-black/50'
                  }`}>
                    Tiempo restante: {timeLeft}s
                  </div>
                  {timeLeft <= 15 && !isTimeExpired && (
                    <div className="absolute bottom-4 left-4 right-4 z-20">
                      <Link href="/contacto">
                        <Button className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg">
                          ⚡ ¡Actualiza a Premium! - Solo $5/mes
                        </Button>
                      </Link>
                    </div>
                  )}
                  {isTimeExpired && (
                    <div className="absolute inset-0 bg-background/90 backdrop-blur-lg flex flex-col items-center justify-center z-30 p-6 text-center">
                      <div className="bg-red-100 border border-red-300 rounded-lg p-6 max-w-sm">
                        <h2 className="text-2xl font-bold text-red-800 mb-3">⏰ Tiempo Agotado</h2>
                        <p className="text-red-700 mb-4">
                          Tu tiempo de prueba gratuita ha terminado. El video se ha pausado.
                        </p>
                        <div className="space-y-3">
                          <Link href="/contacto">
                            <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                              💎 Actualizar a Premium
                            </Button>
                          </Link>
                                                     <Button 
                             variant="outline" 
                             onClick={logout}
                             className="w-full"
                           >
                             🏠 Volver al Inicio
                           </Button>
                        </div>
                                                 <p className="text-xs text-red-600 mt-3">
                           Elige una opción para continuar
                         </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <footer className="text-center mt-12 py-6 border-t">
            <p className="text-sm text-muted-foreground">
              Un agradecimiento especial a{' '}
              <a
                href="https://seataya.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary hover:underline"
              >
                Seataya Luxury Villas
              </a>
              {' '}por brindarnos esta increíble vista a las olas.
            </p>
            <p className="text-xs text-muted-foreground mt-1">¿Buscas dónde quedarte?{' '}
              <a href="https://seataya.com/" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                ¡Visita Seataya!
              </a>
            </p>
            <div className="mt-4 pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-2">
                📸 ¡Síguenos en Instagram para más contenido de surfing en Santa Teresa!
              </p>
              <a 
                href="https://www.instagram.com/joseph.quesada94/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                @joseph.quesada94
              </a>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
