import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ChatMessage from '@/models/ChatMessage';

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url!);
  const group = searchParams.get('group') || 'general';
  // Get today's date range
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  // Fetch only today's messages for the group
  const messages = await ChatMessage.find({
    group,
    timestamp: { $gte: startOfDay, $lt: endOfDay }
  })
    .sort({ timestamp: 1 })
    .limit(100)
    .lean();
  console.log(`[HISTORY] group=${group} startOfDay=${startOfDay.toISOString()} endOfDay=${endOfDay.toISOString()} messagesFound=${messages.length}`);
  return NextResponse.json({ messages });
}
