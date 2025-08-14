"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { Contact } from "lucide-react";
import Link from "next/link";
import { usePWA } from "@/hooks/usePWA";

export default function Login() {
  const { login } = useAuth();
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstall = async () => {
    if (isInstallable) {
      await installApp();
    } else {
      setShowInstallPrompt(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* PWA Install Banner */}
        {!isInstalled && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">📱 Instalar App</h3>
                <p className="text-sm opacity-90">Disfruta de las olas sin interrupciones</p>
              </div>
              <div className="flex gap-2">
                {isInstallable ? (
                  <Button 
                    onClick={handleInstall}
                    className="bg-white text-blue-600 hover:bg-gray-100 text-sm"
                  >
                    Instalar
                  </Button>
                ) : (
                  <Button 
                    onClick={() => setShowInstallPrompt(!showInstallPrompt)}
                    className="bg-white text-blue-600 hover:bg-gray-100 text-sm"
                  >
                    {showInstallPrompt ? 'Cerrar' : 'Cómo'}
                  </Button>
                )}
              </div>
            </div>
            {showInstallPrompt && (
              <div className="mt-3 text-xs space-y-1">
                <div>• Chrome: Menú → "Instalar app"</div>
                <div>• Safari: Compartir → "Añadir a pantalla de inicio"</div>
                <div>• Firefox: Menú → "Instalar app"</div>
              </div>
            )}
          </div>
        )}

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path>
                <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path>
                <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path>
              </svg>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Santa Teresa Surf Cam
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Transmisión en vivo de las mejores olas de Costa Rica
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
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
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
                disabled={isLoading}
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <Separator />
              
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">Acceso de prueba disponible</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    🌊 1 minuto gratis
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    💎 Premium $5/mes
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
            Powered by Seataya Luxury Villas
          </p>
        </div>
      </div>
    </div>
  );
}
