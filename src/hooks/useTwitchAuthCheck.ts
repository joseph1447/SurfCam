"use client";

import { useState, useEffect, useCallback } from 'react';

interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  created_at: string;
}

interface TwitchAuthState {
  isAuthenticated: boolean;
  user: TwitchUser | null;
  isLoading: boolean;
  error: string | null;
}

export function useTwitchAuthCheck() {
  const [authState, setAuthState] = useState<TwitchAuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    error: null
  });

  const checkTwitchAuth = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      // Check if we have a stored token
      const storedToken = localStorage.getItem('twitch_access_token');
      const storedUser = localStorage.getItem('twitch_user');

      if (storedToken && storedUser) {
        try {
          console.log('🔧 Twitch Auth: Validating stored token');
          
          // Verify the token is still valid by making a request
          const response = await fetch('https://api.twitch.tv/helix/users', {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'Client-Id': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID || ''
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.data && data.data.length > 0) {
              console.log('🔧 Twitch Auth: Token valid, user authenticated');
              setAuthState({
                isAuthenticated: true,
                user: data.data[0],
                isLoading: false,
                error: null
              });
              return;
            }
          } else if (response.status === 401) {
            console.log('🔧 Twitch Auth: Token expired, clearing storage');
            // Token expired, clear storage
            localStorage.removeItem('twitch_access_token');
            localStorage.removeItem('twitch_refresh_token');
            localStorage.removeItem('twitch_user');
          }
        } catch (error) {
          console.error('🔧 Twitch Auth: Error validating token:', error);
          // Clear invalid tokens
          localStorage.removeItem('twitch_access_token');
          localStorage.removeItem('twitch_refresh_token');
          localStorage.removeItem('twitch_user');
        }
      } else {
        console.log('🔧 Twitch Auth: No stored token found');
      }

      // If we get here, user is not authenticated
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null
      });

    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, []);

  const loginWithTwitch = useCallback(() => {
    const clientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID;
    const redirectUri = `${window.location.origin}/api/twitch/auth/callback`;
    const scope = 'user:read:email';
    
    console.log('🔧 Twitch Auth: Starting login process');
    console.log('🔧 Twitch Auth: Client ID =', clientId ? 'SET' : 'NOT SET');
    console.log('🔧 Twitch Auth: Redirect URI =', redirectUri);
    
    if (!clientId) {
      console.error('🔧 Twitch Auth: NEXT_PUBLIC_TWITCH_CLIENT_ID is not defined!');
      alert('Error: NEXT_PUBLIC_TWITCH_CLIENT_ID no está configurado. Por favor, verifica las variables de entorno.');
      return;
    }
    
    // Clear any existing tokens before starting new auth
    localStorage.removeItem('twitch_access_token');
    localStorage.removeItem('twitch_refresh_token');
    localStorage.removeItem('twitch_user');
    
    const authUrl = `https://id.twitch.tv/oauth2/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${scope}&` +
      `force_verify=true`; // Force re-authentication
    
    console.log('🔧 Twitch Auth: Redirecting to:', authUrl);
    window.location.href = authUrl;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('twitch_access_token');
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null
    });
  }, []);

  useEffect(() => {
    checkTwitchAuth();
  }, [checkTwitchAuth]);

  return {
    ...authState,
    loginWithTwitch,
    logout,
    refreshAuth: checkTwitchAuth
  };
}