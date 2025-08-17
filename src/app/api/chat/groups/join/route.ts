import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import ChatGroup from '@/models/ChatGroup';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  await connectDB();
  const { group, password } = await req.json();
  // For demo, assume user is authenticated and userId is available (should be from session in real app)
  // In production, extract userId from session/auth
  // Here, just allow join if password matches
  if (group !== 'el-trillo') {
    return Response.json({ success: false, error: 'Grupo inválido' }, { status: 400 });
  }
  const chatGroup = await ChatGroup.findOne({ name: 'el-trillo' });
  if (!chatGroup) {
    return Response.json({ success: false, error: 'Grupo no encontrado' }, { status: 404 });
  }
  if (!chatGroup.password) {
    return Response.json({ success: false, error: 'El grupo no tiene contraseña' }, { status: 400 });
  }
  const isMatch = await bcrypt.compare(password, chatGroup.password);
  if (!isMatch) {
    return Response.json({ success: false, error: 'Contraseña incorrecta' }, { status: 401 });
  }
  // In a real app, add user to group members here
  return Response.json({ success: true });
}
