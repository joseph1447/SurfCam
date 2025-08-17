import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function PUT(req: NextRequest) {
  await connectDB();
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });
  }
  const { username } = await req.json();
  if (!username || typeof username !== 'string' || username.length < 2 || username.length > 32) {
    return NextResponse.json({ success: false, error: 'Nombre de usuario inválido' }, { status: 400 });
  }
  try {
    const user = await User.findByIdAndUpdate(userId, { username }, { new: true });
    if (!user) {
      return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, user: { _id: user._id, email: user.email, accessType: user.accessType, username: user.username } });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Error al actualizar el perfil' }, { status: 500 });
  }
}
