import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_CREDENTIALS } from '@/lib/adminAuth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log('Admin login attempt:', { email, passwordMatch: password === ADMIN_CREDENTIALS.password });

    // Validate credentials
    if (email !== ADMIN_CREDENTIALS.email) {
      console.log('Invalid email:', email);
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    if (password !== ADMIN_CREDENTIALS.password) {
      console.log('Invalid password for email:', email);
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Create a simple session token (in production, use JWT)
    const sessionToken = Buffer.from(`${email}:${Date.now()}`).toString('base64');
    
    console.log('Creating session token for:', email);

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login exitoso',
      admin: {
        email: ADMIN_CREDENTIALS.email,
        role: 'admin'
      }
    });

    // Set HTTP-only cookie for security
    response.cookies.set('admin-session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin-session')?.value;
    
    console.log('Auth check - session token exists:', !!sessionToken);

    if (!sessionToken) {
      console.log('No session token found');
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    // Decode and validate session token
    try {
      const decoded = Buffer.from(sessionToken, 'base64').toString('utf-8');
      const [email, timestamp] = decoded.split(':');
      
      // Check if session is not expired (24 hours)
      const sessionTime = parseInt(timestamp);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (now - sessionTime > maxAge) {
        return NextResponse.json(
          { authenticated: false, error: 'Sesión expirada' },
          { status: 401 }
        );
      }

      if (email === ADMIN_CREDENTIALS.email) {
        console.log('Valid session found for:', email);
        return NextResponse.json({
          authenticated: true,
          admin: {
            email: ADMIN_CREDENTIALS.email,
            role: 'admin'
          }
        });
      } else {
        console.log('Invalid email in session:', email);
      }
    } catch (decodeError) {
      console.error('Session decode error:', decodeError);
    }

    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );

  } catch (error) {
    console.error('Admin auth check error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logout exitoso'
    });

    // Clear the session cookie
    response.cookies.set('admin-session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Admin logout error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
