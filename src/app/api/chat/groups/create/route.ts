import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import GroupService from '@/services/GroupService';
import { validateCreateGroupInput } from '@/utils/validate';

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const { name, password, userId } = await req.json();
    validateCreateGroupInput({ name, password, userId });
    await GroupService.createGroup({ name, password, createdBy: userId });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
