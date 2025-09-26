"use client";

import { useEffect, useRef, useState, useCallback } from 'react';

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
  console.log('🔧 TwitchEmbedClient: Component function called with channel =', channel);
  const embedRef = useRef<HTMLDivElement>(null);
  const [embed, setEmbed] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showAuthMessage, setShowAuthMessage] = useState(false);
  const [authTimeout, setAuthTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Generate a consistent ID
  const embedId = `twitch-embed-${channel || video || collection || 'default'}`;
  
  // Memoize callback functions
  const memoizedOnVideoReady = useCallback(() => {
    console.log('🔧 TwitchEmbedClient: Video ready - clearing auth timeout');
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
    console.log('🔧 TwitchEmbedClient: Authentication required');
    setShowAuthMessage(true);
    if (authTimeout) {
      clearTimeout(authTimeout);
    }
  }, [authTimeout]);

  useEffect(() => {
    console.log('🔧 TwitchEmbedClient: Component mounted');
    console.log('🔧 TwitchEmbedClient: embedId =', embedId);
    console.log('🔧 TwitchEmbedClient: channel =', channel);
    console.log('🔧 TwitchEmbedClient: window.Twitch exists?', !!window.Twitch);
    
    // Load Twitch embed script if not already loaded
    if (!window.Twitch) {
      console.log('🔧 TwitchEmbedClient: Loading Twitch script...');
      const script = document.createElement('script');
      script.src = 'https://embed.twitch.tv/embed/v1.js';
      script.async = true;
      script.onload = () => {
        console.log('🔧 TwitchEmbedClient: Twitch script loaded successfully');
        setIsLoaded(true);
      };
      script.onerror = (error) => {
        console.error('🔧 TwitchEmbedClient: Error loading Twitch script:', error);
      };
      document.head.appendChild(script);
    } else {
      console.log('🔧 TwitchEmbedClient: Twitch script already loaded');
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    console.log('🔧 TwitchEmbedClient: useEffect triggered with:', {
      isLoaded,
      hasTwitch: !!window.Twitch,
      hasRef: !!embedRef.current,
      hasEmbed: !!embed,
      embedId
    });

    // Only run once when component is ready
    if (!isLoaded || !window.Twitch || !embedRef.current || embed) {
      console.log('🔧 TwitchEmbedClient: Early return - conditions not met');
      return;
    }

    console.log('🔧 TwitchEmbedClient: Creating embed (one time only)');

    // Add a small delay to ensure the DOM element is fully rendered
    const timer = setTimeout(() => {
      console.log('🔧 TwitchEmbedClient: Timer fired, checking DOM element');
      
      // Check if the element with the embedId actually exists in the DOM
      const embedElement = document.getElementById(embedId);
      console.log('🔧 TwitchEmbedClient: DOM element found:', !!embedElement);
      console.log('🔧 TwitchEmbedClient: Element ID in DOM:', embedElement?.id);
      
      if (!embedElement) {
        console.error(`🔧 TwitchEmbedClient: Element with ID ${embedId} not found in DOM`);
        console.log('🔧 TwitchEmbedClient: Available elements with twitch-embed prefix:');
        const allElements = document.querySelectorAll('[id^="twitch-embed-"]');
        allElements.forEach(el => console.log('  -', el.id));
        console.log('🔧 TwitchEmbedClient: All elements in document:');
        const allIds = document.querySelectorAll('[id]');
        allIds.forEach(el => console.log('  -', el.id));
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
        console.log('🔧 TwitchEmbedClient: Twitch embed created successfully');
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
          console.log('🔧 TwitchEmbedClient: Error event received:', event);
          if (event.error && (event.error.includes('1000') || event.error.includes('cancelado'))) {
            handleAuthError();
          }
        });

        // Set a timeout to show auth message if video doesn't load after 10 seconds
        const timeout = setTimeout(() => {
          console.log('🔧 TwitchEmbedClient: Video load timeout - showing auth message');
          handleAuthError();
        }, 10000);
        setAuthTimeout(timeout);
      } catch (error) {
        console.error('🔧 TwitchEmbedClient: Error creating Twitch embed:', error);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (authTimeout) {
        clearTimeout(authTimeout);
      }
    };
  }, [isLoaded, embedId, channel, video, collection, width, height, layout, autoplay, muted, theme, allowfullscreen, time, parent, memoizedOnVideoReady, memoizedOnVideoPlay, handleAuthError, embed, authTimeout]);

  console.log('🔧 TwitchEmbedClient: Rendering with embedId =', embedId);

  return (
    <div className="w-full relative">
      <div 
        ref={embedRef}
        id={embedId}
        className="w-full"
        style={{ minHeight: '480px', backgroundColor: '#0f0f23' }}
      />
      
      {/* Authentication message overlay */}
      {showAuthMessage && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md mx-4 text-center shadow-xl">
            <div className="text-6xl mb-4">🔐</div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Inicia sesión con Twitch
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Para ver el video en vivo, necesitas iniciar sesión con tu cuenta de Twitch. 
              Haz clic en el botón "Sign In" en el reproductor de video.
            </p>
            <div className="space-y-3">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                💡 <strong>Tip:</strong> Si no tienes cuenta de Twitch, puedes crear una gratis
              </div>
              <button 
                onClick={() => setShowAuthMessage(false)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
