"use client";

import { useState, useEffect, useRef, Suspense, lazy, useCallback } from "react";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TwitchEmbedClient from "./TwitchEmbedClient";
import { usePWA } from "@/hooks/usePWA";
// Removed useTwitchAuth import as we're now using TwitchEmbedClient's built-in auth
import { ChevronDown } from "lucide-react";

// Lazy load components with different priorities
const TideWidget = lazy(() => import("./TideWidget"));

// Custom hook for progressive loading
const useProgressiveLoading = () => {
  const [loadTideWidget, setLoadTideWidget] = useState(false);

  useEffect(() => {
    // Load TideWidget after a short delay (second priority)
    const tideTimer = setTimeout(() => {
      setLoadTideWidget(true);
    }, 100);

    return () => {
      clearTimeout(tideTimer);
    };
  }, []);

  return { loadTideWidget };
};

// Loading components
const TideWidgetSkeleton = () => (
  <div className="w-full lg:w-1/3">
    <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
      <div className="h-6 bg-gray-200 rounded mb-4"></div>
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded mb-4"></div>
      <div className="h-32 bg-gray-200 rounded"></div>
    </div>
  </div>
);

export default function SurfCamTwitch() {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const { loadTideWidget } = useProgressiveLoading();

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

  const handleVideoReady = useCallback(() => {
    console.log('🎥 SurfCamTwitch: Twitch video is ready');
  }, []);

  const handleVideoPlay = useCallback((data: { sessionId: string }) => {
    console.log('🎥 SurfCamTwitch: Twitch video started playing:', data);
  }, []);

  // Removed handleTwitchAuth as authentication is now handled by TwitchEmbedClient

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

          {/* User Status */}
          {/* User status is now handled by TwitchEmbedClient */}

          {/* Main content area with video and tide widget */}
          <div className="flex flex-col lg:flex-row gap-6 w-full">
            {/* Video container */}
            <div className="flex-grow w-full lg:w-2/3 relative">
              <div className="aspect-video w-full min-h-[70vh] relative rounded-xl overflow-hidden shadow-2xl shadow-primary/20">
                <TwitchEmbedClient
                  channel="elsurfo" // Replace with your actual Twitch channel
                  layout="video-with-chat"
                  autoplay={true}
                  muted={false}
                  theme="dark"
                  allowfullscreen={true}
                  onVideoReady={handleVideoReady}
                  onVideoPlay={handleVideoPlay}
                />
              </div>
            </div>
            
            {/* Tide Widget - sidebar on desktop, below on mobile */}
            <div className="w-full lg:w-1/3">
              {loadTideWidget ? (
                <Suspense fallback={<TideWidgetSkeleton />}>
                  <TideWidget />
                </Suspense>
              ) : (
                <TideWidgetSkeleton />
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
                Seataya
              </a>
              {' '}por brindarnos esta increíble vista a las olas.
            </p>
            <p className="text-xs text-muted-foreground mt-1">¿Buscas más contenido de surf?{' '}
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
            <div className="mt-4 flex justify-center gap-4">
              <a
                href="/politica-privacidad"
                className="text-xs text-gray-500 underline hover:text-primary cursor-pointer"
              >
                Política de Privacidad
              </a>
              <span className="text-xs text-gray-400">|</span>
              <a
                href="/condiciones-servicio"
                className="text-xs text-gray-500 underline hover:text-primary cursor-pointer"
              >
                Condiciones del Servicio
              </a>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
