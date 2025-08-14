import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Metrics from '@/models/Metrics';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Obtener métricas en tiempo real
    const totalUsers = await User.countDocuments({ isActive: true });
    const freeUsers = await User.countDocuments({ accessType: 'free', isActive: true });
    const premiumUsers = await User.countDocuments({ accessType: 'premium', isActive: true });
    
    // Usuarios activos en las últimas 24 horas
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: last24Hours },
      isActive: true
    });

    // Nuevos usuarios en las últimas 24 horas
    const newUsers = await User.countDocuments({
      createdAt: { $gte: last24Hours }
    });

    // Usuarios premium activos
    const activePremiumUsers = await User.countDocuments({
      accessType: 'premium',
      isActive: true,
      'subscription.status': 'active',
      'subscription.endDate': { $gte: new Date() }
    });

    // Total de vistas
    const totalViews = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$totalViews' } } }
    ]);

    // Crear o actualizar métricas del día
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let dailyMetrics = await Metrics.findOne({
      timestamp: { $gte: today }
    });

    if (!dailyMetrics) {
      dailyMetrics = new Metrics({
        timestamp: today,
        activeUsers,
        freeUsers,
        premiumUsers,
        totalViews: totalViews[0]?.total || 0,
        dailyStats: {
          views: totalViews[0]?.total || 0,
          uniqueUsers: activeUsers,
          newUsers,
          premiumConversions: 0
        }
      });
    } else {
      dailyMetrics.activeUsers = activeUsers;
      dailyMetrics.freeUsers = freeUsers;
      dailyMetrics.premiumUsers = premiumUsers;
      dailyMetrics.totalViews = totalViews[0]?.total || 0;
      dailyMetrics.dailyStats.views = totalViews[0]?.total || 0;
      dailyMetrics.dailyStats.uniqueUsers = activeUsers;
      dailyMetrics.dailyStats.newUsers = newUsers;
    }

    await dailyMetrics.save();

    return NextResponse.json({
      success: true,
      metrics: {
        totalUsers,
        activeUsers,
        freeUsers,
        premiumUsers,
        activePremiumUsers,
        newUsers,
        totalViews: totalViews[0]?.total || 0,
        dailyMetrics: dailyMetrics.dailyStats
      }
    });

  } catch (error) {
    console.error('Metrics error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
