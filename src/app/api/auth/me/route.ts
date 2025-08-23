import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Por ahora, vamos a devolver un usuario de prueba para testing
    // En producción, esto debería obtener el usuario de la sesión
    const testUser = await User.findOne({ email: 'admin@example.com' });
    
    if (!testUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      user: {
        _id: testUser._id,
        email: testUser.email,
        accessType: testUser.accessType,
        role: testUser.role,
        username: testUser.username,
        instagram: testUser.instagram,
        loginCount: testUser.loginCount,
        lastLogin: testUser.lastLogin
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
