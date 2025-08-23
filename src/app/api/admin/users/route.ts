import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const accessType = searchParams.get('accessType');
    const sortBy = searchParams.get('sortBy') || 'lastLogin';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const skip = (page - 1) * limit;

    // Construir filtro
    const filter: any = {};
    if (accessType) {
      filter.accessType = accessType;
    }

    // Construir ordenamiento
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Obtener usuarios con paginación
    const users = await User.find(filter)
      .select('email username accessType role isActive loginCount lastLogin createdAt')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(); // Usar lean() para mejor rendimiento

    // Contar total de usuarios
    const total = await User.countDocuments(filter);

    // Obtener estadísticas adicionales
    const stats = await User.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalLogins: { $sum: '$loginCount' },
          totalViews: { $sum: '$totalViews' },
          avgSessionTime: { $avg: '$averageSessionTime' },
          totalSessionTime: { $sum: '$totalSessionTime' }
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: stats[0] || {
        totalLogins: 0,
        totalViews: 0,
        avgSessionTime: 0,
        totalSessionTime: 0
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const { userId, updates } = await request.json();

    // Validar que el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar usuario
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');

    return NextResponse.json({
      success: true,
      user: updatedUser
    });

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { email, accessType, subscription } = await request.json();

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'El usuario ya existe' },
        { status: 400 }
      );
    }

    // Crear nuevo usuario
    const newUser = new User({
      email: email.toLowerCase(),
      accessType,
      subscription,
      loginCount: 0,
      totalViews: 0,
      totalSessionTime: 0,
      averageSessionTime: 0,
      sessionHistory: [],
      activityStats: {
        firstLogin: new Date(),
        lastActivity: new Date(),
        totalDaysActive: 0,
        consecutiveDaysActive: 0,
        preferredLoginTime: '12',
        mostActiveDay: '1'
      }
    });

    await newUser.save();

    return NextResponse.json({
      success: true,
      user: newUser
    });

  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
