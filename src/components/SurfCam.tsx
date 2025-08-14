"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import HlsPlayer from "./HlsPlayer";
import { usePWA } from "@/hooks/usePWA";

const FREE_TIER_DURATION_SECONDS = 60;

export default function SurfCam() {
  const { user, logout } = useAuth();
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [timeLeft, setTimeLeft] = useState(FREE_TIER_DURATION_SECONDS);
  const [isTimeExpired, setIsTimeExpired] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasStartedTimerRef = useRef(false);



  useEffect(() => {
    if (user?.accessType === "free") {
      // Solo iniciar el timer si no se ha iniciado antes para este usuario
      if (hasStartedTimerRef.current) {
        return;
      }
      
      hasStartedTimerRef.current = true;
      setTimeLeft(FREE_TIER_DURATION_SECONDS);
      setIsTimeExpired(false);

      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            setIsTimeExpired(true);
            
            // Forzar salida de pantalla completa inmediatamente
            if (document.fullscreenElement) {
              document.exitFullscreen().catch(() => {
                if (document.webkitExitFullscreen) {
                  document.webkitExitFullscreen();
                }
              });
            }
            
            // Detener cualquier reproducción de video
            const video = document.querySelector('video');
            if (video) {
              video.pause();
              video.src = '';
              video.load();
            }
            
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    } else {
      // Si no es usuario gratuito, resetear las referencias
      hasStartedTimerRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [user?.accessType, user?.email]); // Solo depender del tipo de acceso y email, no del objeto user completo

  // Efecto para limpiar referencias cuando el usuario hace logout
  useEffect(() => {
    if (!user) {
      hasStartedTimerRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setTimeLeft(FREE_TIER_DURATION_SECONDS);
      setIsTimeExpired(false);
    }
  }, [user]);

  // Efecto para monitorear pantalla completa y forzar salida cuando se acaba el tiempo
  useEffect(() => {
    if (isTimeExpired && user?.accessType === "free") {
      const checkFullscreen = () => {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {
            if (document.webkitExitFullscreen) {
              document.webkitExitFullscreen();
            }
          });
        }
      };

      // Verificar cada 500ms si está en pantalla completa
      const fullscreenCheck = setInterval(checkFullscreen, 500);

      // También verificar cuando cambia el estado de pantalla completa
      const handleFullscreenChange = () => {
        if (document.fullscreenElement) {
          checkFullscreen();
        }
      };

      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

      return () => {
        clearInterval(fullscreenCheck);
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      };
    }
  }, [isTimeExpired, user?.accessType]);

  // Efecto para prevenir entrada en pantalla completa después de que se acabe el tiempo
  useEffect(() => {
    if (isTimeExpired && user?.accessType === "free") {
      const preventFullscreen = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Mostrar mensaje de que necesita premium para pantalla completa
        alert('¡Necesitas Premium para disfrutar de pantalla completa sin interrupciones!');
        
        // Redirigir a la página de contacto
        window.location.href = '/contacto';
      };

      // Prevenir entrada en pantalla completa
      document.addEventListener('fullscreenchange', preventFullscreen);
      document.addEventListener('webkitfullscreenchange', preventFullscreen);

      return () => {
        document.removeEventListener('fullscreenchange', preventFullscreen);
        document.removeEventListener('webkitfullscreenchange', preventFullscreen);
      };
    }
  }, [isTimeExpired, user?.accessType]);

  // Efecto para redirigir automáticamente a contacto después de un delay
  useEffect(() => {
    if (isTimeExpired && user?.accessType === "free") {
      const redirectTimer = setTimeout(() => {
        // Solo redirigir si el usuario no ha hecho clic en ningún botón
        if (isTimeExpired) {
          window.location.href = '/contacto';
        }
      }, 10000); // 10 segundos de delay

      return () => clearTimeout(redirectTimer);
    }
  }, [isTimeExpired, user?.accessType]);

  const handleInstall = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      try {
        const success = await installApp();
        if (success) {
          console.log('App installed successfully');
        } else {
          console.log('Installation was dismissed');
        }
      } catch (error) {
        console.error('Installation failed:', error);
      } finally {
        setIsInstalling(false);
      }
    } else {
      console.log('App is not installable');
    }
  };

  // Ya no redirigimos automáticamente, dejamos que el usuario elija

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1 p-4 md:p-8">
        <div className="container mx-auto">
          {/* Install PWA Banner */}
          {isInstallable && !isInstalled && (
            <div className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">📱 Instalar Santa Teresa Surf Cam</h3>
                  <p className="text-sm opacity-90">Disfruta de las olas sin interrupciones</p>
                </div>
                <div className="flex gap-2">
                                     <Button 
                     onClick={handleInstall}
                     disabled={isInstalling}
                     className="bg-white text-blue-600 hover:bg-gray-100"
                   >
                     {isInstalling ? (
                       <div className="flex items-center gap-2">
                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                         Instalando...
                       </div>
                     ) : (
                       'Instalar'
                     )}
                   </Button>
                </div>
              </div>
            </div>
          )}

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
                      <div className="fixed inset-0 bg-background/95 backdrop-blur-lg flex flex-col items-center justify-center z-50 p-6 text-center">
                        <div className="bg-red-100 border-2 border-red-400 rounded-xl p-8 max-w-md shadow-2xl">
                          <div className="text-6xl mb-4">⏰</div>
                          <h2 className="text-3xl font-bold text-red-800 mb-4">¡Tiempo Agotado!</h2>
                          <p className="text-red-700 mb-6 text-lg">
                            Tu minuto de prueba gratuita ha terminado. El video se ha detenido completamente.
                          </p>
                          <div className="space-y-4">
                            <Link href="/contacto">
                              <Button className="w-full bg-primary hover:bg-primary/90 text-white text-lg py-3">
                                💎 ¡Actualizar a Premium por Solo $5/mes!
                              </Button>
                            </Link>
                            <Button 
                              variant="outline" 
                              onClick={logout}
                              className="w-full text-lg py-3"
                            >
                              🏠 Volver al Inicio
                            </Button>
                          </div>
                          <p className="text-sm text-red-600 mt-4 font-medium">
                            ¡No más interrupciones con Premium!
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
