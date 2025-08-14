"use client";

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    // Check if app is already installed
    const checkInstallation = () => {
      if (typeof window !== 'undefined') {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isInApp = window.navigator.standalone === true;
        const isInstalled = isStandalone || isInApp;
        
        console.log('PWA Installation Check:', {
          isStandalone,
          isInApp,
          isInstalled,
          userAgent: navigator.userAgent
        });
        
        setIsInstalled(isInstalled);
        setDebugInfo(`Standalone: ${isStandalone}, InApp: ${isInApp}, Installed: ${isInstalled}`);
      }
    };

    checkInstallation();

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired');
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      setDebugInfo('Install prompt available');
    };

    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      setDebugInfo('App installed');
    };

    // Check for installation status periodically
    const interval = setInterval(checkInstallation, 2000);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Also check on page visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkInstallation();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      console.log('No install prompt available');
      setDebugInfo('No install prompt available');
      return false;
    }

    try {
      console.log('Showing install prompt...');
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        setDebugInfo('Install accepted');
        return true;
      } else {
        console.log('User dismissed the install prompt');
        setDebugInfo('Install dismissed');
        return false;
      }
    } catch (error) {
      console.error('Error installing PWA:', error);
      setDebugInfo(`Install error: ${error}`);
      return false;
    }
  };

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('SW registered: ', registration);
        setDebugInfo('Service Worker registered');
        return registration;
      } catch (registrationError) {
        console.log('SW registration failed: ', registrationError);
        setDebugInfo(`SW registration failed: ${registrationError}`);
        return null;
      }
    } else {
      setDebugInfo('Service Worker not supported');
      return null;
    }
  };

  return {
    isInstallable,
    isInstalled,
    installApp,
    registerServiceWorker,
    debugInfo,
  };
}
