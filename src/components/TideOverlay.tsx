"use client";

import { useState, useEffect } from 'react';

interface TideData {
  time: string;
  height: number;
  type: 'high' | 'low';
}

interface TideOverlayProps {
  className?: string;
}

export default function TideOverlay({ className = '' }: TideOverlayProps) {
  const [tideData, setTideData] = useState<TideData[]>([]);
  const [currentTide, setCurrentTide] = useState<{ height: number; type: 'high' | 'low'; nextChange: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTideData = async () => {
      try {
        // Use the same API as TideWidget
        const response = await fetch('/api/tide-data');
        if (!response.ok) throw new Error('Failed to fetch tide data');
        
        const data = await response.json();
        
        if (data.success) {
          // Use the same data structure as TideWidget
          const tides = data.data.todayData.tides || [];
          setTideData(tides);
          
          // Calculate current tide info from the same data
          const currentHeight = data.data.currentHeight;
          const currentDirection = data.data.currentDirection;
          
          // Determine current tide type based on direction and height
          let currentType: 'high' | 'low' = 'low';
          if (currentDirection === 'rising' && currentHeight > 2.0) {
            currentType = 'high';
          } else if (currentDirection === 'falling' && currentHeight > 2.0) {
            currentType = 'high';
          } else if (currentHeight > 2.5) {
            currentType = 'high';
          }
          
          // Get next tide change
          const nextHighTide = data.data.nextHighTide;
          const nextLowTide = data.data.nextLowTide;
          const nextChange = nextHighTide ? nextHighTide.time : (nextLowTide ? nextLowTide.time : 'Sin registro');
          
          setCurrentTide({
            height: currentHeight,
            type: currentType,
            nextChange: nextChange
          });
          
          setError(null);
        } else {
          throw new Error(data.error || 'Failed to fetch tide data');
        }
      } catch (err) {
        console.error('Error fetching tide data:', err);
        setError('Error loading tide data');
      } finally {
        setLoading(false);
      }
    };

    fetchTideData();
    
    // Update every 30 minutes
    const interval = setInterval(fetchTideData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);


  const getTidePercentage = (height: number) => {
    // Simple percentage based on height - let users interpret the data
    // Most Costa Rica tides are between 0.5m and 3.5m
    const percentage = (height / 3.5) * 100;
    return Math.max(15, Math.min(90, percentage));
  };

  const formatTime = (timeString: string) => {
    // Handle cases where timeString might be invalid or empty
    if (!timeString || timeString === 'Invalid Date' || timeString === 'null' || timeString === 'undefined') {
      return 'Sin registro';
    }
    
    // If it's already in HH:MM format, return as is
    if (timeString.match(/^\d{2}:\d{2}$/)) {
      return timeString;
    }
    
    try {
      const time = new Date(timeString);
      if (isNaN(time.getTime())) {
        return 'Sin registro';
      }
      return time.toLocaleTimeString('es-CR', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'America/Costa_Rica'
      });
    } catch {
      return 'Sin registro';
    }
  };

  const getTideIcon = (type: 'high' | 'low') => {
    return type === 'high' ? '🌊' : '🌊';
  };

  const getTideColor = (type: 'high' | 'low') => {
    return type === 'high' ? 'text-blue-400' : 'text-blue-600';
  };

  if (loading) {
    return (
      <div className={`absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm text-white p-2 rounded-lg text-xs z-[9999] ${className}`}>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px]">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error || !currentTide) {
    return (
      <div className={`absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm text-white p-2 rounded-lg text-xs z-[9999] ${className}`}>
        <div className="flex items-center gap-2">
          <span className="text-red-400 text-sm">⚠️</span>
          <span className="text-[10px]">Error mareas</span>
        </div>
      </div>
    );
  }

  const tidePercentage = getTidePercentage(currentTide.height);

  return (
    <div className={`absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm text-white p-2 rounded-lg text-xs z-[9999] ${className}`}>
      <div className="flex items-center gap-2">
        {/* Tide Icon */}
        <div className="text-sm">
          {getTideIcon(currentTide.type)}
        </div>
        
        {/* Tide Meter */}
        <div className="flex flex-col items-center gap-0.5">
          <div className="text-[10px] font-medium text-gray-300">Marea</div>
          
          {/* Visual Meter */}
          <div className="relative w-8 h-10 bg-gray-700 rounded-full overflow-hidden">
            {/* Water Level */}
            <div 
              className={`absolute bottom-0 w-full transition-all duration-1000 ${
                currentTide.type === 'high' ? 'bg-blue-400' : 'bg-blue-600'
              }`}
              style={{ height: `${tidePercentage}%` }}
            />
            
            {/* Tide Level Indicator */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-0.5 h-0.5 bg-white rounded-full opacity-60" />
            </div>
          </div>
          
          {/* Height Display */}
          <div className={`text-[10px] font-bold ${getTideColor(currentTide.type)}`}>
            {currentTide.height.toFixed(1)}m
          </div>
        </div>
        
        {/* Tide Info */}
        <div className="flex flex-col gap-0.5 min-w-[60px]">
          <div className="text-[10px] font-medium text-gray-300">
            {currentTide.type === 'high' ? 'Pleamar' : 'Bajamar'}
          </div>
          <div className="text-[9px] text-gray-400">
            Próx: {formatTime(currentTide.nextChange)}
          </div>
        </div>
      </div>
    </div>
  );
}
