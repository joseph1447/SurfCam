"use client";

import { useRef, useEffect, useState } from "react";
import AdOverlay from "./AdOverlay";
import TideOverlay from "./TideOverlay";
import SurfboardCalculatorOverlay from "./SurfboardCalculatorOverlay";

interface YouTubeEmbedClientProps {
  videoId: string;
  title?: string;
  width?: string | number;
  height?: string | number;
  autoplay?: boolean;
  muted?: boolean;
  allowfullscreen?: boolean;
  onVideoReady?: () => void;
  onVideoPlay?: (data: { sessionId: string }) => void;
}

interface AdOverlayData {
  _id: string;
  logoUrl: string;
  text: string;
  redirectUrl: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export default function YouTubeEmbedClient({
  videoId,
  title = "Santa Teresa Live Surf Cam 24/7 | Costa Rica",
  width = "100%",
  height = 480,
  autoplay = true,
  muted = false,
  allowfullscreen = true,
  onVideoReady,
  onVideoPlay
}: YouTubeEmbedClientProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [overlays, setOverlays] = useState<AdOverlayData[]>([]);
  const [origin, setOrigin] = useState('');

  // Set origin only on client side to avoid hydration mismatch
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // Fetch overlays on component mount
  useEffect(() => {
    const fetchOverlays = async () => {
      try {
        const response = await fetch('/api/ad-overlays');
        if (response.ok) {
          const data = await response.json();
          setOverlays(data);
        }
      } catch (error) {
        console.error('Error fetching overlays:', error);
      }
    };

    fetchOverlays();
  }, []);

  useEffect(() => {
    if (iframeRef.current) {
      setIsLoaded(true);
      if (onVideoReady) {
        // YouTube doesn't have the same event system as Twitch, so we'll simulate it
        setTimeout(() => {
          onVideoReady();
        }, 1000);
      }
    }
  }, [onVideoReady]);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onVideoReady) {
      onVideoReady();
    }
  };

  return (
    <div className="w-full relative">
      <div 
        className="w-full flex items-center justify-center relative"
        style={{ height: typeof height === 'number' ? `${height}px` : height, backgroundColor: '#0f0f23' }}
      >
        {!isLoaded && (
          <div className="text-white text-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p>{origin ? 'Cargando video de YouTube...' : 'Preparando reproductor...'}</p>
          </div>
        )}
        
        {origin && (
          <iframe
            ref={iframeRef}
            width={width}
            height={height}
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&showinfo=0&rel=0&modestbranding=1&fs=1&cc_load_policy=0&iv_load_policy=3&autohide=0&disablekb=1&playsinline=1&enablejsapi=0&origin=${origin}`}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen={true}
            onLoad={handleLoad}
            className={`w-full ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
            style={{ 
              backgroundColor: '#0f0f23',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none'
            }}
          />
        )}
        
        {/* Selective overlay to allow YouTube controls but block other interactions */}
        <div 
          className="absolute inset-0 w-full h-full z-10"
          style={{ 
            backgroundColor: 'transparent',
            pointerEvents: 'none' // Allow clicks to pass through to iframe
          }}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
          onSelect={(e) => e.preventDefault()}
        />
      </div>
      
        {/* Ad Overlays */}
        <AdOverlay overlays={overlays} />
        
        {/* Tide Overlay */}
        <TideOverlay />
        
        {/* Surfboard Calculator Overlay */}
        <SurfboardCalculatorOverlay />
    </div>
  );
}
