"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { Contact, Crown, User } from "lucide-react";
import Link from "next/link";
import { usePWA } from "@/hooks/usePWA";
import { validateEmailClient } from "@/lib/emailValidation";
import { useGoogleLogin } from "@react-oauth/google";
import React from "react";
import { useRouter } from "next/navigation";

function GoogleIcon() {
  return (
    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
      <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 62.3l-66.5 64.6C305.5 99.6 280.5 80 248 80c-82.3 0-148.8 66.5-148.8 148.8s66.5 148.8 148.8 148.8c94.3 0 135.3-65.8 140.2-99.9H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path>
    </svg>
  );
}

function GoogleLoginButton({ setEmail, setUser }: { setEmail: (email: string) => void, setUser: (user: any) => void }) {
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const router = useRouter();
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);
      try {
        const backendAuthResponse = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: tokenResponse.code }),
        });
        if (!backendAuthResponse.ok) {
          const errorData = await backendAuthResponse.json();
          throw new Error(errorData.message || 'Internal Server Error');
        }
        const { user } = await backendAuthResponse.json();
        // Fill email state with Google email before validation
        if (user && user.email) setEmail(user.email);
        // Set user directly for consistency
        if (user) setUser(user);
        router.push('/');
      } catch (error) {
        console.error("Error during Google sign-in:", error);
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: (errorResponse) => {
      console.error("Google OAuth Error:", errorResponse);
      setIsGoogleLoading(false);
    },
    flow: 'auth-code',
    scope: 'openid email profile',
  });
  return (
    <button
      className="w-full bg-black hover:bg-red-600 text-white font-semibold py-3 mb-4 flex items-center justify-center gap-2 rounded-lg transition-colors"
      onClick={() => googleLogin()}
      type="button"
      disabled={isGoogleLoading}
    >
      {isGoogleLoading ? 'Signing In...' : <><GoogleIcon /> Continuar con Google</>}
    </button>
  );
}

