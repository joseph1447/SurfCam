import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import GroupService from '@/services/GroupService';
import { validateChangePasswordInput } from '@/utils/validate';

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const { group, newPassword, userId } = await req.json();
    validateChangePasswordInput({ group, newPassword, userId });
    await GroupService.changePassword({ name: group, newPassword });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
