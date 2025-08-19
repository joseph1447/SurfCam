import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

function isValidInstagramUrl(url: string) {
  return /^https:\/\/(www\.)?instagram\.com\/[A-Za-z0-9_.]+\/?$/.test(url);
}

export async function PUT(req: NextRequest) {
  await connectDB();
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });
  }
  const { username, instagram } = await req.json();
  if (username && (typeof username !== 'string' || username.length < 2 || username.length > 32)) {
    return NextResponse.json({ success: false, error: 'Nombre de usuario inválido' }, { status: 400 });
  }
  if (instagram) {
    if (typeof instagram !== 'string' || instagram.length > 128 || !isValidInstagramUrl(instagram)) {
      return NextResponse.json({ success: false, error: 'Instagram inválido. Debe ser un link como https://instagram.com/usuario' }, { status: 400 });
    }
  }
  try {
    const update: any = {};
    if (username) update.username = username;
    if (instagram !== undefined) update.instagram = instagram;
    const user = await User.findByIdAndUpdate(userId, update, { new: true });
    if (!user) {
      return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, user: { _id: user._id, email: user.email, accessType: user.accessType, username: user.username, instagram: user.instagram } });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Error al actualizar el perfil' }, { status: 500 });
  }
}
