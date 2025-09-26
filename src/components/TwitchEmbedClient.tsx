"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { useTwitchAuthCheck } from '@/hooks/useTwitchAuthCheck';
import TwitchLoginModal from './TwitchLoginModal';

interface TwitchEmbedClientProps {
  channel?: string;
  video?: string;
  collection?: string;
  width?: number | string;
  height?: number | string;
  layout?: 'video-with-chat' | 'video';
  autoplay?: boolean;
  muted?: boolean;
  theme?: 'light' | 'dark';
  allowfullscreen?: boolean;
  time?: string;
  parent?: string[];
  onVideoReady?: () => void;
  onVideoPlay?: (data: { sessionId: string }) => void;
}

declare global {
  interface Window {
    Twitch: {
      Embed: new (elementId: string, options: any) => {
        addEventListener: (event: string, callback: (data?: any) => void) => void;
        getPlayer: () => any;
      };
      Embed: {
        VIDEO_READY: string;
        VIDEO_PLAY: string;
      };
    };
  }
}

export default function TwitchEmbedClient({
  channel,
  video,
  collection,
  width = '100%',
  height = 480,
  layout = 'video-with-chat',
  autoplay = true,
  muted = false,
  theme = 'dark',
  allowfullscreen = true,
  time = '0h0m0s',
  parent = [],
  onVideoReady,
  onVideoPlay
}: TwitchEmbedClientProps) {
  // Use Twitch authentication check
  const { isAuthenticated, user, isLoading, loginWithTwitch } = useTwitchAuthCheck();
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const embedRef = useRef<HTMLDivElement>(null);
  const [embed, setEmbed] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [authTimeout, setAuthTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Generate a consistent ID
  const embedId = `twitch-embed-${channel || video || collection || 'default'}`;
  
  // Memoize callback functions
  const memoizedOnVideoReady = useCallback(() => {
    if (authTimeout) {
      clearTimeout(authTimeout);
      setAuthTimeout(null);
    }
    if (onVideoReady) onVideoReady();
  }, [onVideoReady, authTimeout]);
  
  const memoizedOnVideoPlay = useCallback((data: { sessionId: string }) => {
    if (onVideoPlay) onVideoPlay(data);
  }, [onVideoPlay]);

  // Handle authentication errors
  const handleAuthError = useCallback(() => {
    setShowLoginModal(true);
    if (authTimeout) {
      clearTimeout(authTimeout);
    }
  }, [authTimeout]);

  useEffect(() => {
    // Load Twitch embed script if not already loaded
    if (!window.Twitch) {
      const script = document.createElement('script');
      script.src = 'https://embed.twitch.tv/embed/v1.js';
      script.async = true;
      script.onload = () => {
        setIsLoaded(true);
      };
      script.onerror = (error) => {
        console.error('Error loading Twitch script:', error);
      };
      document.head.appendChild(script);
    } else {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    // Only run once when component is ready
    if (!isLoaded || !window.Twitch || !embedRef.current || embed) {
      return;
    }

    // Add a small delay to ensure the DOM element is fully rendered
    const timer = setTimeout(() => {
      // Check if the element with the embedId actually exists in the DOM
      const embedElement = document.getElementById(embedId);
      
      if (!embedElement) {
        console.error(`Element with ID ${embedId} not found in DOM`);
        return;
      }

      // Clear previous embed
      if (embedRef.current) {
        embedRef.current.innerHTML = '';
      }

      // Create new embed
      const embedOptions: any = {
        width,
        height,
        layout,
        autoplay,
        muted,
        theme,
        allowfullscreen,
        time,
      };

      // Add required parameters based on content type
      if (channel) {
        embedOptions.channel = channel;
      } else if (video) {
        embedOptions.video = video;
      } else if (collection) {
        embedOptions.collection = collection;
      }

      // Add parent domains if provided
      if (parent.length > 0) {
        embedOptions.parent = parent;
      }

      try {
        const newEmbed = new window.Twitch.Embed(embedId, embedOptions);
        setEmbed(newEmbed);

        // Add event listeners
        if (memoizedOnVideoReady) {
          newEmbed.addEventListener(window.Twitch.Embed.VIDEO_READY, memoizedOnVideoReady);
        }

        if (memoizedOnVideoPlay) {
          newEmbed.addEventListener(window.Twitch.Embed.VIDEO_PLAY, memoizedOnVideoPlay);
        }

        // Listen for authentication errors
        newEmbed.addEventListener('error', (event: any) => {
          if (event.error && (event.error.includes('1000') || event.error.includes('cancelado'))) {
            handleAuthError();
          }
        });

        // Set a timeout to show auth message if video doesn't load after 10 seconds
        const timeout = setTimeout(() => {
          handleAuthError();
        }, 10000);
        setAuthTimeout(timeout);
      } catch (error) {
        console.error('Error creating Twitch embed:', error);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (authTimeout) {
        clearTimeout(authTimeout);
      }
    };
  }, [isLoaded, embedId, channel, video, collection, width, height, layout, autoplay, muted, theme, allowfullscreen, time, parent, memoizedOnVideoReady, memoizedOnVideoPlay, handleAuthError, embed, authTimeout]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="w-full relative">
        <div 
          className="w-full flex items-center justify-center"
          style={{ height: '480px', backgroundColor: '#0f0f23' }}
        >
          <div className="text-white text-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p>Verificando autenticación...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="w-full relative">
        <div 
          className="w-full flex items-center justify-center"
          style={{ height: '480px', backgroundColor: '#0f0f23' }}
        >
          <div className="text-white text-center max-w-md mx-4">
            <div className="text-6xl mb-6">🎥</div>
            <h3 className="text-2xl font-bold mb-4">
              ¡Conecta con Twitch para ver el video!
            </h3>
            <p className="text-gray-300 mb-6">
              Para ver el video en vivo y participar en el chat, necesitas iniciar sesión con tu cuenta de Twitch.
            </p>
            <button 
              onClick={() => setShowLoginModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors text-lg"
            >
              Iniciar sesión con Twitch
            </button>
          </div>
        </div>
        
        <TwitchLoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLogin={loginWithTwitch}
        />
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <div 
        ref={embedRef}
        id={embedId}
        className="w-full"
        style={{ backgroundColor: '#0f0f23' }}
      />
      
      {/* Show user info if authenticated */}
      {isAuthenticated && user && (
        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm z-10">
          <div className="flex items-center gap-2">
            <img 
              src={user.profile_image_url} 
              alt={user.display_name}
              className="w-6 h-6 rounded-full"
            />
            <span>{user.display_name}</span>
          </div>
        </div>
      )}
    </div>
  );
}