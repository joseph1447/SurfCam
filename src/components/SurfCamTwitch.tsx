"use client";

import { useState, useEffect, Suspense, lazy, useCallback } from "react";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import TwitchEmbedClient from "./TwitchEmbedClient";
import YouTubeEmbedWrapper from "./YouTubeEmbedWrapper";
import ServerTabs from "./ServerTabs";
import { usePWA } from "@/hooks/usePWA";

// Lazy load components with different priorities
const RadioWidget = lazy(() => import("./RadioWidget"));

// Progressive loading hook
function useProgressiveLoading() {
  const [loadWidgets, setLoadWidgets] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadWidgets(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return { loadWidgets };
}

// Skeleton components for loading states
const RadioWidgetSkeleton = () => (
  <div className="w-full backdrop-blur-md bg-[#121419]/80 border border-white/10 rounded-2xl p-3 sm:p-4">
    <div className="flex items-center gap-3 animate-pulse">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-white/10 rounded w-32"></div>
        <div className="h-3 bg-white/10 rounded w-20"></div>
      </div>
    </div>
  </div>
);

export default function SurfCamTwitch() {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);
  const [currentServer, setCurrentServer] = useState<'twitch' | 'youtube'>('youtube');
  const [youtubeVideoId, setYoutubeVideoId] = useState('c5y9NOgTZuQ');
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
    window.dispatchEvent(new CustomEvent('surfcam:videoplay', { detail: data }));
  }, []);

  const handleServerChange = useCallback((server: 'twitch' | 'youtube') => {
    setCurrentServer(server);
  }, []);

  // Obtener el video ID de YouTube desde la configuración
  useEffect(() => {
    const fetchYoutubeVideoId = async () => {
      try {
        const response = await fetch('/api/site-config?key=youtube_video_id');
        if (response.ok) {
          const data = await response.json();
          if (data.value) {
            setYoutubeVideoId(data.value);
          }
        }
      } catch (error) {
        console.error('Error fetching YouTube video ID:', error);
        // Mantener el valor por defecto en caso de error
      }
    };

    fetchYoutubeVideoId();
  }, []);

  return (
    <>
      <AppHeader />
      <div className="flex-1 p-4 md:p-8">
        <div className="container mx-auto max-w-7xl">
          {/* PWA Install Banner */}
          {isInstallable && !isInstalled && (
            <div className="mb-6 bg-gradient-to-r from-[#3366BB] to-[#2A5599] text-white p-4 rounded-lg shadow-lg shadow-black/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-xl">📱</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Install the app!</h3>
                    <p className="text-sm opacity-90">Quick access from your home screen</p>
                  </div>
                </div>
                <Button
                  onClick={handleInstall}
                  disabled={isInstalling}
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  {isInstalling ? 'Installing...' : 'Install'}
                </Button>
              </div>
            </div>
          )}

          {/* Server Tabs */}
          <ServerTabs
            currentServer={currentServer}
            onServerChange={handleServerChange}
          />

          {/* Main content area - Video full width */}
          <div className="w-full space-y-4">
            {/* Video container - Full width */}
            <div className="w-full relative rounded-xl overflow-hidden shadow-2xl shadow-black/40">
              {currentServer === 'youtube' ? (
                <YouTubeEmbedWrapper
                  videoId={youtubeVideoId}
                  title="Pura Vida & Epic Waves | Santa Teresa Live Surf Cam 24/7 | Costa Rica"
                  autoplay={true}
                  muted={true}
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

        </div>
      </div>
    </>
  );
}
