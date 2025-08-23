import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// PUT - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const updateData = await request.json();
    
    // Validate required fields
    if (!updateData.email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    // Check if email already exists for another user
    const existingUser = await User.findOne({ 
      email: updateData.email.toLowerCase(),
      _id: { $ne: id } // Exclude current user
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'El email ya está en uso por otro usuario' },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        email: updateData.email.toLowerCase(),
        accessType: updateData.accessType,
        role: updateData.role,
        isActive: updateData.isActive,
        ...(updateData.password && { password: updateData.password }) // Only update password if provided
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        _id: updatedUser._id,
        email: updatedUser.email,
        accessType: updatedUser.accessType,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        loginCount: updatedUser.loginCount,
        lastLogin: updatedUser.lastLogin,
        createdAt: updatedUser.createdAt
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    const deletedUser = await User.findByIdAndDelete(id);
    
    if (!deletedUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
