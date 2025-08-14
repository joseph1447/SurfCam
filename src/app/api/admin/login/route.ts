import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Admin from '@/models/Admin';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { email, password } = await request.json();

    // Validar que sea el email correcto
    if (email !== 'josephquesada92@gmail.com') {
      return NextResponse.json(
        { error: 'Acceso denegado' },
        { status: 403 }
      );
    }

    // Buscar el admin
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    
    if (!admin) {
      // Crear el admin si no existe
      const hashedPassword = await bcrypt.hash('surfoQ2194', 12);
      const newAdmin = new Admin({
        email: 'josephquesada92@gmail.com',
        password: hashedPassword,
        role: 'super_admin'
      });
      await newAdmin.save();
      
      return NextResponse.json({
        success: true,
        admin: {
          email: newAdmin.email,
          role: newAdmin.role
        }
      });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, admin.password);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }

    // Actualizar último login
    admin.lastLogin = new Date();
    await admin.save();

    return NextResponse.json({
      success: true,
      admin: {
        email: admin.email,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
