"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Check } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export default function InstallPWAButton() {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);

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

  // Don't show if app is already installed or not installable
  if (isInstalled || !isInstallable) {
    return null;
  }

  return (
    <Button
      onClick={handleInstall}
      disabled={isInstalling}
      className="fixed bottom-4 right-4 z-50 bg-primary hover:bg-primary/90 text-white shadow-lg rounded-full p-3"
      title="Instalar Santa Teresa Surf Cam"
    >
      {isInstalling ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
      ) : (
        <Download className="h-5 w-5" />
      )}
    </Button>
  );
}
