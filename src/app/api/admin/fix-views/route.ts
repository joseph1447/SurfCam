import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Obtener todos los usuarios
    const users = await User.find({});
    let updatedCount = 0;
    
    for (const user of users) {
      // Si las vistas son menores que los logins, actualizar
      if (user.totalViews < user.loginCount) {
        await User.findByIdAndUpdate(user._id, {
          totalViews: user.loginCount,
          lastViewDate: user.lastLogin || new Date()
        });
        updatedCount++;
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Se actualizaron ${updatedCount} usuarios`,
      updatedCount
    });

  } catch (error) {
    console.error('Fix views error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
