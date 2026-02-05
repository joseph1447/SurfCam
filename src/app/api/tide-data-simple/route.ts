import { NextResponse } from 'next/server';

// Simulated tide data for Costa Rica (Puntarenas area)
const generateTideData = () => {
  const now = new Date();
  const costaRicaTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Costa_Rica"}));
  
  // Generate realistic tide data for Costa Rica
  const tides = [];
  
  // Realistic Costa Rica tide pattern (2 high tides, 2 low tides per day)
  const tidePattern = [
    { hour: 6, type: 'high', height: 2.8 },   // Morning high tide
    { hour: 12, type: 'low', height: 1.2 },    // Midday low tide  
    { hour: 18, type: 'high', height: 3.1 },   // Evening high tide
    { hour: 0, type: 'low', height: 0.8 }      // Night low tide
  ];
  
  // Add some realistic variation
  tidePattern.forEach(tide => {
    const variation = (Math.random() - 0.5) * 0.4; // ±0.2m variation
    const height = Math.max(0.5, Math.min(3.5, tide.height + variation));
    
    tides.push({
      time: `${tide.hour.toString().padStart(2, '0')}:00`,
      height: Math.round(height * 10) / 10,
      type: tide.type
    });
  });
  
  return tides;
};

const calculateCurrentTide = (tides: any[], currentTime: Date) => {
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  
  // Find current tide
  let currentTide = tides[0];
  let nextTide = null;
  
  for (let i = 0; i < tides.length; i++) {
    const [tideHour, tideMinute] = tides[i].time.split(':').map(Number);
    const tideTimeInMinutes = tideHour * 60 + tideMinute;
    
    if (tideTimeInMinutes <= currentTimeInMinutes) {
      currentTide = tides[i];
      // Check if there's a next tide today
      if (i + 1 < tides.length) {
        nextTide = tides[i + 1];
      }
    } else {
      // Found a future tide
      if (!nextTide) {
        nextTide = tides[i];
      }
      break;
    }
  }
  
  // If no next tide found today, check tomorrow's first tide
  if (!nextTide) {
    nextTide = tides[0]; // Tomorrow's first tide
  }
  
  // Interpolate current height
  const [currentTideHour, currentTideMinute] = currentTide.time.split(':').map(Number);
  const currentTideTimeInMinutes = currentTideHour * 60 + currentTideMinute;
  
  let currentHeight = currentTide.height;
  
  if (nextTide) {
    const [nextTideHour, nextTideMinute] = nextTide.time.split(':').map(Number);
    const nextTideTimeInMinutes = nextTideHour * 60 + nextTideMinute;
    
    const totalDuration = nextTideTimeInMinutes - currentTideTimeInMinutes;
    const elapsedTime = currentTimeInMinutes - currentTideTimeInMinutes;
    
    if (totalDuration > 0) {
      const progress = Math.max(0, Math.min(1, elapsedTime / totalDuration));
      currentHeight = currentTide.height + (nextTide.height - currentTide.height) * progress;
    }
  }
  
  return {
    height: Math.round(currentHeight * 10) / 10,
    type: currentTide.type,
    nextChange: nextTide ? nextTide.time : 'Sin registro'
  };
};

export async function GET() {
  try {
    const now = new Date();
    const costaRicaTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Costa_Rica"}));
    
    const tides = generateTideData();
    const currentTide = calculateCurrentTide(tides, costaRicaTime);
    
    return NextResponse.json({
      success: true,
      tides,
      currentTide,
      location: {
        lat: 9.9769,
        lng: -84.8384,
        name: "Puntarenas, Costa Rica"
      },
      timestamp: costaRicaTime.toISOString()
    });
    
  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate tide data',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
