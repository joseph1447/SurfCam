import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ChatMessage from '@/models/ChatMessage';

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url!);
  const group = searchParams.get('group') || 'general';
  
  // Get today's date range in Costa Rica timezone (UTC-6)
  const now = new Date();
  
  // Get current date in Costa Rica timezone
  const costaRicaNow = new Date(now.toLocaleString("en-US", {timeZone: "America/Costa_Rica"}));
  
  // Create start of day in Costa Rica (midnight)
  const startOfDayCostaRica = new Date(costaRicaNow.getFullYear(), costaRicaNow.getMonth(), costaRicaNow.getDate());
  
  // Convert start of day to UTC by creating a date string in Costa Rica timezone and parsing it
  const startOfDayString = startOfDayCostaRica.toLocaleString("en-US", {timeZone: "America/Costa_Rica"});
  const startOfDayUTC = new Date(startOfDayString);
  
  // Create end of day in Costa Rica (next midnight)
  const endOfDayCostaRica = new Date(costaRicaNow.getFullYear(), costaRicaNow.getMonth(), costaRicaNow.getDate() + 1);
  
  // Convert end of day to UTC
  const endOfDayString = endOfDayCostaRica.toLocaleString("en-US", {timeZone: "America/Costa_Rica"});
  const endOfDayUTC = new Date(endOfDayString);
  
  // Fetch only today's messages for the group (in Costa Rica timezone)
  const messages = await ChatMessage.find({
    group,
    timestamp: { $gte: startOfDayUTC, $lt: endOfDayUTC }
  })
    .sort({ timestamp: 1 })
    .limit(100)
    .lean();
    
  console.log(`[HISTORY] group=${group} costaRicaNow=${costaRicaNow.toISOString()} startOfDayUTC=${startOfDayUTC.toISOString()} endOfDayUTC=${endOfDayUTC.toISOString()} messagesFound=${messages.length}`);
  
  return NextResponse.json({ messages });
}
