import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import GroupService from '@/services/GroupService';

export async function GET(req: NextRequest) {
  await connectDB();
  const group = req.nextUrl.searchParams.get('group');
  const userId = req.nextUrl.searchParams.get('userId');
  if (!group || !userId) {
    return NextResponse.json({ success: false, error: 'Datos incompletos' }, { status: 400 });
  }
  const isMember = await GroupService.isMember({ name: group, userId });
  return NextResponse.json({ success: true, isMember });
}
