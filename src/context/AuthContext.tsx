"use client";

import type { ReactNode, Dispatch, SetStateAction } from 'react';
import { createContext, useState, useCallback } from 'react';

type User = {
  email: string;
  accessType: 'free' | 'premium';
};

interface AuthContextType {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  login: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(
    async (email: string, pass: string) => {
      const freePassword = process.env.NEXT_PUBLIC_CAM_PASSWORD || 'santateresa2025';
      const premiumPassword = process.env.NEXT_PUBLIC_PREMIUM_PASSWORD || 'santa teresaPremium';

      if (pass === freePassword) {
        setUser({ email, accessType: 'free' });
      } else if (pass === premiumPassword) {
        setUser({ email, accessType: 'premium' });
      } else {
        throw new Error('La contraseña es incorrecta. Inténtalo de nuevo.');
      }
    },
    []
  );

  const loginWithGoogle = useCallback(() => {
    // In a real app, this would involve a Firebase popup or redirect.
    // For this demo, we'll simulate a successful premium login.
    // This is currently disabled in the UI.
    setUser({ email: 'usuario@google.com', accessType: 'premium' });
  }, []);

  const logout = useCallback(() => {
    // In a real app, you would also sign out from Firebase here.
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
