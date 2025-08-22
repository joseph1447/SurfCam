"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Waves, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface TideData {
  todayData: {
    date: string;
    dayOfWeek: string;
    tides: Array<{
      time: string;
      height: number;
      type: 'high' | 'low';
    }>;
  };
  currentHeight: number;
  currentDirection: 'rising' | 'falling' | 'stable';
  nextHighTide: {
    time: string;
    height: number;
  };
  nextLowTide: {
    time: string;
    height: number;
  };
}

// Helper function to get Costa Rica date - Fixed for Vercel deployment
function getCostaRicaDate(date?: Date): Date {
  const targetDate = date || new Date();
  
  // Create a date string in Costa Rica timezone
  const costaRicaString = targetDate.toLocaleString("en-US", {
    timeZone: "America/Costa_Rica",
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  // Parse the Costa Rica date string to create a proper Date object
  const [datePart, timePart] = costaRicaString.split(', ');
  const [month, day, year] = datePart.split('/');
  const [hour, minute, second] = timePart.split(':');
  
  // Create date in local timezone but with Costa Rica values
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second));
}

// Helper function to format date for API - Fixed for Vercel deployment
function formatDateForAPI(date: Date): string {
  // Get the date in Costa Rica timezone
  const costaRicaDate = new Date(date.toLocaleString("en-US", {
    timeZone: "America/Costa_Rica"
  }));
  
  const year = costaRicaDate.getFullYear();
  const month = String(costaRicaDate.getMonth() + 1).padStart(2, '0');
  const day = String(costaRicaDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper function to check if a date is today - Fixed for Vercel deployment
function isToday(date: Date): boolean {
  const today = getCostaRicaDate();
  const selectedDate = getCostaRicaDate(date);
  
  return selectedDate.getFullYear() === today.getFullYear() &&
         selectedDate.getMonth() === today.getMonth() &&
         selectedDate.getDate() === today.getDate();
}

// Helper function to get day of week in Spanish
function getDayOfWeek(date: Date): string {
  const days = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
  return days[date.getDay()];
}

export default function TideWidget() {
  const [tideData, setTideData] = useState<TideData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(() => getCostaRicaDate());

  const fetchTideData = async (date?: Date) => {
    try {
      setLoading(true);
      const targetDate = date || selectedDate;
      const dateParam = formatDateForAPI(targetDate);
      
      const response = await fetch(`/api/tide-data?date=${dateParam}`);
      const result = await response.json();
      
      if (result.success) {
        setTideData(result.data);
        setError(null);
      } else {
        setError(result.error || 'Error al cargar datos de marea');
        setTideData(null);
      }
    } catch (err) {
      setError('Error de conexión');
      setTideData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTideData();
  }, [selectedDate]);

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    // Format time without applying timezone since API already provides correct timezone
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  const navigateToPreviousDay = () => {
    const previousDay = new Date(selectedDate);
    previousDay.setDate(previousDay.getDate() - 1);
    setSelectedDate(previousDay);
  };

  const navigateToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setSelectedDate(nextDay);
  };

  const goToToday = () => {
    const today = getCostaRicaDate();
    setSelectedDate(today);
  };

  // Helper function to calculate tide progress
  const getTideProgress = () => {
    if (!tideData?.todayData?.tides) return 0;
    
    const todayTides = tideData.todayData.tides.sort((a, b) => 
      new Date(a.time).getTime() - new Date(b.time).getTime()
    );
    
    const now = new Date();
    let lastTide = null;
    let nextTide = null;
    
    // Find the last tide that occurred and the next tide
    for (let i = 0; i < todayTides.length; i++) {
      const tideTime = new Date(todayTides[i].time);
      if (tideTime <= now) {
        lastTide = todayTides[i];
      } else {
        nextTide = todayTides[i];
        break;
      }
    }
    
    // If we're after the last tide of the day, wrap to tomorrow
    if (!nextTide && lastTide) {
      nextTide = todayTides[0];
      const nextTideTime = new Date(nextTide.time);
      nextTideTime.setDate(nextTideTime.getDate() + 1);
      nextTide = { ...nextTide, time: nextTideTime.toISOString() };
    }
    
    // If we're before the first tide of the day, use yesterday's last tide
    if (!lastTide && nextTide) {
      lastTide = todayTides[todayTides.length - 1];
      const lastTideTime = new Date(lastTide.time);
      lastTideTime.setDate(lastTideTime.getDate() - 1);
      lastTide = { ...lastTide, time: lastTideTime.toISOString() };
    }
    
    if (!lastTide || !nextTide) return 0;
    
    // Calculate progress based on time elapsed between last and next tide
    const lastTideTime = new Date(lastTide.time).getTime();
    const nextTideTime = new Date(nextTide.time).getTime();
    const currentTime = now.getTime();
    
    const totalDuration = nextTideTime - lastTideTime;
    const elapsedTime = currentTime - lastTideTime;
    
    const progress = elapsedTime / totalDuration;
    return Math.max(0, Math.min(1, progress));
  };

  // Helper function to get color based on tide height
  const getTideColor = (height: number) => {
    const normalizedHeight = Math.max(0, Math.min(1, height / 10));
    const blue = Math.round(255 * (1 - normalizedHeight));
    const red = Math.round(255 * normalizedHeight);
    return `rgb(${red}, 100, ${blue})`;
  };

  // Helper function to get direction text
  const getDirectionText = () => {
    switch (tideData?.currentDirection) {
      case 'rising':
        return 'Subiendo';
      case 'falling':
        return 'Bajando';
      default:
        return 'Estable';
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Waves className="w-5 h-5" />
            Mareas Puntarenas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Waves className="w-5 h-5" />
            Mareas Puntarenas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 text-sm">{error}</div>
          <button 
            onClick={() => fetchTideData()}
            className="mt-2 text-blue-500 hover:underline text-sm"
          >
            Reintentar
          </button>
        </CardContent>
      </Card>
    );
  }

  if (!tideData) {
    return null;
  }

  const currentCostaRicaDate = getCostaRicaDate();
  const isSelectedDateToday = isToday(selectedDate);
  
  // Format the selected date for display
  const selectedDateFormatted = selectedDate.toLocaleDateString('es-ES', { 
    timeZone: 'America/Costa_Rica',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const selectedDayOfWeek = getDayOfWeek(selectedDate);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Waves className="w-5 h-5" />
            Mareas Puntarenas
          </CardTitle>
          <div className="flex items-center gap-2">
            <button
              onClick={navigateToPreviousDay}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Día anterior"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={goToToday}
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              title="Ir a hoy"
            >
              Hoy
            </button>
            <button
              onClick={navigateToNextDay}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Día siguiente"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {selectedDayOfWeek} • {selectedDateFormatted}
        </div>
        <div className="text-xs text-gray-400">
          Costa Rica: {currentCostaRicaDate.toLocaleDateString('es-ES', { timeZone: 'America/Costa_Rica' })} {currentCostaRicaDate.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true,
            timeZone: 'America/Costa_Rica'
          })}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Height and Direction - Only show for today */}
        {isSelectedDateToday && tideData.currentHeight && (
          <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-red-50 rounded-lg">
            <div className="text-2xl font-bold" style={{ color: getTideColor(tideData.currentHeight) }}>
              {getDirectionText()}
            </div>
          </div>
        )}

        {/* Tide Progress Bar - Only show for today */}
        {isSelectedDateToday && tideData.currentHeight && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Progreso de Marea</span>
              <span>{Math.round(getTideProgress() * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${getTideProgress() * 100}%`,
                  background: `linear-gradient(to right, ${getTideColor(tideData.currentHeight)}, ${getTideColor(tideData.currentHeight + 1)})`
                }}
              />
            </div>
          </div>
        )}

        {/* Next Tides - Only show for today */}
        {isSelectedDateToday && tideData.nextHighTide && tideData.nextLowTide && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Próximas Mareas</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-xs text-gray-500">Próxima Alta</div>
                <div className="text-lg font-semibold text-red-700">
                  {formatTime(tideData.nextHighTide.time)}
                </div>
                <div className="text-xs text-gray-600">
                  {tideData.nextHighTide.height.toFixed(1)} pies
                </div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xs text-gray-500">Próxima Baja</div>
                <div className="text-lg font-semibold text-blue-700">
                  {formatTime(tideData.nextLowTide.time)}
                </div>
                <div className="text-xs text-gray-600">
                  {tideData.nextLowTide.height.toFixed(1)} pies
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Raw Excel Data */}
        {tideData.todayData && tideData.todayData.tides && (
          <div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {tideData.todayData.tides
                .sort((a, b) => {
                  const timeA = new Date(a.time);
                  const timeB = new Date(b.time);
                  
                  // Normalize times to the same day for proper comparison
                  const dayStart = new Date(tideData.todayData.date);
                  dayStart.setHours(0, 0, 0, 0);
                  
                  const normalizedTimeA = timeA.getTime() - dayStart.getTime();
                  const normalizedTimeB = timeB.getTime() - dayStart.getTime();
                  
                  return normalizedTimeA - normalizedTimeB;
                })
                .map((tide, index) => (
                <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="font-medium">{formatTime(tide.time)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 font-mono bg-white px-2 py-1 rounded">
                      {tide.height.toFixed(2)} pies
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      tide.type === 'high' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {tide.type === 'high' ? 'Alta' : 'Baja'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t pt-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Fuente: IMN Costa Rica</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
