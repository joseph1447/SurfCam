import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ChatGroup from '@/models/ChatGroup';

export async function GET(req: NextRequest) {
  await connectDB();
  const groups = await ChatGroup.find({}).lean();
  return NextResponse.json({ success: true, groups });
}
