"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Twitch, Users, Heart, Star } from 'lucide-react';

interface TwitchLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export default function TwitchLoginModal({ isOpen, onClose, onLogin }: TwitchLoginModalProps) {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await onLogin();
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
              <Twitch className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            ¡Conecta con Twitch!
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Para ver el video en vivo y participar en el chat, necesitas iniciar sesión con Twitch
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Benefits */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
              <Users className="w-5 h-5 text-purple-600" />
              <span>Participa en el chat en vivo</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
              <Heart className="w-5 h-5 text-red-500" />
              <span>Da likes y sigue al streamer</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
              <Star className="w-5 h-5 text-yellow-500" />
              <span>Acceso a contenido premium</span>
            </div>
          </div>

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 text-lg"
          >
            {isLoggingIn ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Conectando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Twitch className="w-5 h-5" />
                Iniciar sesión con Twitch
              </div>
            )}
          </Button>

          {/* Info */}
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              ¿No tienes cuenta de Twitch?{' '}
              <a 
                href="https://www.twitch.tv/signup" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-700 underline"
              >
                Crear cuenta gratis
              </a>
            </p>
          </div>

          {/* Close Button */}
          <div className="flex justify-center">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4 mr-2" />
              Cerrar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
