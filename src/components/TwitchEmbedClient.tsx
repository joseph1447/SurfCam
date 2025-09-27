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
      Embed: {
        new (elementId: string, options: any): {
          addEventListener: (event: string, callback: (data?: any) => void) => void;
          getPlayer: () => any;
        };
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
  console.log('🔧 TwitchEmbedClient: Component initialized with props:', { channel, video, collection, layout });
  
  // Use Twitch authentication check
  const { isAuthenticated, user, isLoading, loginWithTwitch } = useTwitchAuthCheck();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isChannelOffline, setIsChannelOffline] = useState(false);
  const [authStep, setAuthStep] = useState<'idle' | 'checking' | 'login' | 'follow' | 'storage' | 'success'>('idle');
  const [authError, setAuthError] = useState<string | null>(null);
  
  console.log('🔧 TwitchEmbedClient: Auth state:', { 
    isAuthenticated, 
    user: user?.display_name, 
    isLoading, 
    authStep,
    authError 
  });
  
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
  const handleAuthError = useCallback((error?: string) => {
    console.log('🔧 Twitch Auth: Authentication error detected:', error);
    setAuthStep('login');
    setAuthError(error || 'Error de autenticación');
    setShowLoginModal(true);
    if (authTimeout) {
      clearTimeout(authTimeout);
    }
  }, [authTimeout]);

  // Handle successful authentication
  const handleAuthSuccess = useCallback(() => {
    console.log('🔧 Twitch Auth: Authentication successful');
    console.log('🔧 Twitch Auth: User state:', { isAuthenticated, user: user?.display_name });
    setAuthStep('success');
    setAuthError(null);
    setShowLoginModal(false);
    if (authTimeout) {
      clearTimeout(authTimeout);
      setAuthTimeout(null);
    }
  }, [authTimeout, isAuthenticated, user]);

  // Handle follow step
  const handleFollowStep = useCallback(() => {
    console.log('🔧 Twitch Auth: Moving to follow step');
    setAuthStep('follow');
    setAuthError(null);
  }, []);

  // Handle storage step
  const handleStorageStep = useCallback(() => {
    console.log('🔧 Twitch Auth: Moving to storage step');
    setAuthStep('storage');
    setAuthError(null);
  }, []);

  useEffect(() => {
    // Load Twitch embed script if not already loaded
    if (!window.Twitch) {
      console.log('🔧 Twitch Embed: Loading Twitch embed script...');
      const script = document.createElement('script');
      script.src = 'https://embed.twitch.tv/embed/v1.js';
      script.async = true;
      script.onload = () => {
        console.log('🔧 Twitch Embed: Script loaded successfully');
        setIsLoaded(true);
      };
      script.onerror = (error) => {
        console.error('🔧 Twitch Embed: Error loading Twitch script:', error);
      };
      document.head.appendChild(script);
    } else {
      console.log('🔧 Twitch Embed: Script already loaded');
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    // Only run once when component is ready
    if (!isLoaded || !window.Twitch || !embedRef.current || embed) {
      console.log('🔧 Twitch Embed: Not ready to create embed:', { 
        isLoaded, 
        hasTwitch: !!window.Twitch, 
        hasRef: !!embedRef.current, 
        hasEmbed: !!embed 
      });
      return;
    }

    console.log('🔧 Twitch Embed: Ready to create embed');

    // Add a small delay to ensure the DOM element is fully rendered
    const timer = setTimeout(() => {
      // Check if the element with the embedId actually exists in the DOM
      const embedElement = document.getElementById(embedId);
      
      if (!embedElement) {
        console.error(`🔧 Twitch Embed: Element with ID ${embedId} not found in DOM`);
        return;
      }

      console.log('🔧 Twitch Embed: DOM element found, clearing previous content');

      // Clear previous embed
      if (embedRef.current) {
        embedRef.current.innerHTML = '';
      }

      // Create new embed
      const embedOptions: any = {
        width,
        height,
        layout,
        autoplay: false, // Disable autoplay to avoid visibility issues
        muted: true, // Start muted to comply with browser policies
        theme,
        allowfullscreen: true,
        allowfullscreenInteractive: true,
        time,
        // Add parent domain for security
        parent: [window.location.hostname],
        // Add additional options to help with stream loading
        quality: 'auto',
        controls: true,
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
        console.log('🔧 Twitch Embed: Creating embed with options:', embedOptions);
        console.log('🔧 Twitch Embed: User authentication state:', { 
          isAuthenticated, 
          user: user?.display_name,
          hasToken: !!localStorage.getItem('twitch_access_token')
        });
        
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
          console.log('🔧 Twitch Embed: Error event received:', event);
          console.log('🔧 Twitch Embed: Error event - user state:', { 
            isAuthenticated, 
            user: user?.display_name,
            hasToken: !!localStorage.getItem('twitch_access_token')
          });
          
          // Handle different types of errors
          if (event.error) {
            const errorCode = event.error.code || event.error;
            const errorMessage = event.error.message || '';
            
            console.log('🔧 Twitch Embed: Error details:', { code: errorCode, message: errorMessage });
            console.log('🔧 Twitch Embed: Full error object:', event.error);
            
            // Error 1000: Video download cancelled (usually means channel is offline or restricted)
            if (errorCode === 1000 || errorMessage.includes('1000') || errorMessage.includes('cancelado')) {
              console.log('🔧 Twitch Embed: Error 1000 detected - Video download cancelled');
              console.log('🔧 Twitch Embed: This could mean:');
              console.log('  - Channel is offline');
              console.log('  - User needs to authenticate with Twitch');
              console.log('  - Channel has restrictions');
              console.log('  - HLS master playlist parsing failed');
              console.log('🔧 Twitch Embed: Current auth state:', { isAuthenticated, hasToken: !!localStorage.getItem('twitch_access_token') });
              
              // If user is authenticated but still getting 1000, it might be a channel issue
              if (isAuthenticated) {
                console.log('🔧 Twitch Embed: User is authenticated but getting 1000 error');
                console.log('🔧 Twitch Embed: This suggests the channel may be offline or having stream issues');
                console.log('🔧 Twitch Embed: HLS master playlist error indicates stream is not available');
                console.log('🔧 Twitch Embed: Moving to follow step to help user connect');
                
                // Instead of reloading, guide user through follow process
                handleFollowStep();
              } else {
                console.log('🔧 Twitch Embed: User not authenticated and getting 1000 error - showing login');
                handleAuthError('Necesitas iniciar sesión para ver el contenido');
              }
              return;
            }
            
            // Authentication errors
            if (errorMessage.includes('authentication') || errorMessage.includes('unauthorized')) {
              console.log('🔧 Twitch Embed: Authentication error detected');
              handleAuthError();
            }

            // HLS/Stream errors
            if (errorMessage.includes('HLS') || errorMessage.includes('playlist') || errorMessage.includes('stream')) {
              console.log('🔧 Twitch Embed: HLS/Stream error detected');
              console.log('🔧 Twitch Embed: This indicates stream is not available or has issues');
              console.log('🔧 Twitch Embed: Channel may be offline or experiencing technical difficulties');
              setIsChannelOffline(true);
            }
          }
        });

        // Listen for successful video load
        newEmbed.addEventListener(window.Twitch.Embed.VIDEO_READY, () => {
          console.log('🔧 Twitch Embed: Video ready - embed loaded successfully');
          console.log('🔧 Twitch Embed: Video ready - user state:', { 
            isAuthenticated, 
            user: user?.display_name,
            hasToken: !!localStorage.getItem('twitch_access_token')
          });
          handleAuthSuccess();
        });

        // Listen for video play event
        newEmbed.addEventListener(window.Twitch.Embed.VIDEO_PLAY, () => {
          console.log('🔧 Twitch Embed: Video started playing');
          console.log('🔧 Twitch Embed: Stream is working correctly');
        });

        // Listen for video pause event
        newEmbed.addEventListener('pause', () => {
          console.log('🔧 Twitch Embed: Video paused');
        });

        // Listen for video ended event
        newEmbed.addEventListener('ended', () => {
          console.log('🔧 Twitch Embed: Video ended');
        });

        // Set a timeout to show auth message if video doesn't load after 20 seconds
        const timeout = setTimeout(() => {
          console.log('🔧 Twitch Embed: Timeout reached after 20 seconds');
          console.log('🔧 Twitch Embed: Timeout - user state:', { 
            isAuthenticated, 
            user: user?.display_name,
            hasToken: !!localStorage.getItem('twitch_access_token'),
            authStep
          });
          
          // Only show auth error if user is not authenticated
          // If user is authenticated but video doesn't load, it might be channel offline
          if (!isAuthenticated) {
            console.log('🔧 Twitch Embed: Timeout - user not authenticated, showing login');
            handleAuthError('El video no pudo cargar. Intenta iniciar sesión nuevamente.');
          } else {
            console.log('🔧 Twitch Embed: Timeout - user authenticated but video not loading');
            console.log('🔧 Twitch Embed: This could mean:');
            console.log('  - Channel is offline');
            console.log('  - Network issues');
            console.log('  - Twitch embed configuration issues');
            console.log('  - User needs to follow the channel');
            
            // If user is authenticated but video doesn't load, guide them through follow process
            if (authStep === 'idle') {
              handleFollowStep();
            } else {
              setIsChannelOffline(true);
            }
          }
        }, 20000);
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
    console.log('🔧 TwitchEmbedClient: Loading state - checking authentication');
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

  // Show channel offline message
  if (isChannelOffline) {
    return (
      <div className="w-full relative">
        <div 
          className="w-full flex items-center justify-center"
          style={{ height: '480px', backgroundColor: '#0f0f23' }}
        >
          <div className="text-white text-center max-w-md mx-4">
            <div className="text-6xl mb-6">📺</div>
            <h3 className="text-2xl font-bold mb-4">
              Canal no disponible
            </h3>
            <p className="text-gray-300 mb-6">
              El canal de Twitch no está transmitiendo en este momento o está experimentando problemas técnicos. 
              Vuelve más tarde para ver el contenido en vivo.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => {
                  console.log('🔧 Twitch Embed: User clicked retry button');
                  setIsChannelOffline(false);
                  window.location.reload();
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors text-lg w-full"
              >
                Reintentar
              </button>
              <button 
                onClick={() => {
                  console.log('🔧 Twitch Embed: User clicked check channel button');
                  window.open(`https://www.twitch.tv/${channel}`, '_blank');
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors text-lg w-full"
              >
                Ver en Twitch
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show authentication flow based on current step
  if (!isAuthenticated || authStep !== 'idle') {
    console.log('🔧 TwitchEmbedClient: Showing authentication flow, step:', authStep);
    
    return (
      <div className="w-full relative">
        <div 
          className="w-full flex items-center justify-center"
          style={{ height: '480px', backgroundColor: '#0f0f23' }}
        >
          <div className="text-white text-center max-w-md mx-4">
            {/* Step 1: Initial Login */}
            {authStep === 'idle' && !isAuthenticated && (
              <>
                <div className="text-6xl mb-6">🎥</div>
                <h3 className="text-2xl font-bold mb-4">
                  ¡Conecta con Twitch para ver el video!
                </h3>
                <p className="text-gray-300 mb-6">
                  Para ver el video en vivo y participar en el chat, necesitas iniciar sesión con tu cuenta de Twitch.
                </p>
                <button 
                  onClick={() => {
                    setAuthStep('checking');
                    loginWithTwitch();
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors text-lg"
                >
                  Iniciar sesión con Twitch
                </button>
              </>
            )}

            {/* Step 2: Follow Channel */}
            {authStep === 'follow' && (
              <>
                <div className="text-6xl mb-6">❤️</div>
                <h3 className="text-2xl font-bold mb-4">
                  ¡Sigue al canal para continuar!
                </h3>
                <p className="text-gray-300 mb-6">
                  Para acceder al contenido, necesitas seguir al canal. Haz clic en el botón de seguir que aparece en el reproductor.
                </p>
                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      setAuthStep('storage');
                      handleStorageStep();
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors text-lg w-full"
                  >
                    Ya seguí al canal
                  </button>
                  <button 
                    onClick={() => setAuthStep('idle')}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors text-lg w-full"
                  >
                    Volver
                  </button>
                </div>
              </>
            )}

            {/* Step 3: Storage Permission */}
            {authStep === 'storage' && (
              <>
                <div className="text-6xl mb-6">🍪</div>
                <h3 className="text-2xl font-bold mb-4">
                  Permite el acceso al almacenamiento
                </h3>
                <p className="text-gray-300 mb-6">
                  Twitch necesita acceso a las cookies de tu navegador para finalizar el inicio de sesión. 
                  Acepta cuando aparezca la ventana emergente.
                </p>
                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      setAuthStep('success');
                      handleAuthSuccess();
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors text-lg w-full"
                  >
                    Ya concedí el acceso
                  </button>
                  <button 
                    onClick={() => setAuthStep('follow')}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors text-lg w-full"
                  >
                    Volver
                  </button>
                </div>
              </>
            )}

            {/* Step 4: Success */}
            {authStep === 'success' && (
              <>
                <div className="text-6xl mb-6">✅</div>
                <h3 className="text-2xl font-bold mb-4">
                  ¡Listo! Cargando el video...
                </h3>
                <p className="text-gray-300 mb-6">
                  Tu autenticación se completó correctamente. El video debería cargar en unos segundos.
                </p>
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
              </>
            )}

            {/* Error State */}
            {authError && (
              <div className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
                <p className="text-red-200 text-sm">{authError}</p>
                <button 
                  onClick={() => {
                    setAuthError(null);
                    setAuthStep('idle');
                  }}
                  className="mt-2 text-red-300 hover:text-red-100 text-sm underline"
                >
                  Intentar de nuevo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  console.log('🔧 TwitchEmbedClient: Rendering authenticated embed');
  console.log('🔧 TwitchEmbedClient: Final state:', { 
    isAuthenticated, 
    user: user?.display_name,
    hasToken: !!localStorage.getItem('twitch_access_token'),
    embedId,
    channel,
    isLoaded,
    hasEmbed: !!embed
  });

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