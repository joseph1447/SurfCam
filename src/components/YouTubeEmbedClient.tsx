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
  };

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
        {!isLoaded && (
          <div className="text-white text-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p>{origin ? 'Cargando video de YouTube...' : 'Preparando reproductor...'}</p>
          </div>
        )}
        
        {origin && (() => {
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
    </div>
  );
}
