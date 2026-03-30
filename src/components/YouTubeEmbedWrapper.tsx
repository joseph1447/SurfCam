"use client";

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Only load the heavy YouTube embed after user interaction
const YouTubeEmbedClient = dynamic(() => import('./YouTubeEmbedClient'), {
  ssr: false,
  loading: () => (
    <div className="w-full flex items-center justify-center" style={{ aspectRatio: '16/9', backgroundColor: '#0f0f23' }}>
      <div className="text-white text-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p>Cargando video de YouTube...</p>
      </div>
    </div>
  )
});

interface YouTubeEmbedWrapperProps {
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

// Lightweight facade - shows thumbnail instead of heavy YouTube iframe
function YouTubeFacade({
  videoId,
  title,
  onActivate,
}: {
  videoId?: string;
  channelId?: string;
  title?: string;
  onActivate: () => void;
}) {
  // Use YouTube thumbnail if videoId is available
  const thumbnailUrl = videoId
    ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
    : null;

  return (
    <button
      onClick={onActivate}
      className="w-full relative group cursor-pointer border-0 p-0 bg-[#0f0f23] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
      style={{ aspectRatio: '16/9' }}
      aria-label={`Play: ${title || 'Santa Teresa Live Surf Cam'}`}
    >
      {/* Thumbnail or branded placeholder */}
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt={title || 'Santa Teresa Live Surf Cam'}
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0f1f3d] to-[#0a1628] flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">🌊</div>
            <p className="text-white/70 text-sm font-medium">Santa Teresa Surf Cam</p>
            <p className="text-white/40 text-xs mt-1">En Vivo 24/7</p>
          </div>
        </div>
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-200" />

      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-600 group-hover:bg-red-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-black/50 transition-all duration-200 group-hover:scale-110">
          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      {/* Live badge */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600/90 backdrop-blur-sm px-2.5 py-1 rounded-md">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        <span className="text-white text-xs font-bold tracking-wide">EN VIVO</span>
      </div>

      {/* Title */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <p className="text-white text-sm font-medium text-left truncate">
          {title || 'Santa Teresa Live Surf Cam 24/7 | Costa Rica'}
        </p>
      </div>
    </button>
  );
}

export default function YouTubeEmbedWrapper(props: YouTubeEmbedWrapperProps) {
  const [activated, setActivated] = useState(false);

  const handleActivate = useCallback(() => {
    setActivated(true);
    // Preconnect to YouTube only when user decides to watch
    const origins = ['https://www.youtube.com', 'https://i.ytimg.com'];
    origins.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = href;
      document.head.appendChild(link);
    });
  }, []);

  if (!activated) {
    return (
      <YouTubeFacade
        videoId={props.videoId}
        channelId={props.channelId}
        title={props.title}
        onActivate={handleActivate}
      />
    );
  }

  return (
    <Suspense fallback={
      <div className="w-full flex items-center justify-center" style={{ aspectRatio: '16/9', backgroundColor: '#0f0f23' }}>
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Cargando video de YouTube...</p>
        </div>
      </div>
    }>
      <YouTubeEmbedClient {...props} />
    </Suspense>
  );
}
