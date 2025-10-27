"use client";

import { useState } from 'react';
import Image from 'next/image';

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
  quality?: number;
  fill?: boolean;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export default function SafeImage({
  src,
  alt,
  width,
  height,
  className,
  style,
  priority = false,
  quality = 75,
  fill = false,
  sizes,
  onLoad,
  onError
}: SafeImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if the URL is from a trusted domain
  const isTrustedDomain = (url: string) => {
    try {
      const urlObj = new URL(url);
      const trustedDomains = [
        'seataya.com',
        'placehold.co',
        'localhost',
        '127.0.0.1',
        'santateresasurfcam.com'
      ];
      
      return trustedDomains.some(domain => 
        urlObj.hostname === domain || 
        urlObj.hostname.endsWith(`.${domain}`)
      );
    } catch {
      return false;
    }
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
    if (onError) onError();
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };

  // If it's a trusted domain, use Next.js Image component
  if (isTrustedDomain(src) && !imageError) {
    return (
      <div className={`relative ${className || ''}`} style={style}>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
        )}
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`${className || ''} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          style={style}
          priority={priority}
          quality={quality}
          fill={fill}
          sizes={sizes}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>
    );
  }

  // For untrusted domains or after error, use regular img tag
  return (
    <div className={`relative ${className || ''}`} style={style}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`${className || ''} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        style={style}
        onLoad={handleImageLoad}
        onError={handleImageError}
        crossOrigin="anonymous"
      />
    </div>
  );
}
