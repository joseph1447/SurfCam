"use client";

import { useRef, useEffect, useState } from "react";
import AdOverlay from "./AdOverlay";

interface YouTubeEmbedClientProps {
  videoId?: string;
  channelId?: string;
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
  channelId,
  title = "Santa Teresa Live Surf Cam 24/7 | Costa Rica",
  width = "100%",
  height = 480,
  autoplay = true,
  muted = false,
  allowfullscreen = true,
  onVideoReady,
}: YouTubeEmbedClientProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [overlays, setOverlays] = useState<AdOverlayData[]>([]);
  const [origin, setOrigin] = useState('');
  const resolvedChannelId = channelId || process.env.NEXT_PUBLIC_YT_CHANNEL_ID;

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isLoaded && !hasError) {
        setHasError(true);
      }
    }, 15000);
    return () => clearTimeout(timeout);
  }, [isLoaded, hasError]);

  useEffect(() => {
    const fetchOverlays = async () => {
      try {
        const response = await fetch('/api/ad-overlays');
        if (response.ok) {
          const data = await response.json();
          setOverlays(data);
        }
      } catch {
        // Silently fail for overlays
      }
    };
    fetchOverlays();
  }, []);

  useEffect(() => {
    if (iframeRef.current) {
      setIsLoaded(true);
      if (onVideoReady) {
        setTimeout(onVideoReady, 1000);
      }
    }
  }, [onVideoReady]);

  const handleLoad = () => {
    setIsLoaded(true);
    onVideoReady?.();
  };

  const handleError = () => {
    setHasError(true);
  };

  const youtubeChannelLiveUrl = resolvedChannelId
    ? `https://www.youtube.com/channel/${resolvedChannelId}/live`
    : 'https://www.youtube.com/channel/UCa4397KS7YBwp7pkA8B5J6g/live';

  // Build embed URL
  const getEmbedUrl = () => {
    if (!origin) return '';

    const params = new URLSearchParams();
    if (autoplay) params.append('autoplay', '1');
    if (muted) params.append('mute', '1');
    params.append('controls', '1');
    params.append('rel', '0');
    params.append('playsinline', '1');

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
    } else if (resolvedChannelId) {
      return `https://www.youtube.com/embed/live_stream?channel=${resolvedChannelId}&${params.toString()}`;
    }
    return '';
  };

  const embedUrl = getEmbedUrl();

  return (
    <div className="w-full relative">
      <div
        className="w-full flex items-center justify-center relative"
        style={{ height: typeof height === 'number' ? `${height}px` : height, backgroundColor: '#0f0f23' }}
      >
        {!isLoaded && !hasError && (
          <div className="text-white text-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p>{origin ? 'Cargando video de YouTube...' : 'Preparando reproductor...'}</p>
          </div>
        )}

        {hasError && (
          <div className="text-white text-center p-8">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-lg mb-2">No se pudo cargar el video</p>
            <p className="text-sm text-gray-400 mb-6">La transmisión puede no estar disponible en este momento</p>
            <a
              href={youtubeChannelLiveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              Ir al Canal de YouTube
            </a>
          </div>
        )}

        {embedUrl && !hasError && (
          <iframe
            ref={iframeRef}
            width={width}
            height={height}
            src={embedUrl}
            title={title}
            frameBorder="0"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen={allowfullscreen}
            onLoad={handleLoad}
            onError={handleError}
            className={`w-full ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
            style={{ backgroundColor: '#0f0f23' }}
          />
        )}

        <div
          className="absolute inset-0 w-full h-full z-10"
          style={{ backgroundColor: 'transparent', pointerEvents: 'none' }}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>

      <AdOverlay overlays={overlays} />

      <div className="mt-3 flex items-center justify-center gap-4 text-sm">
        <span className="text-gray-400">¿Problemas con el video?</span>
        <a
          href={youtubeChannelLiveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          Ver en YouTube
        </a>
      </div>
    </div>
  );
}
