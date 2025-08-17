import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ChatMessage from '@/models/ChatMessage';

// Helper to get the Socket.IO instance
function getIO() {
  // @ts-ignore
  if (globalThis.io) return globalThis.io;
  // @ts-ignore
  if (globalThis.server && globalThis.server.io) return globalThis.server.io;
  return null;
}

export async function DELETE(req: NextRequest, paramsPromise: Promise<{ params: { id: string } }>) {
  await connectDB();
  const adminEmail = process.env.ADMINUSER || 'josephquesada92@gmail.com';
  const userEmail = req.headers.get('x-user-email');
  if (userEmail !== adminEmail) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });
  }
  const { params } = await paramsPromise;
  const { id } = params;
  try {
    const deleted = await ChatMessage.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Mensaje no encontrado' }, { status: 404 });
    }
    // Emit Socket.IO event to all clients
    const io = getIO();
    if (io) {
      io.emit('messageDeleted', { _id: id });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Error al eliminar el mensaje' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, paramsPromise: Promise<{ params: { id: string } }>) {
  await connectDB();
  const { params } = await paramsPromise;
  const { id } = params;
  const { message } = await req.json();
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });
  }
  try {
    const chatMsg = await ChatMessage.findById(id);
    if (!chatMsg) {
      return NextResponse.json({ success: false, error: 'Mensaje no encontrado' }, { status: 404 });
    }
    // Only allow editing by the original user within 5 minutes
    if (String(chatMsg.userId) !== userId) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });
    }
    const now = Date.now();
    const sent = new Date(chatMsg.timestamp).getTime();
    if (now - sent > 5 * 60 * 1000) {
      return NextResponse.json({ success: false, error: 'Solo puedes editar durante los primeros 5 minutos' }, { status: 403 });
    }
    chatMsg.message = message;
    chatMsg.edited = true;
    await chatMsg.save();
    const io = getIO();
    if (io) {
      io.emit('messageEdited', { _id: id, message });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Error al editar el mensaje' }, { status: 500 });
  }
}
