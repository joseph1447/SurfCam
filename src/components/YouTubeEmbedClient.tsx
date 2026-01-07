"use client";

import { useRef, useEffect, useState } from "react";
import AdOverlay from "./AdOverlay";

interface YouTubeEmbedClientProps {
  videoId?: string;
  channelId?: string; // If provided, load the channel's current live stream
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
  onVideoPlay
}: YouTubeEmbedClientProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [overlays, setOverlays] = useState<AdOverlayData[]>([]);
  const [origin, setOrigin] = useState('');
  const resolvedChannelId = channelId || process.env.NEXT_PUBLIC_YT_CHANNEL_ID;

  // Log component initialization
  useEffect(() => {
    console.log('[YouTubeEmbedClient] Component initialized:', {
      videoId,
      channelId,
      resolvedChannelId,
      autoplay,
      muted,
      title
    });
  }, []);

  // Set origin only on client side to avoid hydration mismatch
  useEffect(() => {
    const currentOrigin = window.location.origin;
    console.log('[YouTubeEmbedClient] Setting origin:', currentOrigin);
    setOrigin(currentOrigin);
  }, []);

  // Timeout to show fallback if video doesn't load within 15 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isLoaded && !hasError) {
        console.log('[YouTubeEmbedClient] Timeout - showing fallback');
        setHasError(true);
      }
    }, 15000);

    return () => clearTimeout(timeout);
  }, [isLoaded, hasError]);

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
        console.error('[YouTubeEmbedClient] Error fetching overlays:', error);
      }
    };

    fetchOverlays();
  }, []);

  // Listen for messages from YouTube iframe (for debugging)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only process messages from YouTube
      if (event.origin !== 'https://www.youtube.com') {
        return;
      }
      
      console.log('[YouTubeEmbedClient] Message from YouTube iframe:', {
        origin: event.origin,
        data: event.data,
        type: typeof event.data
      });
      
      // Try to parse if it's a string
      if (typeof event.data === 'string') {
        try {
          const parsed = JSON.parse(event.data);
          console.log('[YouTubeEmbedClient] Parsed message data:', parsed);
        } catch (e) {
          // Not JSON, that's okay
        }
      }
    };

    window.addEventListener('message', handleMessage);
    console.log('[YouTubeEmbedClient] Added message listener for YouTube iframe');

    return () => {
      window.removeEventListener('message', handleMessage);
      console.log('[YouTubeEmbedClient] Removed message listener');
    };
  }, []);

  useEffect(() => {
    if (iframeRef.current) {
      console.log('[YouTubeEmbedClient] Iframe ref is available');
      console.log('[YouTubeEmbedClient] Iframe element:', iframeRef.current);
      console.log('[YouTubeEmbedClient] Iframe src:', iframeRef.current.src);
      setIsLoaded(true);
      if (onVideoReady) {
        // YouTube doesn't have the same event system as Twitch, so we'll simulate it
        console.log('[YouTubeEmbedClient] Scheduling onVideoReady callback (simulated)');
        setTimeout(() => {
          onVideoReady();
        }, 1000);
      }
    } else {
      console.log('[YouTubeEmbedClient] Iframe ref not available yet');
    }
  }, [onVideoReady]);

  const handleLoad = () => {
    console.log('[YouTubeEmbedClient] Iframe loaded successfully');
    
    // Check iframe state after load
    if (iframeRef.current) {
      console.log('[YouTubeEmbedClient] Iframe state after load:', {
        src: iframeRef.current.src,
        contentWindow: iframeRef.current.contentWindow ? 'available' : 'null',
        contentDocument: iframeRef.current.contentDocument ? 'available' : 'null (cross-origin)',
        width: iframeRef.current.width,
        height: iframeRef.current.height
      });
      
      // Try to check if the iframe content is accessible (will be null for cross-origin)
      try {
        const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
        if (iframeDoc) {
          console.log('[YouTubeEmbedClient] Iframe document accessible:', iframeDoc.title);
        } else {
          console.log('[YouTubeEmbedClient] Iframe document not accessible (cross-origin - this is normal)');
        }
      } catch (e) {
        console.log('[YouTubeEmbedClient] Cannot access iframe content (cross-origin - this is normal):', e);
      }
    }
    
    setIsLoaded(true);
    if (onVideoReady) {
      console.log('[YouTubeEmbedClient] Calling onVideoReady callback');
      onVideoReady();
    }
  };

  const handleError = (e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
    console.error('[YouTubeEmbedClient] Error loading iframe:', e);
    console.error('[YouTubeEmbedClient] Error details:', {
      type: e.type,
      target: e.target,
      currentTarget: e.currentTarget
    });
    setHasError(true);
  };

  // YouTube channel live URL for fallback
  const youtubeChannelLiveUrl = resolvedChannelId
    ? `https://www.youtube.com/channel/${resolvedChannelId}/live`
    : 'https://www.youtube.com/channel/UCa4397KS7YBwp7pkA8B5J6g/live';

  // Log the URL being used
  useEffect(() => {
    if (origin) {
      const embedUrl = resolvedChannelId
        ? `https://www.youtube.com/embed/live_stream?channel=${resolvedChannelId}&autoplay=1&mute=0&controls=1&modestbranding=1`
        : `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&modestbranding=1`;
      
      console.log('[YouTubeEmbedClient] Embed URL:', embedUrl);
      console.log('[YouTubeEmbedClient] Using channel ID:', resolvedChannelId);
      console.log('[YouTubeEmbedClient] Using video ID:', videoId);
    }
  }, [origin, resolvedChannelId, videoId]);

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
        
        {origin && !hasError && (() => {
          // Build embed URL - prioritize videoId over channelId
          let embedUrl: string;
          
          // Build query parameters based on props
          const params = new URLSearchParams();
          if (autoplay) {
            params.append('autoplay', '1');
          }
          if (muted) {
            params.append('mute', '1');
          }
          params.append('controls', '1');
          params.append('rel', '0');
          params.append('playsinline', '1');
          
          const queryString = params.toString();
          
          if (videoId) {
            // Use direct video embed with autoplay
            embedUrl = `https://www.youtube.com/embed/${videoId}${queryString ? '?' + queryString : ''}`;
          } else if (resolvedChannelId) {
            // Fallback to channel live stream
            embedUrl = `https://www.youtube.com/embed/live_stream?channel=${resolvedChannelId}${queryString ? '&' + queryString : ''}`;
          } else {
            console.error('[YouTubeEmbedClient] No videoId or channelId provided');
            embedUrl = '';
          }
          
          console.log('[YouTubeEmbedClient] Rendering iframe with URL:', embedUrl);
          console.log('[YouTubeEmbedClient] Video ID:', videoId);
          console.log('[YouTubeEmbedClient] Channel ID:', resolvedChannelId);
          
          if (!embedUrl) {
            return (
              <div className="text-white text-center p-8">
                <p className="text-lg mb-2">Error de configuración</p>
                <p className="text-sm">No se proporcionó Video ID o Channel ID</p>
              </div>
            );
          }
          
          return (
            <iframe
              ref={iframeRef}
              width={width}
              height={height}
              src={embedUrl}
              title={title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen={true}
              onLoad={handleLoad}
              onError={handleError}
              className={`w-full ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
              style={{ 
                backgroundColor: '#0f0f23',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none'
              }}
            />
          );
        })()}
        
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

      {/* Always visible link to YouTube channel */}
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
