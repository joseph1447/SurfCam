import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import WaveReport from '@/models/WaveReport';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Obtener el reporte más reciente activo
    const latestReport = await WaveReport.findOne({ isActive: true })
      .populate('reportedBy', 'email username')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, report: latestReport });
  } catch (error) {
    console.error('Error fetching wave report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wave report' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { waveHeight, notes, userId } = await req.json();
    
    if (!waveHeight || !userId) {
      return NextResponse.json(
        { error: 'Wave height and user ID are required' },
        { status: 400 }
      );
    }
    
    // Verificar que el usuario existe y tiene permisos
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    if (!['moderator', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    // Desactivar reportes anteriores
    await WaveReport.updateMany(
      { isActive: true },
      { isActive: false }
    );
    
    // Crear nuevo reporte
    const newReport = new WaveReport({
      waveHeight,
      reportedBy: userId,
      reporterName: user.username || user.email,
      notes: notes || ''
    });
    
    await newReport.save();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Wave report created successfully',
      report: newReport
    });
  } catch (error) {
    console.error('Error creating wave report:', error);
    return NextResponse.json(
      { error: 'Failed to create wave report' },
      { status: 500 }
    );
  }
}
