import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { userId, userAgent, ipAddress, deviceType, browser, os } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'ID de usuario requerido' },
        { status: 400 }
      );
    }

    // Buscar el usuario
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Actualizar métricas del usuario
    const updates: any = {
      lastLogin: now,
      loginCount: user.loginCount + 1,
      totalViews: user.totalViews + 1, // Incrementar vistas también
      lastViewDate: now,
      lastActivity: now,
      'activityStats.lastActivity': now
    };

    // Actualizar firstLogin si es la primera vez
    if (!user.activityStats.firstLogin) {
      updates['activityStats.firstLogin'] = now;
    }

    // Actualizar días activos
    if (user.lastViewDate) {
      const lastViewDay = new Date(user.lastViewDate.getFullYear(), user.lastViewDate.getMonth(), user.lastViewDate.getDate());
      const daysDiff = Math.floor((today.getTime() - lastViewDay.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // Día consecutivo
        updates['activityStats.consecutiveDaysActive'] = (user.activityStats.consecutiveDaysActive || 0) + 1;
        updates['activityStats.totalDaysActive'] = (user.activityStats.totalDaysActive || 0) + 1;
      } else if (daysDiff > 1) {
        // Día no consecutivo
        updates['activityStats.consecutiveDaysActive'] = 1;
        updates['activityStats.totalDaysActive'] = (user.activityStats.totalDaysActive || 0) + 1;
      }
    } else {
      // Primera vez
      updates['activityStats.totalDaysActive'] = 1;
      updates['activityStats.consecutiveDaysActive'] = 1;
    }

    // Actualizar hora preferida de login
    const hour = now.getHours().toString();
    updates['activityStats.preferredLoginTime'] = hour;

    // Actualizar día más activo
    const dayOfWeek = now.getDay().toString();
    updates['activityStats.mostActiveDay'] = dayOfWeek;

    // Agregar nueva sesión al historial
    const newSession = {
      loginTime: now,
      userAgent: userAgent || 'Unknown',
      ipAddress: ipAddress || 'Unknown',
      deviceType: deviceType || 'desktop',
      browser: browser || 'Unknown',
      os: os || 'Unknown'
    };

    updates.$push = {
      sessionHistory: {
        $each: [newSession],
        $slice: -50 // Mantener solo las últimas 50 sesiones
      }
    };

    // Actualizar el usuario
    await User.findByIdAndUpdate(userId, updates);

    return NextResponse.json({
      success: true,
      message: 'Actividad registrada correctamente'
    });

  } catch (error) {
    console.error('Activity tracking error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
