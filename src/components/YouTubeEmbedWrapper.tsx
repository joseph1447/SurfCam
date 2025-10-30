"use client";

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamic import to ensure client-side only rendering
const YouTubeEmbedClient = dynamic(() => import('./YouTubeEmbedClient'), {
  ssr: false,
  loading: () => (
    <div className="w-full flex items-center justify-center" style={{ height: '480px', backgroundColor: '#0f0f23' }}>
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

export default function YouTubeEmbedWrapper(props: YouTubeEmbedWrapperProps) {
  return (
    <Suspense fallback={
      <div className="w-full flex items-center justify-center" style={{ height: '480px', backgroundColor: '#0f0f23' }}>
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
