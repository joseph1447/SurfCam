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
  time: string; // Changed from Date to string - direct from Excel
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
  // Find target date's data - Fixed for Vercel deployment
  // Convert target date to YYYY-MM-DD string for comparison
  const targetDateString = targetDate.toISOString().split('T')[0];
  
  // Debug: Log the target date we're looking for
  console.log('Looking for date:', targetDateString);
  
  const todayData = processedData.find(day => {
    const dayDateString = day.date.toISOString().split('T')[0];
    
    // Debug: Log each day we're checking
    console.log('Checking day:', dayDateString, 'Match:', dayDateString === targetDateString);
    
    return dayDateString === targetDateString;
  });
  
  if (!todayData) {
    // If no data for today, find the closest available date
    if (processedData.length > 0) {
      
      // Find the closest date to target date
      let closestData = processedData[0];
      let minDiff = Math.abs(closestData.date.getTime() - targetDate.getTime());
      
      for (const dayData of processedData) {
        const diff = Math.abs(dayData.date.getTime() - targetDate.getTime());
        if (diff < minDiff) {
          minDiff = diff;
          closestData = dayData;
        }
      }
      
      // Debug: Log which date we're using as fallback
      console.log('Using fallback date:', closestData.date.toISOString().split('T')[0]);
      
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
  
  // Debug: Log that we found the correct date
  console.log('Found correct date:', todayData.date.toISOString().split('T')[0]);
  
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
  const daysSinceEpoch = excelDateNumber - 3; // Fixed: Don't subtract any days, use the Excel date number directly
  
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
    return {
      time: entry.Hora, // Direct from Excel, no conversion
      height: entry['Altura (pies)'],
      originalEntry: entry
    };
  });
  
  if (tideEntries.length === 0) {
    return tides;
  }
  
  // Use a fixed threshold for tide classification
  // High tide: >= 5.0 feet
  // Low tide: < 5.0 feet
  const HIGH_TIDE_THRESHOLD = 5.0;
  
  tideEntries.forEach(entry => {
    tides.push({
      time: entry.time,
      height: entry.height,
      type: entry.height >= HIGH_TIDE_THRESHOLD ? 'high' : 'low'
    });
  });
  
  return tides;
}

function calculateCurrentHeight(tides: ProcessedTideEntry[], now: Date): { height: number, direction: 'rising' | 'falling' | 'stable' } {
  // Sort tides by time
  const sortedTides = tides.sort((a, b) => a.time.localeCompare(b.time));
  
  // Get current time as HH:MM string
  const currentTimeString = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Costa_Rica'
  });
  
  // Find the two tides that bracket the current time
  let beforeTide = null;
  let afterTide = null;
  
  for (let i = 0; i < sortedTides.length; i++) {
    if (sortedTides[i].time <= currentTimeString) {
      beforeTide = sortedTides[i];
    } else {
      afterTide = sortedTides[i];
      break;
    }
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
  
  // Simple interpolation based on time difference
  const beforeTime = beforeTide.time;
  const afterTime = afterTide.time;
  const currentTime = currentTimeString;
  
  // Calculate progress (simplified)
  const progress = 0.5; // Default to middle
  const height = beforeTide.height + (afterTide.height - beforeTide.height) * progress;
  
  return { height: Math.round(height * 10) / 10, direction };
}

function findNextTides(tides: ProcessedTideEntry[], now: Date): { nextHighTide: any, nextLowTide: any } {
  // Sort tides by time
  const sortedTides = tides.sort((a, b) => a.time.localeCompare(b.time));
  
  // Get current time as HH:MM string
  const currentTimeString = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Costa_Rica'
  });
  
  // Find next high and low tides
  let nextHighTide = null;
  let nextLowTide = null;
  
  // Look for next tides today
  for (const tide of sortedTides) {
    if (tide.time > currentTimeString) {
      if (tide.type === 'high' && !nextHighTide) {
        nextHighTide = tide;
      } else if (tide.type === 'low' && !nextLowTide) {
        nextLowTide = tide;
      }
    }
  }
  
  // Fallback to first tides if not found
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
