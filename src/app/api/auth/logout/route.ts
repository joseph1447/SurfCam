import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email requerido' },
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

    // Encontrar la sesión más reciente sin logout
    const currentSession = user.sessionHistory
      .filter(session => !session.logoutTime)
      .sort((a, b) => new Date(b.loginTime).getTime() - new Date(a.loginTime).getTime())[0];

    if (currentSession) {
      const logoutTime = new Date();
      const sessionDuration = Math.floor((logoutTime.getTime() - new Date(currentSession.loginTime).getTime()) / 1000);
      
      // Actualizar la sesión actual
      currentSession.logoutTime = logoutTime;
      currentSession.sessionDuration = sessionDuration;
      
      // Actualizar estadísticas del usuario
      user.totalSessionTime += sessionDuration;
      user.averageSessionTime = Math.floor(user.totalSessionTime / user.loginCount);
      
      // Actualizar última actividad
      user.lastActivity = logoutTime;
      
      await user.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Logout registrado exitosamente'
    });

  } catch (error) {
    console.error('Logout tracking error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
