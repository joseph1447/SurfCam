import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ChatGroup from '@/models/ChatGroup';

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    if (!groupId) {
      return NextResponse.json(
        { error: 'ID del grupo requerido' },
        { status: 400 }
      );
    }

    // Verificar que el grupo existe
    const group = await ChatGroup.findById(groupId);
    if (!group) {
      return NextResponse.json(
        { error: 'Grupo no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar el grupo
    await ChatGroup.findByIdAndDelete(groupId);

    return NextResponse.json({
      success: true,
      message: 'Grupo eliminado correctamente'
    });

  } catch (error) {
    console.error('Delete group error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

