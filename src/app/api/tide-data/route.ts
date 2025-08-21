import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { promises as fs } from 'fs';
import path from 'path';

// Coordenadas de Puntarenas
const PUNTARENAS_COORDS = {
  lat: 9.9769,
  lng: -84.8384
};

interface RawTideEntry {
  Fecha: number; // Excel date number
  Hora: string; // Time in HH:MM format
  'Altura (pies)': number; // Height in feet
}

interface ProcessedTideEntry {
  time: Date;
  height: number;
  type: 'high' | 'low';
}

interface DailyTideData {
  date: Date;
  dayOfWeek: string;
  tides: ProcessedTideEntry[];
  highestTide: ProcessedTideEntry;
  lowestTide: ProcessedTideEntry;
  location: {
    lat: number;
    lng: number;
  };
}

// Cache for processed data
let cachedTideData: DailyTideData[] | null = null;
let lastCacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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

export async function GET(req: NextRequest) {
  try {
    // Get requested date from query parameter or use today
    const { searchParams } = new URL(req.url);
    const requestedDate = searchParams.get('date');
    
    let targetDate: Date;
    if (requestedDate) {
      // Parse the date string and create a date in Costa Rica timezone
      const [year, month, day] = requestedDate.split('-').map(Number);
      // Create date in Costa Rica timezone
      const costaRicaDate = new Date(year, month - 1, day);
      targetDate = getCostaRicaDate(costaRicaDate);
    } else {
      // Get today's date in Costa Rica timezone
      targetDate = getCostaRicaDate();
    }
    
    // Check cache first
    const currentTime = Date.now();
    if (cachedTideData && (currentTime - lastCacheTime) < CACHE_DURATION) {
      return processTideDataForToday(cachedTideData, targetDate);
    }
    
    // Read Excel file from public folder
    const excelPath = path.join(process.cwd(), 'public', 'Mareas Puntarenas 2025.xlsx');
    
    try {
      const buffer = await fs.readFile(excelPath);
      
      // Parse Excel file
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const rawData = XLSX.utils.sheet_to_json(worksheet) as RawTideEntry[];
      
      if (rawData.length === 0) {
        return NextResponse.json(
          { 
            error: 'No data found in Excel file',
            details: 'The Excel file appears to be empty or has no valid data.'
          },
          { status: 404 }
        );
      }
      
      // Process and classify tide data
      const processedData = processTideData(rawData);
      
      if (processedData.length === 0) {
        return NextResponse.json(
          { 
            error: 'No valid data could be processed. Please check the date format in your Excel file.',
            expectedFormat: 'Date format should be Excel date number'
          },
          { status: 400 }
        );
      }
      
      // Cache the processed data
      cachedTideData = processedData;
      lastCacheTime = currentTime;
      
      // Find today's data and return response
      return processTideDataForToday(processedData, targetDate);
      
    } catch (fileError) {
      return NextResponse.json(
        { 
          error: 'Excel file not found or cannot be read',
          details: 'Please ensure the file "Mareas Puntarenas 2025.xlsx" exists in the public folder.',
          path: excelPath
        },
        { status: 404 }
      );
    }
    
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to fetch tide data',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

function processTideDataForToday(processedData: DailyTideData[], targetDate: Date) {
  // Find target date's data
  const targetDateNormalized = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const todayData = processedData.find(day => {
    const dayDate = new Date(day.date);
    const dayDateNormalized = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate());
    return dayDateNormalized.getTime() === targetDateNormalized.getTime();
  });
  
  if (!todayData) {
    // If no data for today, find the closest available date
    if (processedData.length > 0) {
      
      // Find the closest date to target date
      let closestData = processedData[0];
      let minDiff = Math.abs(closestData.date.getTime() - targetDateNormalized.getTime());
      
      for (const dayData of processedData) {
        const diff = Math.abs(dayData.date.getTime() - targetDateNormalized.getTime());
        if (diff < minDiff) {
          minDiff = diff;
          closestData = dayData;
        }
      }
      
      // Use current time for calculations, not targetDate (which is midnight)
      const now = new Date();
      const currentTideInfo = calculateCurrentHeight(closestData.tides, now);
      const { nextHighTide, nextLowTide } = findNextTides(closestData.tides, now);
      
      return NextResponse.json({ 
        success: true, 
        data: {
          location: PUNTARENAS_COORDS,
          dailyData: processedData,
          currentHeight: currentTideInfo.height,
          currentDirection: currentTideInfo.direction,
          nextHighTide,
          nextLowTide,
          todayData: closestData
        },
        source: 'excel_fallback',
        note: `Using closest available data (${Math.round(minDiff / (1000 * 60 * 60 * 24))} days from today)`
      });
    }
    
    return NextResponse.json(
      { 
        error: 'No tide data available for today.',
        details: 'The Excel data does not contain information for today.'
      },
      { status: 404 }
    );
  }
  
     // Calculate current height and next tides
  // Use current time for calculations, not targetDate (which is midnight)
  const now = new Date();
  const currentTideInfo = calculateCurrentHeight(todayData.tides, now);
  const { nextHighTide, nextLowTide } = findNextTides(todayData.tides, now);
  
   return NextResponse.json({ 
     success: true, 
     data: {
       location: PUNTARENAS_COORDS,
       dailyData: processedData,
       currentHeight: currentTideInfo.height,
       currentDirection: currentTideInfo.direction,
       nextHighTide,
       nextLowTide,
       todayData
     },
     source: 'excel'
   });
}

function processTideData(rawData: RawTideEntry[]): DailyTideData[] {
  // Group data by date
  const groupedByDate = new Map<number, RawTideEntry[]>();
  
  rawData.forEach(entry => {
    const dateKey = entry.Fecha;
    if (!groupedByDate.has(dateKey)) {
      groupedByDate.set(dateKey, []);
    }
    groupedByDate.get(dateKey)!.push(entry);
  });
  
  const processedData: DailyTideData[] = [];
  
  // Process each day
  for (const [dateNumber, dayEntries] of groupedByDate) {
    // Convert Excel date number to actual date
    const date = convertExcelDateToDate(dateNumber);
    
    // Sort entries by time
    const sortedEntries = dayEntries.sort((a, b) => {
      const timeA = parseTime(a.Hora);
      const timeB = parseTime(b.Hora);
      return timeA - timeB;
    });
    
    // Classify tides as high or low
    const tides = classifyTides(sortedEntries, date);
    
    // Find highest and lowest tides
    const highestTide = tides.reduce((max, tide) => 
      tide.height > max.height ? tide : max, tides[0]);
    const lowestTide = tides.reduce((min, tide) => 
      tide.height < min.height ? tide : min, tides[0]);
    
    // Get day of week
    const dayOfWeek = date.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase();
    
    processedData.push({
      date,
      dayOfWeek,
      tides,
      highestTide,
      lowestTide,
      location: PUNTARENAS_COORDS
    });
  }
  
  // Sort by date
  processedData.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  return processedData;
}

function convertExcelDateToDate(excelDateNumber: number): Date {
  // Excel date number - convert to actual date
  // Excel epoch is January 1, 1900 (but Excel treats 1900 as leap year incorrectly)
  const excelEpoch = new Date(1900, 0, 1);
  const daysSinceEpoch = excelDateNumber - 2; // Excel has a bug where 1900 is treated as leap year
  
  // Create date in local timezone to avoid UTC conversion issues
  const date = new Date(excelEpoch.getFullYear(), excelEpoch.getMonth(), excelEpoch.getDate() + daysSinceEpoch);
  
  // Set the time to midnight to avoid timezone issues
  date.setHours(0, 0, 0, 0);
  return date;
}

function parseTime(timeStr: string): number {
  // Convert HH:MM to minutes since midnight
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function classifyTides(entries: RawTideEntry[], date: Date): ProcessedTideEntry[] {
  const tides: ProcessedTideEntry[] = [];
  
  // Convert entries to tide objects
  const tideEntries = entries.map(entry => {
    const [hours, minutes] = entry.Hora.split(':').map(Number);
    const time = new Date(date);
    time.setHours(hours, minutes, 0, 0);
    
    return {
      time: time,
      height: entry['Altura (pies)'],
      originalEntry: entry
    };
  });
  
  if (tideEntries.length === 0) {
    return tides;
  }
  
  // Improved classification: use statistical approach
  // Sort by height to find natural clusters
  const sortedByHeight = [...tideEntries].sort((a, b) => a.height - b.height);
  
  // Find the median height to separate high and low tides
  const medianHeight = sortedByHeight[Math.floor(sortedByHeight.length / 2)].height;
  
  // Classify tides based on whether they're above or below median
  // CORRECTED: higher = high tide, lower = low tide
  tideEntries.forEach(entry => {
    tides.push({
      time: entry.time,
      height: entry.height,
      type: entry.height >= medianHeight ? 'high' : 'low' // CORRECTED: higher = high tide, lower = low tide
    });
  });
  
  return tides;
}

function calculateCurrentHeight(tides: ProcessedTideEntry[], now: Date): { height: number, direction: 'rising' | 'falling' | 'stable' } {
  // Sort tides by time
  const sortedTides = tides.sort((a, b) => a.time.getTime() - b.time.getTime());
  
  // Find the two tides that bracket the current time
  let beforeTide = null;
  let afterTide = null;
  
  for (let i = 0; i < sortedTides.length; i++) {
    if (sortedTides[i].time <= now) {
      beforeTide = sortedTides[i];
    } else {
      afterTide = sortedTides[i];
      break;
    }
  }
  
  // If we're at or after the last tide, wrap around to the first tide of the next cycle
  if (!afterTide && beforeTide) {
    afterTide = sortedTides[0];
    // Create a new date for the next day
    const nextDay = new Date(afterTide.time);
    nextDay.setDate(nextDay.getDate() + 1);
    afterTide = { ...afterTide, time: nextDay };
  }
  
  // If we're before the first tide, use the last tide of the previous day
  if (!beforeTide && afterTide) {
    beforeTide = sortedTides[sortedTides.length - 1];
    // Create a new date for the previous day
    const prevDay = new Date(beforeTide.time);
    prevDay.setDate(prevDay.getDate() - 1);
    beforeTide = { ...beforeTide, time: prevDay };
  }
  
  if (!beforeTide || !afterTide) {
    // Fallback to average height
    const avgHeight = tides.reduce((sum, tide) => sum + tide.height, 0) / tides.length;
    return { height: Math.round(avgHeight * 10) / 10, direction: 'stable' };
  }
  
  // Determine direction based on tide heights
  let direction: 'rising' | 'falling' | 'stable';
  if (afterTide.height > beforeTide.height) {
    direction = 'rising';
  } else if (afterTide.height < beforeTide.height) {
    direction = 'falling';
  } else {
    direction = 'stable';
  }
  
  // Interpolate between the two tides
  const timeDiff = afterTide.time.getTime() - beforeTide.time.getTime();
  const currentDiff = now.getTime() - beforeTide.time.getTime();
  const progress = currentDiff / timeDiff;
  
  // Use sine interpolation for more natural tide curve
  const sineProgress = Math.sin(progress * Math.PI);
  const height = beforeTide.height + (afterTide.height - beforeTide.height) * sineProgress;
  
  return { height: Math.round(height * 10) / 10, direction }; // Round to 1 decimal
}

function findNextTides(tides: ProcessedTideEntry[], now: Date): { nextHighTide: any, nextLowTide: any } {
  // Sort tides by time
  const sortedTides = tides.sort((a, b) => a.time.getTime() - b.time.getTime());
  
  // Find next high and low tides
  let nextHighTide = null;
  let nextLowTide = null;
  
  // Look for next tides today
  for (const tide of sortedTides) {
    if (tide.time > now) {
      if (tide.type === 'high' && !nextHighTide) {
        nextHighTide = tide;
      } else if (tide.type === 'low' && !nextLowTide) {
        nextLowTide = tide;
      }
    }
  }
  
  // If we didn't find next tides today, look for them tomorrow
  if (!nextHighTide || !nextLowTide) {
    for (const tide of sortedTides) {
      const tomorrowTide = { ...tide };
      tomorrowTide.time = new Date(tide.time);
      tomorrowTide.time.setDate(tomorrowTide.time.getDate() + 1);
      
      if (tomorrowTide.time > now) {
        if (tomorrowTide.type === 'high' && !nextHighTide) {
          nextHighTide = tomorrowTide;
        } else if (tomorrowTide.type === 'low' && !nextLowTide) {
          nextLowTide = tomorrowTide;
        }
      }
    }
  }
  
  // Fallback to first tides if still not found
  if (!nextHighTide) {
    nextHighTide = sortedTides.find(tide => tide.type === 'high') || sortedTides[0];
  }
  if (!nextLowTide) {
    nextLowTide = sortedTides.find(tide => tide.type === 'low') || sortedTides[0];
  }
  
  return {
    nextHighTide: {
      time: nextHighTide.time,
      height: nextHighTide.height
    },
    nextLowTide: {
      time: nextLowTide.time,
      height: nextLowTide.height
    }
  };
}
