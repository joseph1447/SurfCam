import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { validateEmail } from '@/lib/emailValidation';

// Función para detectar el tipo de dispositivo
function getDeviceType(userAgent: string): 'mobile' | 'tablet' | 'desktop' {
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  const tabletRegex = /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)/i;
  
  if (tabletRegex.test(userAgent)) return 'tablet';
  if (mobileRegex.test(userAgent)) return 'mobile';
  return 'desktop';
}

// Función para detectar el navegador
function getBrowser(userAgent: string): string {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  return 'Unknown';
}

// Función para detectar el sistema operativo
function getOS(userAgent: string): string {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Unknown';
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { email, password, accessType } = await request.json();
    const userAgent = request.headers.get('user-agent') || '';
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    // Validate email
    const emailValidation = await validateEmail(email);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { error: emailValidation.error || 'Email inválido' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    let user = await User.findOne({ email: email.toLowerCase() });
    const loginTime = new Date();
    if (user) {
      // Si el usuario existe y la clave premium es correcta, actualizar a premium
      if (accessType === 'premium' && user.accessType !== 'premium') {
        user.accessType = 'premium';
        if (password) {
          user.password = await bcrypt.hash(password, 12);
        }
      }
      // Actualizar contadores y login info
      user.loginCount = (user.loginCount || 0) + 1;
      user.lastLogin = loginTime;
      user.lastActivity = loginTime;
      // Actualizar estadísticas de actividad
      if (user.activityStats) {
        user.activityStats.lastActivity = loginTime;
        // Actualizar días activos consecutivos
        const lastActivity = new Date(user.activityStats.lastActivity);
        const daysDiff = Math.floor((loginTime.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) {
          user.activityStats.consecutiveDaysActive += 1;
        } else if (daysDiff > 1) {
          user.activityStats.consecutiveDaysActive = 1;
        }
        // Actualizar día más activo
        const dayCounts = user.sessionHistory.reduce((acc: any, session) => {
          const day = new Date(session.loginTime).getDay().toString();
          acc[day] = (acc[day] || 0) + 1;
          return acc;
        }, {});
        if (Object.keys(dayCounts).length > 0) {
          const mostActiveDay = Object.keys(dayCounts).reduce((a, b) => dayCounts[a] > dayCounts[b] ? a : b);
          user.activityStats.mostActiveDay = mostActiveDay;
        }
      }
      // Agregar nueva sesión al historial
      user.sessionHistory.push({
        loginTime,
        userAgent,
        ipAddress,
        deviceType: getDeviceType(userAgent),
        browser: getBrowser(userAgent),
        os: getOS(userAgent)
      });
      // Mantener solo las últimas 50 sesiones
      if (user.sessionHistory.length > 50) {
        user.sessionHistory = user.sessionHistory.slice(-50);
      }
      await user.save();
      return NextResponse.json({
        success: true,
        user: {
          _id: user._id,
          email: user.email,
          accessType: user.accessType,
          username: user.username,
          loginCount: user.loginCount,
          lastLogin: user.lastLogin
        }
      });
    } else {
      // Crear nuevo usuario
      const hashedPassword = password ? await bcrypt.hash(password, 12) : undefined;
      const newUser = new User({
        email: email.toLowerCase(),
        accessType: accessType || 'free',
        password: hashedPassword,
        lastLogin: loginTime,
        loginCount: 1,
        sessionHistory: [{
          loginTime,
          userAgent,
          ipAddress,
          deviceType: getDeviceType(userAgent),
          browser: getBrowser(userAgent),
          os: getOS(userAgent)
        }],
        activityStats: {
          firstLogin: loginTime,
          lastActivity: loginTime,
          totalDaysActive: 1,
          consecutiveDaysActive: 1,
          preferredLoginTime: loginTime.getHours().toString(),
          mostActiveDay: loginTime.getDay().toString()
        }
      });
      await newUser.save();
      return NextResponse.json({
        success: true,
        user: {
          _id: newUser._id,
          email: newUser.email,
          accessType: newUser.accessType,
          username: newUser.username,
          loginCount: newUser.loginCount,
          lastLogin: newUser.lastLogin
        }
      });
    }
    
  } catch (error) {
    console.error('User registration error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
