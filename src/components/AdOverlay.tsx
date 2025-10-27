"use client";

import { useState, useEffect } from "react";
import SafeImage from "./SafeImage";

interface AdOverlayData {
  _id: string;
  logoUrl: string;
  text: string;
  redirectUrl: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

interface AdOverlayProps {
  overlays: AdOverlayData[];
}

export default function AdOverlay({ overlays }: AdOverlayProps) {
  const [currentOverlayIndex, setCurrentOverlayIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenClicked, setHasBeenClicked] = useState(false);

  // Filter active overlays
  const activeOverlays = overlays.filter(overlay => overlay);

  useEffect(() => {
    if (activeOverlays.length === 0) return;

    // Show overlay immediately when component mounts
    setIsVisible(true);

    // Rotate overlays every 10 seconds
    const interval = setInterval(() => {
      setCurrentOverlayIndex((prev) => (prev + 1) % activeOverlays.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [activeOverlays.length]);

  // Remove automatic hiding - overlays should only disappear when clicked
  // useEffect(() => {
  //   // Overlays now stay visible until clicked
  // }, []);

  if (activeOverlays.length === 0) return null;

  const currentOverlay = activeOverlays[currentOverlayIndex];
  if (!currentOverlay) return null;

  const handleClick = async () => {
    setHasBeenClicked(true);
    setIsVisible(false); // Hide immediately after click
    
    try {
      // Track click
      await fetch('/api/admin/ad-overlays/click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ overlayId: currentOverlay._id }),
      });

      // Open URL in new tab
      window.open(currentOverlay.redirectUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error tracking click:', error);
      // Still open the URL even if tracking fails
      window.open(currentOverlay.redirectUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const getPositionClasses = (position: string) => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      default: // bottom-right
        return 'bottom-4 right-4';
    }
  };

  return (
    <div 
      className={`absolute ${getPositionClasses(currentOverlay.position)} z-[9999] transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <button
        onClick={handleClick}
        className="bg-black/70 hover:bg-black/80 text-white px-3 py-3 rounded-lg text-sm flex flex-col items-center gap-1.5 transition-all duration-200 hover:scale-105 min-w-[140px]"
      >
        <div className="relative w-20 h-20 flex-shrink-0">
          <SafeImage
            src={currentOverlay.logoUrl}
            alt={currentOverlay.text}
            width={80}
            height={80}
            className="object-contain rounded w-full h-full"
            onError={() => {
              // Fallback handled by SafeImage component
            }}
          />
        </div>
        <span className="font-medium text-xs text-center">{currentOverlay.text}</span>
      </button>
    </div>
  );
}
