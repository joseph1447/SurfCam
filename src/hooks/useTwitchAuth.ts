"use client";

import { useState, useEffect, useCallback } from 'react';

export interface TwitchUser {
  _id: string;
  username: string;
  email: string;
  profileImage?: string;
  accessType: string;
  twitchData?: any;
}

export interface TwitchAuthHook {
  user: TwitchUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (accessToken: string) => Promise<boolean>;
  logout: () => void;
  error: string | null;
}

export function useTwitchAuth(): TwitchAuthHook {
  const [user, setUser] = useState<TwitchUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const savedUser = localStorage.getItem('twitch_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem('twitch_user');
        }
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (accessToken: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/twitch/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        localStorage.setItem('twitch_user', JSON.stringify(data.user));
        return true;
      } else {
        setError(data.error || 'Authentication failed');
        return false;
      }
    } catch (error) {
      console.error('Twitch auth error:', error);
      setError('Network error during authentication');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('twitch_user');
    setError(null);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    error,
  };
}



