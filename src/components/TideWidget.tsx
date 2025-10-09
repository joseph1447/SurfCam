"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Waves, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTwitchAuth } from '@/hooks/useTwitchAuth';
import { useTheme } from '@/context/ThemeContext';

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
  } | null;
  nextLowTide: {
    time: string;
    height: number;
  } | null;
}

interface WaveReport {
  waveHeight: number;
  reporterName: string;
  createdAt: string;
  notes?: string;
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
  const { user: authUser } = useTwitchAuth();
  const { resolvedTheme } = useTheme();
  const [tideData, setTideData] = useState<TideData | null>(null);
  const [waveReport, setWaveReport] = useState<WaveReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(() => getCostaRicaDate());
  const [showWaveReportDialog, setShowWaveReportDialog] = useState(false);
  const [waveHeight, setWaveHeight] = useState<number>(3);
  const [waveNotes, setWaveNotes] = useState<string>('');

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

  const fetchWaveReport = async () => {
    try {
      const response = await fetch('/api/wave-report');
      const result = await response.json();
      
      if (result.success && result.report) {
        setWaveReport(result.report);
      }
    } catch (err) {
      console.error('Error fetching wave report:', err);
    }
  };



  const submitWaveReport = async () => {
    if (!authUser?._id) {
      console.error('Usuario no autenticado');
      return;
    }

    try {
      const response = await fetch('/api/wave-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          waveHeight,
          notes: waveNotes,
          userId: authUser._id
        })
      });
      
      if (response.ok) {
        setShowWaveReportDialog(false);
        setWaveNotes('');
        fetchWaveReport();
      } else {
        const errorData = await response.json();
        console.error('Error submitting wave report:', errorData.error);
      }
    } catch (err) {
      console.error('Error submitting wave report:', err);
    }
  };

  useEffect(() => {
    fetchTideData();
    fetchWaveReport();
  }, [selectedDate]);

  const formatTime = (timeStr: string) => {
    // Convert Excel time (HH:MM) to AM/PM format
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
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



  // Helper function to get wave size based on height
  const getWaveSize = (height: number) => {
    if (height < 1) return 'flat';
    if (height <= 3) return 'small';
    if (height <= 5) return 'medium';
    if (height <= 8) return 'large';
    return 'xlarge';
  };

  // Helper function to get wave icon
  const getWaveIcon = (height: number) => {
    const size = getWaveSize(height);
    const baseClasses = "transition-all duration-300";
    
    // Get icon size and source based on wave size
    const getIconConfig = () => {
      switch (size) {
        case 'flat': return { src: '/wave-16.png', size: 16 };
        case 'small': return { src: '/wave-16.png', size: 20 };
        case 'medium': return { src: '/wave-32.png', size: 32 };
        case 'large': return { src: '/wave-128.png', size: 48 };
        case 'xlarge': return { src: '/wave-128.png', size: 64 };
        default: return { src: '/wave-16.png', size: 20 };
      }
    };
    
    const { src, size: iconSize } = getIconConfig();
    
    return (
      <div className={`${baseClasses} relative`} style={{ width: `${iconSize}px`, height: `${iconSize}px` }}>
        <img
          src={src}
          alt={`Ola ${size}`}
          width={iconSize}
          height={iconSize}
          className="drop-shadow-sm"
          style={{
            filter: resolvedTheme === 'dark' ? 'brightness(0.8) contrast(1.2)' : 'none'
          }}
        />
      </div>
    );
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
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                title="Día anterior"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
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
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                title="Día siguiente"
              >
                <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
        </div>
                 <div className="text-sm text-gray-500 dark:text-gray-400">
           {selectedDayOfWeek} • {selectedDateFormatted}
         </div>

      </CardHeader>
      <CardContent className="space-y-4">


        {/* Wave Report Section */}
        {isSelectedDateToday && (
          <div className="space-y-3">
                         <div className="flex items-center justify-between">
               <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Reporte de Olas</h4>
                              {authUser && (authUser.role === 'moderator' || authUser.role === 'admin') && (
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => setShowWaveReportDialog(true)}
                   className="text-xs"
                 >
                   Reportar
                 </Button>
               )}
             </div>
            
                         {waveReport ? (
               <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                 <div className="flex items-center gap-3">
                   {getWaveIcon(waveReport.waveHeight)}
                   <div>
                     <div className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                       {waveReport.waveHeight} pies
                     </div>
                     <div className="text-xs text-gray-500 dark:text-gray-400">
                       Reportado por {waveReport.reporterName}
                     </div>
                     <div className="text-xs text-gray-400 dark:text-gray-500">
                       {new Date(waveReport.createdAt).toLocaleTimeString('es-CR', {
                         hour: '2-digit',
                         minute: '2-digit',
                         timeZone: 'America/Costa_Rica'
                       })}
                     </div>
                   </div>
                 </div>
               </div>
             ) : (
               <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                 <div className="text-sm text-gray-500 dark:text-gray-400">No hay reporte de olas</div>
               </div>
             )}
          </div>
        )}



                 {/* Next Tides - Only show for today */}
         {isSelectedDateToday && (tideData.nextHighTide || tideData.nextLowTide) && (
           <div className="space-y-3">
             <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Próximas Mareas</h4>
             <div className="grid grid-cols-2 gap-3">
               {tideData.nextHighTide ? (
                 <div className="text-center p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                   <div className="text-xs text-gray-500 dark:text-gray-400">Próxima Alta</div>
                   <div className="text-lg font-semibold text-red-700 dark:text-red-300">
                     {formatTime(tideData.nextHighTide.time)}
                   </div>
                   <div className="text-xs text-red-600 dark:text-red-400">
                     {tideData.nextHighTide.height} pies
                   </div>
                 </div>
               ) : (
                 <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                   <div className="text-xs text-gray-500 dark:text-gray-400">Próxima Alta</div>
                   <div className="text-sm text-gray-500 dark:text-gray-400">No hay más hoy</div>
                 </div>
               )}
               {tideData.nextLowTide ? (
                 <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                   <div className="text-xs text-gray-500 dark:text-gray-400">Próxima Baja</div>
                   <div className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                     {formatTime(tideData.nextLowTide.time)}
                   </div>
                                      <div className="text-xs text-blue-600 dark:text-blue-400">
                      {tideData.nextLowTide.height} pies
                    </div>
                 </div>
               ) : (
                 <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                   <div className="text-xs text-gray-500 dark:text-gray-400">Próxima Baja</div>
                   <div className="text-sm text-gray-500 dark:text-gray-400">No hay más hoy</div>
                 </div>
               )}
             </div>
           </div>
         )}

        {/* Raw Excel Data */}
        {tideData.todayData && tideData.todayData.tides && (
          <div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {tideData.todayData.tides
                .sort((a, b) => {
                  // Sort by AM/PM first, then chronologically
                  const timeA = new Date();
                  const timeB = new Date();
                  
                  const [hoursA, minutesA] = a.time.split(':').map(Number);
                  const [hoursB, minutesB] = b.time.split(':').map(Number);
                  
                  timeA.setHours(hoursA, minutesA, 0, 0);
                  timeB.setHours(hoursB, minutesB, 0, 0);
                  
                  // AM comes before PM
                  const isAM_A = hoursA < 12;
                  const isAM_B = hoursB < 12;
                  
                  if (isAM_A && !isAM_B) return -1; // A is AM, B is PM
                  if (!isAM_A && isAM_B) return 1;  // A is PM, B is AM
                  
                  // If both are AM or both are PM, sort chronologically
                  return timeA.getTime() - timeB.getTime();
                })
                                 .map((tide, index) => (
                                  <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                      <span className="font-medium dark:text-gray-200">{formatTime(tide.time)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        tide.type === 'high' 
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' 
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      }`}>
                        {tide.type === 'high' ? 'Alta' : 'Baja'}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {tide.height} pies
                      </span>
                    </div>
                  </div>
               ))}
            </div>
          </div>
        )}

                 {/* Footer */}
         <div className="border-t pt-3">
           <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
             <span>Fuente: IMN Costa Rica</span>
           </div>
         </div>
      </CardContent>

             {/* Wave Report Dialog */}
       {showWaveReportDialog && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-[90vw]">
             <h3 className="text-lg font-semibold mb-4 dark:text-gray-100">Reportar Tamaño de Olas</h3>
            
            <div className="space-y-4">
                             <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Altura de las olas (pies)
                 </label>
                 <input
                   type="number"
                   min="0"
                   max="20"
                   step="0.5"
                   value={waveHeight}
                   onChange={(e) => setWaveHeight(parseFloat(e.target.value) || 0)}
                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                 />
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Notas (opcional)
                 </label>
                 <textarea
                   value={waveNotes}
                   onChange={(e) => setWaveNotes(e.target.value)}
                   placeholder="Condiciones especiales, observaciones..."
                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                   rows={3}
                 />
               </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowWaveReportDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={submitWaveReport}
                  disabled={waveHeight <= 0}
                >
                  Reportar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
