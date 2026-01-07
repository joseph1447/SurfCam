"use client";

import { useState, useEffect, Suspense, lazy, useCallback } from "react";
import AppHeader from "@/components/AppHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TwitchEmbedClient from "./TwitchEmbedClient";
import YouTubeEmbedWrapper from "./YouTubeEmbedWrapper";
import ServerTabs from "./ServerTabs";
import { usePWA } from "@/hooks/usePWA";
// Removed useTwitchAuth import as we're now using TwitchEmbedClient's built-in auth
import { ChevronDown } from "lucide-react";

// Lazy load components with different priorities
const RadioWidget = lazy(() => import("./RadioWidget"));

// Progressive loading hook
function useProgressiveLoading() {
  const [loadWidgets, setLoadWidgets] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadWidgets(true);
    }, 1000); // Load widgets after 1 second

    return () => clearTimeout(timer);
  }, []);

  return { loadWidgets };
}

// Skeleton components for loading states
const RadioWidgetSkeleton = () => (
  <div className="w-full backdrop-blur-md bg-black/40 border border-cyan-500/20 rounded-2xl p-3 sm:p-4">
    <div className="flex items-center gap-3 animate-pulse">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-700"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-700 rounded w-32"></div>
        <div className="h-3 bg-gray-700 rounded w-20"></div>
      </div>
    </div>
  </div>
);

export default function SurfCamTwitch() {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [currentServer, setCurrentServer] = useState<'twitch' | 'youtube'>('twitch');
  const { loadWidgets } = useProgressiveLoading();

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
    // Dispatch custom event for RadioWidget to listen
    window.dispatchEvent(new CustomEvent('surfcam:videoplay', { detail: data }));
  }, []);

  const handleServerChange = useCallback((server: 'twitch' | 'youtube') => {
    setCurrentServer(server);
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


          {/* Server Tabs */}
          <ServerTabs 
            currentServer={currentServer} 
            onServerChange={handleServerChange} 
          />

          {/* User Status */}
          {/* User status is now handled by TwitchEmbedClient */}

          {/* Main content area - Video full width */}
          <div className="w-full space-y-4">
            {/* Video container - Full width */}
            <div className="w-full relative rounded-xl overflow-hidden shadow-2xl shadow-primary/20">
              {currentServer === 'youtube' ? (
                <YouTubeEmbedWrapper
                  videoId="c5y9NOgTZuQ"
                  title="Pura Vida & Epic Waves | Santa Teresa Live Surf Cam 24/7 | Costa Rica"
                  autoplay={true}
                  muted={false}
                  allowfullscreen={true}
                  onVideoReady={handleVideoReady}
                  onVideoPlay={handleVideoPlay}
                />
              ) : (
                <TwitchEmbedClient
                  channel="elsurfo"
                  layout="video-with-chat"
                  autoplay={true}
                  muted={false}
                  theme="dark"
                  allowfullscreen={true}
                  onVideoReady={handleVideoReady}
                  onVideoPlay={handleVideoPlay}
                />
              )}
            </div>

            {/* Radio Widget - Below video, horizontal layout */}
            {loadWidgets ? (
              <Suspense fallback={<RadioWidgetSkeleton />}>
                <RadioWidget />
              </Suspense>
            ) : (
              <RadioWidgetSkeleton />
            )}
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