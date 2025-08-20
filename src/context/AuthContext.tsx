"use client";

import type { ReactNode, Dispatch, SetStateAction } from 'react';
import { createContext, useState, useCallback, useContext, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  _id: string;
  email: string;
  accessType: 'free' | 'premium';
  username?: string;
  instagram?: string;
  loginCount?: number;
  lastLogin?: string;
};

interface AuthContextType {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  login: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: (googleCode: string) => Promise<void>;
  logout: () => void;
  timeLeft: number;
  isTimeExpired: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Funciones helper para obtener información del navegador
function getBrowserInfo(): string {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown';
}

function getOSInfo(): string {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Unknown';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimeExpired, setIsTimeExpired] = useState(false);
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const FREE_TIER_DURATION_SECONDS = 30;

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
          setUser(data.user);
          if (data.user.accessType === 'free') {
            setTimeLeft(FREE_TIER_DURATION_SECONDS);
            setIsTimeExpired(false);
          }
          
          // Registrar actividad de login
          try {
            await fetch('/api/auth/activity', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: data.user._id,
                userAgent: navigator.userAgent,
                ipAddress: 'Unknown', // Se puede obtener del servidor
                deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
                browser: getBrowserInfo(),
                os: getOSInfo()
              })
            });
          } catch (error) {
            console.error('Error tracking login activity:', error);
          }
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

  const loginWithGoogle = useCallback(async (googleCode: string) => {
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: googleCode }),
      });

      const data = await response.json();
      
      if (data.user) {
        setUser(data.user);
        
        if (data.user.accessType === 'free') {
          setTimeLeft(FREE_TIER_DURATION_SECONDS);
          setIsTimeExpired(false);
        }
        
        // Registrar actividad de login
        try {
          await fetch('/api/auth/activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: data.user._id,
              userAgent: navigator.userAgent,
              ipAddress: 'Unknown',
              deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
              browser: getBrowserInfo(),
              os: getOSInfo()
            })
          });
        } catch (error) {
          console.error('Error tracking Google login activity:', error);
        }
        
        // Redirigir a la página principal
        router.push('/');
      } else {
        throw new Error(data.message || "Error al iniciar sesión con Google");
      }
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }, [router]);

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
        
        // Limpiar el timer específico del usuario
        localStorage.removeItem(`surfcam_timer_${user.email}`);
      }
    } catch (error) {
      console.error('Logout tracking error:', error);
    } finally {
      // Limpiar timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setTimeLeft(FREE_TIER_DURATION_SECONDS);
      setIsTimeExpired(false);
      
      // In a real app, you would also sign out from Firebase here.
      setUser(null);
      // Redirigir al login después del logout
      router.push('/');
    }
  }, [router, user?.email]);

  // Efecto para manejar el timer del usuario gratuito
  useEffect(() => {
    // Limpiar timer anterior si existe
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (user?.accessType === "free") {
      // Verificar si ya existe un timer activo en localStorage
      const timerKey = `surfcam_timer_${user.email}`;
      const storedTimer = localStorage.getItem(timerKey);
      
      if (storedTimer) {
        try {
          const { startTime, timeLeft: storedTimeLeft } = JSON.parse(storedTimer);
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          const remainingTime = Math.max(0, storedTimeLeft - elapsed);
          
          if (remainingTime > 0) {
            // Continuar con el tiempo restante
            setTimeLeft(remainingTime);
            setIsTimeExpired(false);
            
            timerRef.current = setInterval(() => {
              setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                  if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                  }
                  setIsTimeExpired(true);
                  localStorage.removeItem(timerKey);
                  return 0;
                }
                return prevTime - 1;
              });
            }, 1000);
          } else {
            // El tiempo ya expiró
            setIsTimeExpired(true);
            setTimeLeft(0);
            localStorage.removeItem(timerKey);
          }
        } catch (error) {
          // Si hay error al parsear, iniciar nuevo timer
          console.error('Error parsing stored timer:', error);
          localStorage.removeItem(timerKey);
          startNewTimer(timerKey);
        }
      } else {
        // Iniciar nuevo timer
        startNewTimer(timerKey);
      }
    } else {
      // Si no es usuario gratuito, resetear las referencias
      setTimeLeft(FREE_TIER_DURATION_SECONDS);
      setIsTimeExpired(false);
      
      // Limpiar cualquier timer almacenado
      if (user?.email) {
        localStorage.removeItem(`surfcam_timer_${user.email}`);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [user?.accessType, user?.email]);

  // Función auxiliar para iniciar nuevo timer
  const startNewTimer = (timerKey: string) => {
    setTimeLeft(FREE_TIER_DURATION_SECONDS);
    setIsTimeExpired(false);
    
    // Guardar el timer en localStorage
    localStorage.setItem(timerKey, JSON.stringify({
      startTime: Date.now(),
      timeLeft: FREE_TIER_DURATION_SECONDS
    }));

    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setIsTimeExpired(true);
          localStorage.removeItem(timerKey);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, loginWithGoogle, logout, timeLeft, isTimeExpired }}>
      {children}
    </AuthContext.Provider>
  );
}
