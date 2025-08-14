"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import HlsPlayer from "./HlsPlayer";

const FREE_TIER_DURATION_SECONDS = 60;

export default function SurfCam() {
  const { user } = useAuth();
  const router = useRouter();
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

  // Efecto separado para la redirección
  useEffect(() => {
    if (isTimeExpired) {
      const redirectTimer = setTimeout(() => {
        router.push('/');
      }, 3000); // Redirigir después de 3 segundos

      return () => clearTimeout(redirectTimer);
    }
  }, [isTimeExpired, router]);

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
                            onClick={() => router.push('/')}
                            className="w-full"
                          >
                            🏠 Volver al Inicio
                          </Button>
                        </div>
                        <p className="text-xs text-red-600 mt-3">
                          Redirigiendo automáticamente en 3 segundos...
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
          </footer>
        </div>
      </main>
    </div>
  );
}
