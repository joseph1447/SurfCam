import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { checkAdminAuth } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
  // Check admin authentication
  const authCheck = await checkAdminAuth(request);
  if (!authCheck.authenticated) {
    return NextResponse.json(
      { error: 'Unauthorized access' },
      { status: 401 }
    );
  }
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const skip = (page - 1) * limit;
    
    // Sorting parameters
    const sortBy = searchParams.get('sortBy') || 'lastLogin';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Filter parameters
    const accessType = searchParams.get('accessType');
    const role = searchParams.get('role');
    const isActive = searchParams.get('isActive');
    const searchTerm = searchParams.get('search');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const loginCountMin = searchParams.get('loginCountMin');
    const loginCountMax = searchParams.get('loginCountMax');

    // Build filter object
    const filter: any = {};
    
    if (accessType && accessType !== 'all') {
      filter.accessType = accessType;
    }
    
    if (role && role !== 'all') {
      filter.role = role;
    }
    
    if (isActive && isActive !== 'all') {
      filter.isActive = isActive === 'true';
    }
    
    // Search in email and username
    if (searchTerm) {
      filter.$or = [
        { email: { $regex: searchTerm, $options: 'i' } },
        { username: { $regex: searchTerm, $options: 'i' } }
      ];
    }
    
    // Date range filter (for createdAt)
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) {
        filter.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filter.createdAt.$lte = new Date(dateTo);
      }
    }
    
    // Login count range filter
    if (loginCountMin || loginCountMax) {
      filter.loginCount = {};
      if (loginCountMin) {
        filter.loginCount.$gte = parseInt(loginCountMin);
      }
      if (loginCountMax) {
        filter.loginCount.$lte = parseInt(loginCountMax);
      }
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get users with pagination
    const users = await User.find(filter)
      .select('email username accessType role isActive loginCount lastLogin createdAt totalViews averageSessionTime')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Count total users
    const total = await User.countDocuments(filter);

    // Get additional statistics
    const stats = await User.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalLogins: { $sum: '$loginCount' },
          totalViews: { $sum: '$totalViews' },
          avgSessionTime: { $avg: '$averageSessionTime' },
          totalSessionTime: { $sum: '$totalSessionTime' },
          activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
          premiumUsers: { $sum: { $cond: [{ $eq: ['$accessType', 'premium'] }, 1, 0] } },
          freeUsers: { $sum: { $cond: [{ $eq: ['$accessType', 'free'] }, 1, 0] } }
        }
      }
    ]);

    // Get filter options for dropdowns
    const filterOptions = await User.aggregate([
      { $group: { _id: '$accessType' } },
      { $sort: { _id: 1 } }
    ]);

    const roleOptions = await User.aggregate([
      { $group: { _id: '$role' } },
      { $sort: { _id: 1 } }
    ]);

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      stats: stats[0] || {
        totalLogins: 0,
        totalViews: 0,
        avgSessionTime: 0,
        totalSessionTime: 0,
        activeUsers: 0,
        premiumUsers: 0,
        freeUsers: 0
      },
      filterOptions: {
        accessTypes: filterOptions.map(opt => opt._id).filter(Boolean),
        roles: roleOptions.map(opt => opt._id).filter(Boolean)
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
  // Check admin authentication
  const authCheck = await checkAdminAuth(request);
  if (!authCheck.authenticated) {
    return NextResponse.json(
      { error: 'Unauthorized access' },
      { status: 401 }
    );
  }

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
  // Check admin authentication
  const authCheck = await checkAdminAuth(request);
  if (!authCheck.authenticated) {
    return NextResponse.json(
      { error: 'Unauthorized access' },
      { status: 401 }
    );
  }

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
