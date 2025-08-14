"use client";

import { useEffect } from 'react';
import { usePWA } from '@/hooks/usePWA';
import InstallPWAButton from './InstallPWAButton';

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  const { registerServiceWorker } = usePWA();

  useEffect(() => {
    // Register service worker on mount
    registerServiceWorker();
  }, [registerServiceWorker]);

  return (
    <>
      {children}
      <InstallPWAButton />
    </>
  );
}
