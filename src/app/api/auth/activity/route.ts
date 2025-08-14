import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { email, activityType, data } = await request.json();
    
    if (!email || !activityType) {
      return NextResponse.json(
        { error: 'Email y tipo de actividad requeridos' },
        { status: 400 }
      );
    }

    // Buscar el usuario
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar última actividad
    user.lastActivity = new Date();
    
    // Registrar actividad específica
    switch (activityType) {
      case 'video_view':
        user.totalViews += 1;
        user.lastViewDate = new Date();
        break;
      case 'page_view':
        // Registrar vista de página
        break;
      case 'button_click':
        // Registrar clic en botón
        break;
      default:
        // Actividad genérica
        break;
    }
    
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Actividad registrada exitosamente'
    });

  } catch (error) {
    console.error('Activity tracking error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
