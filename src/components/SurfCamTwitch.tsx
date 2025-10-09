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

// Progressive loading hook
function useProgressiveLoading() {
  const [loadTideWidget, setLoadTideWidget] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadTideWidget(true);
    }, 1000); // Load tide widget after 1 second

    return () => clearTimeout(timer);
  }, []);

  return { loadTideWidget };
}

// Skeleton components for loading states
const TideWidgetSkeleton = () => (
  <Card className="w-full">
    <CardContent className="p-6">
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    </CardContent>
  </Card>
);

export default function SurfCamTwitch() {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const { loadTideWidget } = useProgressiveLoading();

  const handleInstall = async () => {
    if (!isInstallable) return;
    
    setIsInstalling(true);
    try {
      await installApp();
    } catch (error) {
      console.error('Error installing app:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleVideoReady = useCallback(() => {
    // Video is ready
  }, []);

  const handleVideoPlay = useCallback((data: { sessionId: string }) => {
    // Video started playing
  }, []);

  // Removed handleTwitchAuth as authentication is now handled by TwitchEmbedClient

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1 p-4 md:p-8">
        <div className="container mx-auto max-w-7xl">
          {/* PWA Install Banner */}
          {isInstallable && !isInstalled && (
            <div className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    📱
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">¡Instala la app!</h3>
                    <p className="text-sm opacity-90">Acceso rápido desde tu pantalla de inicio</p>
                  </div>
                </div>
                <Button
                  onClick={handleInstall}
                  disabled={isInstalling}
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                >
                  {isInstalling ? 'Instalando...' : 'Instalar'}
                </Button>
              </div>
            </div>
          )}

          {/* Seataya Banner */}
          <div className="mb-6 bg-black py-4">
            <a 
              href="https://seataya.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block hover:opacity-90 transition-opacity"
            >
              <img 
                src="https://seataya.com/wp-content/uploads/logo.avif" 
                alt="Seataya - Ocean & Jungle View Villas Resort" 
                className="h-12 w-auto mx-auto"
              />
            </a>
          </div>

          {/* User Status */}
          {/* User status is now handled by TwitchEmbedClient */}

          {/* Main content area with video and tide widget */}
          <div className="flex flex-col lg:flex-row gap-6 w-full">
            {/* Video container */}
            <div className="flex-grow w-full lg:w-2/3 relative">
              <div className="w-full relative rounded-xl overflow-hidden shadow-2xl shadow-primary/20">
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

          {/* Additional content sections */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Surf Lessons Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    🏄‍♂️
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Clases de Surf</h3>
                    <p className="text-sm text-gray-600">Aprende con los mejores</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  Clases personalizadas para todos los niveles. Instructores certificados y equipamiento incluido.
                </p>
                <Link href="/surf-lessons">
                  <Button className="w-full">Ver Clases</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Accommodation Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    🏨
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Hospedaje</h3>
                    <p className="text-sm text-gray-600">Cerca de las mejores olas</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  Alojamiento cómodo y accesible. Perfecto para tu estadía de surf en Santa Teresa.
                </p>
                <Link href="/hospedaje">
                  <Button className="w-full">Ver Opciones</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Restaurants Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    🍽️
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Restaurantes</h3>
                    <p className="text-sm text-gray-600">Sabor local y fresco</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  Los mejores restaurantes de la zona. Comida fresca y deliciosa después de surfear.
                </p>
                <Link href="/restaurantes">
                  <Button className="w-full">Ver Restaurantes</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Instructions for first-time users */}
          {!showInstructions && (
            <div className="mt-8 text-center">
              <Button
                variant="outline"
                onClick={() => setShowInstructions(true)}
                className="flex items-center gap-2 mx-auto"
              >
                <ChevronDown className="w-4 h-4" />
                ¿Primera vez aquí?
              </Button>
            </div>
          )}

          {showInstructions && (
            <Card className="mt-6">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">¡Bienvenido a Santa Teresa Surf Cam!</h3>
                <div className="space-y-3 text-gray-700">
                  <p>• <strong>Video en vivo:</strong> Ve las condiciones actuales de las olas en tiempo real</p>
                  <p>• <strong>Chat:</strong> Conecta con otros surfistas y comparte información</p>
                  <p>• <strong>Mareas:</strong> Consulta las mareas y condiciones del mar</p>
                  <p>• <strong>Reportes:</strong> Los usuarios pueden reportar las condiciones actuales</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowInstructions(false)}
                  className="mt-4"
                >
                  Entendido
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}