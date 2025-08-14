"use client";

import type { ReactNode, Dispatch, SetStateAction } from 'react';
import { createContext, useState, useCallback, useContext } from 'react';
import { useRouter } from 'next/navigation';

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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const login = useCallback(
    async (email: string, pass: string) => {
      try {
        // Determinar el tipo de acceso basado en la contraseña
        let accessType = "free";
        const premiumPassword = process.env.NEXT_PUBLIC_PREMIUM_PASSWORD;
        
        // Si se proporciona una contraseña, verificar si es premium
        if (pass && pass === premiumPassword) {
          accessType = "premium";
        } else if (pass && pass !== premiumPassword) {
          // Solo validar contraseña si se proporciona una (modo premium)
          throw new Error("La contraseña premium es incorrecta. Inténtalo de nuevo.");
        }
        // Si no se proporciona contraseña, es acceso gratuito (solo email)
        // Cualquier email puede ser premium si tiene la contraseña correcta

        // Registrar el usuario en la base de datos
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password: accessType === "premium" ? pass : undefined,
            accessType
          }),
        });

        const data = await response.json();

        if (data.success) {
          setUser({
            email,
            accessType: accessType as "free" | "premium",
          });
        } else {
          throw new Error(data.error || "Error al iniciar sesión");
        }
      } catch (error) {
        console.error('Login error:', error);
        throw error;
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

  const logout = useCallback(async () => {
    try {
      // Registrar el logout en la base de datos si hay un usuario activo
      if (user?.email) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email
          }),
        });
      }
    } catch (error) {
      console.error('Logout tracking error:', error);
    } finally {
      // In a real app, you would also sign out from Firebase here.
      setUser(null);
      // Redirigir al login después del logout
      router.push('/');
    }
  }, [router, user?.email]);

  return (
    <AuthContext.Provider value={{ user, setUser, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