export default function Login() {
  const { login, setUser } = useAuth();
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [email, setEmail] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPremiumMode, setIsPremiumMode] = useState(false);
  const [error, setError] = useState("");
  const [isInstalling, setIsInstalling] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [emailValidation, setEmailValidation] = useState<{ isValid: boolean; error?: string }>({ isValid: true });
  const router = useRouter();

  const handleGuestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(""); // Clear any previous errors
    
    try {
      // Validate email first
      const emailValidation = validateEmailClient(email);
      if (!emailValidation.isValid) {
        setError(emailValidation.error || "Email inválido");
        return;
      }
      // Request magic link
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.success) {
        setMagicLinkSent(true);
      } else {
        setError(data.message || 'No se pudo enviar el enlace.');
      }
    } catch (error) {
      console.error("Guest login (magic link) failed:", error);
      setError("Error al enviar el enlace mágico. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePremiumLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(""); // Clear any previous errors
    
    try {
      // Validate email first
      const emailValidation = validateEmailClient(email);
      if (!emailValidation.isValid) {
        setError(emailValidation.error || "Email inválido");
        return;
      }

      // Premium login with email and password validation
      await login(email, password);
      router.push('/');
    } catch (error) {
      console.error("Premium login failed:", error);
      // Check if it's a password error or general error
      if (error instanceof Error && error.message.includes("contraseña")) {
        setError("La contraseña es incorrecta. Inténtalo de nuevo.");
      } else {
        setError("Error al iniciar sesión. Inténtalo de nuevo.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    // Clear validation if email is empty
    if (!newEmail.trim()) {
      setEmailValidation({ isValid: true });
      return;
    }
    
    // Validate email in real-time
    const validation = validateEmailClient(newEmail);
    setEmailValidation(validation);
  };

  const handleInstall = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      try {
        const success = await installApp();
        if (success) {
          console.log('App installed successfully');
        } else {
          console.log('Installation was dismissed');
        }
      } catch (error) {
        console.error('Installation failed:', error);
      } finally {
        setIsInstalling(false);
      }
    } else {
      console.log('App is not installable');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md space-y-6">
                                   {/* PWA Install Banner */}
          {isInstallable && !isInstalled && (
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">📱 Instalar App</h3>
                  <p className="text-sm opacity-90">Disfruta de las olas sin interrupciones</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleInstall}
                    disabled={isInstalling}
                    className="bg-white text-blue-600 hover:bg-gray-100 text-sm"
                  >
                    {isInstalling ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                        Instalando...
                      </div>
                    ) : (
                      'Instalar'
                    )}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowInstructions(true)}
                    className="border-white text-white hover:bg-white hover:text-blue-600 text-sm"
                  >
                    ¿Cómo?
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Instructions Modal */}
          {showInstructions && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-bold mb-4">📱 Cómo instalar la app</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
                    <p><strong>Chrome/Edge:</strong> Toca el ícono de instalación en la barra de direcciones</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
                    <p><strong>Safari:</strong> Toca el botón compartir y selecciona "Añadir a pantalla de inicio"</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
                    <p><strong>Android:</strong> Aparecerá un banner automático, tócalo para instalar</p>
                  </div>
                </div>
                <Button 
                  onClick={() => setShowInstructions(false)}
                  className="w-full mt-4"
                >
                  Entendido
                </Button>
              </div>
            </div>
          )}

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                     <CardHeader className="text-center space-y-2">
             <a 
               href="https://seataya.com/" 
               target="_blank" 
               rel="noopener noreferrer"
               className="mx-auto block w-64 h-40 hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-xl transition-shadow duration-200"
             >
                             <img 
                src="/seataya.png" 
                alt="Seataya Luxury Villas" 
                className="w-full h-full object-contain"
                style={{ height: '120%' }}
              />
             </a>
             <div>
               <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                 Santa Teresa Surf Cam
               </CardTitle>
               <CardDescription className="text-gray-600 mt-1">
                 Transmisión en vivo de las mejores olas de Costa Rica
               </CardDescription>
             </div>
           </CardHeader>

          <CardContent>
            {/* Google Login Button */}
            <GoogleLoginButton setEmail={setEmail} setUser={setUser} />
            <div className="flex items-center my-4">
              <Separator className="flex-1" />
              <span className="mx-2 text-gray-400 font-bold">O</span>
              <Separator className="flex-1" />
            </div>
                         {/* Mode Toggle */}
             <div className="flex gap-2 mb-6">
               <Button
                 variant={!isPremiumMode ? "default" : "outline"}
                 onClick={() => setIsPremiumMode(false)}
                 className="flex-1"
               >
                 <User className="h-4 w-4 mr-2" />
                 Invitado
               </Button>
               <Button
                 variant={isPremiumMode ? "default" : "outline"}
                 onClick={() => setIsPremiumMode(true)}
                 className="flex-1"
               >
                 <Crown className="h-4 w-4 mr-2" />
                 Premium
               </Button>
             </div>

             {/* Error Message */}
             {error && (
               <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                 <p className="text-red-700 text-sm font-medium">{error}</p>
               </div>
             )}

            {/* Guest Mode Form */}
            {!isPremiumMode && !magicLinkSent && (
              <form onSubmit={handleGuestLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={handleEmailChange}
                    required
                    className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                      email && !emailValidation.isValid ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  {email && !emailValidation.isValid && (
                    <p className="text-red-500 text-sm mt-1">{emailValidation.error}</p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
                  disabled={isLoading}
                >
                  {isLoading ? "Enviando enlace..." : "Entrar como Invitado"}
                </Button>
              </form>
            )}
            {!isPremiumMode && magicLinkSent && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                <p className="text-green-700 font-medium mb-2">¡Código enviado!</p>
                <p className="text-green-700 text-sm mb-4">Revisa tu correo electrónico y copia el código temporal para acceder.<br />
                <span className="text-yellow-700 font-semibold">Si no lo ves, revisa tu carpeta de spam o correo no deseado.</span></p>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setCodeError("");
                    try {
                      const response = await fetch('/api/auth/validate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, code }),
                      });
                      const data = await response.json();
                      if (data.success) {
                        setUser(data.user);
                        router.push('/');
                      } else {
                        setCodeError(data.message || 'Código inválido.');
                      }
                    } catch (err) {
                      setCodeError('Error al validar el código.');
                    }
                  }}
                  className="space-y-3"
                >
                  <input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="Ingresa el código"
                    className="w-full border rounded px-3 py-2 text-center text-lg"
                    maxLength={6}
                    required
                  />
                  {codeError && <p className="text-red-600 text-sm">{codeError}</p>}
                  <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3">
                    Validar código
                  </Button>
                </form>
              </div>
            )}

            {/* Premium Mode Form */}
            {isPremiumMode && (
              <form onSubmit={handlePremiumLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="premium-email">Email</Label>
                                     <Input
                     id="premium-email"
                     type="email"
                     placeholder="tu@email.com"
                     value={email}
                     onChange={handleEmailChange}
                     required
                     className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                       email && !emailValidation.isValid ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                     }`}
                   />
                   {email && !emailValidation.isValid && (
                     <p className="text-red-500 text-sm mt-1">{emailValidation.error}</p>
                   )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="premium-password">Contraseña Premium</Label>
                  <Input
                    id="premium-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3"
                  disabled={isLoading}
                >
                  {isLoading ? "Iniciando Premium..." : "Inicio Premium"}
                </Button>
              </form>
            )}

            <div className="mt-6 space-y-4">
              <Separator />
              
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">Acceso disponible</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    🌊 1 minuto gratis
                  </Badge>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    💎 Premium sin límites
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3">
            <Link href="/contacto" className="w-full">
              <Button variant="outline" className="w-full" asChild>
                <div className="flex items-center gap-2">
                  <Contact className="w-4 h-4" />
                  Ver Planes Premium
                </div>
              </Button>
            </Link>
            
            <p className="text-xs text-gray-500 text-center">
              Al iniciar sesión, aceptas nuestros términos de servicio
            </p>
          </CardFooter>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            📍 Santa Teresa, Costa Rica
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Powered by{' '}
            <a
              href="https://doc-manager-front.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline"
            >
              JS Solutions
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
