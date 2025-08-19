import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import ChatMessage from '@/models/ChatMessage';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url!);
  const group = searchParams.get('group') || 'general';
  // Get today's date range
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const messages = await ChatMessage.find({
    group,
    timestamp: { $gte: startOfDay, $lt: endOfDay }
  })
    .sort({ timestamp: 1 })
    .limit(100)
    .lean();

  // Add instagram field to each message
  const userIds = [...new Set(messages.map(m => m.userId?.toString()))];
  const users = await User.find({ _id: { $in: userIds } }, { _id: 1, instagram: 1 }).lean();
  const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u.instagram]));
  const messagesWithInstagram = messages.map(m => ({
    ...m,
    instagram: userMap[m.userId?.toString()] || undefined
  }));

  return Response.json({ messages: messagesWithInstagram });
}
