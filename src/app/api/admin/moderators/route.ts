import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Obtener todos los moderadores
    const moderators = await User.find({ role: 'moderator' })
      .select('email username role createdAt lastLogin isActive')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, moderators });
  } catch (error) {
    console.error('Error fetching moderators:', error);
    return NextResponse.json(
      { error: 'Failed to fetch moderators' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, action } = await req.json();
    
    if (!email || !action) {
      return NextResponse.json(
        { error: 'Email and action are required' },
        { status: 400 }
      );
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    if (action === 'promote') {
      user.role = 'moderator';
    } else if (action === 'demote') {
      user.role = 'user';
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
    
    await user.save();
    
    return NextResponse.json({ 
      success: true, 
      message: `User ${action === 'promote' ? 'promoted to' : 'demoted from'} moderator`,
      user: {
        email: user.email,
        role: user.role,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Error managing moderator:', error);
    return NextResponse.json(
      { error: 'Failed to manage moderator' },
      { status: 500 }
    );
  }
}
