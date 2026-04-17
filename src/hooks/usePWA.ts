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


  useEffect(() => {
    // Check if app is already installed
    const checkInstallation = () => {
      if (typeof window !== 'undefined') {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        // @ts-expect-error: 'standalone' is a non-standard property used by iOS Safari
        const isInApp = typeof window.navigator.standalone !== 'undefined' && window.navigator.standalone === true;
        const isInstalled = isStandalone || isInApp;
        setIsInstalled(isInstalled);

      }
    };

    checkInstallation();

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);

    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);

    };

    // Listen for SW update messages - auto-refresh when new version is deployed
    const handleSWMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SW_UPDATED') {
        console.log('[PWA] New version detected, refreshing...');
        window.location.reload();
      }
    };
    navigator.serviceWorker?.addEventListener('message', handleSWMessage);

    // Proactively check for SW updates every 5 minutes
    const checkForUpdates = () => {
      navigator.serviceWorker?.getRegistration().then((reg) => {
        reg?.update().catch(() => {});
      });
    };
    const updateInterval = setInterval(checkForUpdates, 5 * 60 * 1000);

    // Also check for updates when tab becomes visible again (user returns to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkInstallation();
        checkForUpdates();
      }
    };

    // Check for installation status periodically
    const interval = setInterval(checkInstallation, 2000);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      clearInterval(updateInterval);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      navigator.serviceWorker?.removeEventListener('message', handleSWMessage);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      return false;
    }

    try {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);

        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error installing PWA:', error);
      
      return false;
    }
  };

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        return registration;
      } catch (registrationError) {
        return null;
      }
    } else {
      return null;
    }
  };

  return {
    isInstallable,
    isInstalled,
    installApp,
    registerServiceWorker,

  };
}
