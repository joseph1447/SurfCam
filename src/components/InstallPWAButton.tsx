"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Check, Info } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export default function InstallPWAButton() {
  const { isInstallable, isInstalled, installApp, debugInfo } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await installApp();
      if (success) {
        console.log('App installed successfully');
      }
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  // Show debug info in development
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <>
      {/* Debug info for development */}
      {isDevelopment && (
        <div className="fixed top-4 right-4 z-50 bg-black/80 text-white p-2 rounded text-xs max-w-xs">
          <div className="flex items-center gap-2 mb-1">
            <Info className="h-3 w-3" />
            <span className="font-bold">PWA Debug:</span>
            <button 
              onClick={() => setShowDebug(!showDebug)}
              className="text-blue-300 hover:text-blue-100"
            >
              {showDebug ? 'Hide' : 'Show'}
            </button>
          </div>
          {showDebug && (
            <div className="text-xs">
              <div>Installable: {isInstallable ? 'Yes' : 'No'}</div>
              <div>Installed: {isInstalled ? 'Yes' : 'No'}</div>
              <div>Debug: {debugInfo}</div>
            </div>
          )}
        </div>
      )}

      {/* Install button - show if installable and not installed */}
      {isInstallable && !isInstalled && (
        <Button
          onClick={handleInstall}
          disabled={isInstalling}
          className="fixed bottom-4 right-4 z-50 bg-primary hover:bg-primary/90 text-white shadow-lg rounded-full p-3 animate-pulse"
          title="Instalar Santa Teresa Surf Cam"
        >
          {isInstalling ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
          ) : (
            <Download className="h-5 w-5" />
          )}
        </Button>
      )}

      {/* Alternative install prompt for when beforeinstallprompt doesn't fire */}
      {!isInstallable && !isInstalled && (
        <div className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-lg shadow-lg max-w-xs">
          <div className="text-sm font-medium mb-2">📱 Instalar App</div>
          <div className="text-xs mb-2">
            Para instalar Santa Teresa Surf Cam:
          </div>
          <div className="text-xs space-y-1">
            <div>• Chrome: Menú → "Instalar app"</div>
            <div>• Safari: Compartir → "Añadir a pantalla de inicio"</div>
            <div>• Firefox: Menú → "Instalar app"</div>
          </div>
        </div>
      )}
    </>
  );
}
