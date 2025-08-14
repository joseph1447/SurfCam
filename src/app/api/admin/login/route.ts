import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validar que sea el email correcto (hardcoded)
    if (email !== 'josephquesada92@gmail.com') {
      return NextResponse.json(
        { error: 'Acceso denegado' },
        { status: 403 }
      );
    }

    // Verificar contraseña (hardcoded)
    if (password !== 'surfoQ2194') {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }

    // Login exitoso - no necesita base de datos
    return NextResponse.json({
      success: true,
      admin: {
        email: 'josephquesada92@gmail.com',
        role: 'super_admin'
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
