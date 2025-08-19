import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ChatGroup from '@/models/ChatGroup';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  await connectDB();
  const { groupId, userId } = await req.json();
  if (!groupId || !userId) {
    return NextResponse.json({ success: false, error: 'Datos incompletos' }, { status: 400 });
  }
  // Solo admin puede eliminar
  const user = await User.findById(userId);
  if (!user || user.email !== (process.env.ADMINUSER || 'josephquesada92@gmail.com')) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });
  }
  const group = await ChatGroup.findByIdAndDelete(groupId);
  if (!group) {
    return NextResponse.json({ success: false, error: 'Grupo no encontrado' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}

