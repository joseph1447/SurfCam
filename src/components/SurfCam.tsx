"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import HlsPlayer from "./HlsPlayer";
import { usePWA } from "@/hooks/usePWA";
import Chat from "@/components/Chat";
import { ChevronDown } from "lucide-react";

export default function SurfCam() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);
  const { user, logout, timeLeft, isTimeExpired } = useAuth();
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const chatRef = useRef<HTMLDivElement | null>(null);
  const [showChatScrollButton, setShowChatScrollButton] = useState(false);
  const prevMessagesCount = useRef(0);
  const [showPrivacy, setShowPrivacy] = useState(false);

  // Detect if chat is in view
  useEffect(() => {
    const onScroll = () => {
      if (!chatRef.current) return;
      const rect = chatRef.current.getBoundingClientRect();
      // If the top of the chat is below the bottom of the viewport, it's not visible
      setShowChatScrollButton(rect.top > window.innerHeight - 80);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Show button when new messages arrive and chat is not visible
  useEffect(() => {
    if (!chatRef.current) return;
    const rect = chatRef.current.getBoundingClientRect();
    if (rect.top > window.innerHeight - 80 && prevMessagesCount.current > 0) {
      setShowChatScrollButton(true);
    }
    prevMessagesCount.current += 1;
  }, [/* You may want to pass a prop or state from Chat to trigger this */]);

  // Efecto para manejar la expiración del tiempo (pantalla completa y video)
  useEffect(() => {
    if (isTimeExpired && user?.accessType === "free") {
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
    }
  }, [isTimeExpired, user?.accessType]);

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
        // App installed successfully
      } else {
        // Installation was dismissed
      }
      } catch (error) {
        console.error('Installation failed:', error);
      } finally {
        setIsInstalling(false);
      }
    } else {
      // App is not installable
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
                   <Button 
                     variant="outline"
                     onClick={() => setShowInstructions(true)}
                     className="border-white text-white hover:bg-white hover:text-blue-600"
                   >
                     ¿Cómo?
                   </Button>
                 </div>
               </div>
             </div>
           )}

           {/* Instructions Modal */}
           {showInstructions && (
             <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
               <div className="bg-white rounded-lg p-6 max-w-md w-full">
                 <h3 className="text-lg font-bold mb-4">📱 Cómo instalar la app</h3>
                 <div className="space-y-3 text-sm">
                   <div className="flex items-start gap-3">
                     <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
                     <p><strong>Chrome/Edge:</strong> Toca el ícono de instalación en la barra de direcciones</p>
                   </div>
                   <div className="flex items-start gap-3">
                     <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
                     <p><strong>Safari:</strong> Toca el botón compartir y selecciona "Añadir a pantalla de inicio"</p>
                   </div>
                   <div className="flex items-start gap-3">
                     <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
                     <p><strong>Android:</strong> Aparecerá un banner automático, tócalo para instalar</p>
                   </div>
                 </div>
                 <Button 
                   onClick={() => setShowInstructions(false)}
                   className="w-full mt-4"
                 >
                   Entendido
                 </Button>
               </div>
             </div>
           )}

          <div className="flex-grow w-full relative">
            <div className="aspect-video w-full min-h-[70vh] relative rounded-xl overflow-hidden shadow-2xl shadow-primary/20">
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
          {/* Chat component below the video, with extra margin */}
          <div className="mt-16" ref={chatRef}>
            <Chat />
          </div>
          {showChatScrollButton && (
            <button
              className="fixed bottom-8 right-8 z-50 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
              onClick={() => {
                chatRef.current?.scrollIntoView({ behavior: "smooth" });
                setShowChatScrollButton(false);
              }}
            >
              <ChevronDown className="w-5 h-5" /> Ir al chat
            </button>
          )}
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
            <div className="mt-4">
              <button
                className="text-xs text-gray-500 underline hover:text-primary cursor-pointer"
                onClick={() => setShowPrivacy(true)}
              >
                Política de Privacidad
              </button>
            </div>
            {showPrivacy && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg p-6 max-w-md w-full text-left shadow-xl">
                  <h3 className="text-lg font-bold mb-2">Política de Privacidad</h3>
                  <p className="text-sm mb-2">
                    Esta aplicación recopila tu correo electrónico y, si usas Google para iniciar sesión, tu nombre y foto de perfil de Google. Esta información se utiliza únicamente para gestionar el acceso, el estado premium y la experiencia de chat. No compartimos tus datos con terceros.
                  </p>
                  <p className="text-sm mb-2">
                    Puedes solicitar la eliminación de tus datos o hacer preguntas sobre privacidad escribiendo a <a href="mailto:info@seataya.com" className="underline text-primary">info@seataya.com</a>.
                  </p>
                  <Button className="mt-4 w-full" onClick={() => setShowPrivacy(false)}>
                    Cerrar
                  </Button>
                </div>
              </div>
            )}
          </footer>
        </div>
      </main>
    </div>
  );
}
