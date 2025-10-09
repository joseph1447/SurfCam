import type { NextApiRequest, NextApiResponse } from 'next';
import { OAuth2Client } from 'google-auth-library';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'postmessage'
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { code } = req.body;
  if (!code) return res.status(400).json({ message: 'Missing Google auth code' });

  try {
    // Exchange code for tokens
    const { tokens } = await client.getToken(code);
    if (!tokens.id_token) throw new Error('No ID token returned from Google');
    // Now verify the ID token
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) throw new Error('Invalid Google ID token');

    await dbConnect();
    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({
        email: payload.email,
        username: payload.name,
        accessType: 'free',
        googleId: payload.sub,
        picture: payload.picture,
        loginCount: 0,
        totalViews: 0,
        isActive: true,
        activityStats: {
          firstLogin: new Date(),
          lastActivity: new Date(),
          totalDaysActive: 1,
          consecutiveDaysActive: 1,
          preferredLoginTime: new Date().getHours().toString(),
          mostActiveDay: new Date().getDay().toString()
        },
        sessionHistory: []
      });
      console.log('Created new user from Google:', user.email);
    } else {
      user.googleId = payload.sub;
      user.picture = payload.picture;
      user.username = user.username || payload.name;
      await user.save();
      console.log('Updated existing user from Google:', user.email);
    }

    // Registrar actividad de login
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Actualizar métricas del usuario
    const updates: any = {
      lastLogin: now,
      loginCount: (user.loginCount || 0) + 1,
      totalViews: (user.totalViews || 0) + 1,
      lastViewDate: now,
      lastActivity: now,
      'activityStats.lastActivity': now
    };

    // Actualizar firstLogin si es la primera vez
    if (!user.activityStats?.firstLogin) {
      updates['activityStats.firstLogin'] = now;
    }

    // Actualizar días activos
    if (user.lastViewDate) {
      const lastViewDay = new Date(user.lastViewDate.getFullYear(), user.lastViewDate.getMonth(), user.lastViewDate.getDate());
      const daysDiff = Math.floor((today.getTime() - lastViewDay.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // Día consecutivo
        updates['activityStats.consecutiveDaysActive'] = (user.activityStats?.consecutiveDaysActive || 0) + 1;
        updates['activityStats.totalDaysActive'] = (user.activityStats?.totalDaysActive || 0) + 1;
      } else if (daysDiff > 1) {
        // Día no consecutivo
        updates['activityStats.consecutiveDaysActive'] = 1;
        updates['activityStats.totalDaysActive'] = (user.activityStats?.totalDaysActive || 0) + 1;
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
      userAgent: 'Google OAuth',
      ipAddress: 'Unknown',
      deviceType: 'desktop',
      browser: 'Google',
      os: 'Unknown'
    };

    updates.$push = {
      sessionHistory: {
        $each: [newSession],
        $slice: -50 // Mantener solo las últimas 50 sesiones
      }
    };

    // Actualizar el usuario
    await User.findByIdAndUpdate(user._id, updates);

    // Obtener el usuario actualizado
    const updatedUser = await User.findById(user._id);
    res.status(200).json({ 
      user: {
        _id: updatedUser._id,
        email: updatedUser.email,
        accessType: updatedUser.accessType,
        role: updatedUser.role,
        username: updatedUser.username,
        instagram: updatedUser.instagram,
        loginCount: updatedUser.loginCount,
        lastLogin: updatedUser.lastLogin
      }
    });
  } catch (err: any) {
    console.error('Google login error:', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}
