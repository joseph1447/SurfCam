import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Metrics from '@/models/Metrics';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const analysisType = searchParams.get('analysis');
    
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

    // Usuarios premium activos (simplificado - solo contar por accessType)
    const activePremiumUsers = await User.countDocuments({
      accessType: 'premium',
      isActive: true
    });

    // Total de vistas
    const totalViews = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$totalViews' } } }
    ]);

    // Total de logins
    const totalLogins = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$loginCount' } } }
    ]);

         // Métricas por día (últimos 7 días)
     const last7Days = [];
     for (let i = 6; i >= 0; i--) {
       const date = new Date();
       date.setDate(date.getDate() - i);
       date.setHours(0, 0, 0, 0);
       
       const nextDate = new Date(date);
       nextDate.setDate(nextDate.getDate() + 1);
       
       // Para cada día, contar logins de ese día específico
       const dayMetrics = await User.aggregate([
         {
           $match: {
             lastLogin: { $gte: date, $lt: nextDate },
             isActive: true
           }
         },
         {
           $group: {
             _id: null,
             activeUsers: { $sum: 1 },
             totalLogins: { $sum: 1 } // Cada usuario activo en ese día cuenta como 1 login
           }
         }
       ]);
       
       // Para las vistas de hoy, contar los logins de hoy
       let viewsToday = 0;
       if (i === 0) { // Si es hoy
         const todayLogins = await User.countDocuments({
           lastLogin: { $gte: date, $lt: nextDate },
           isActive: true
         });
         viewsToday = todayLogins;
       }
       
       last7Days.push({
         date: date.toISOString().split('T')[0],
         activeUsers: dayMetrics[0]?.activeUsers || 0,
         totalViews: i === 0 ? viewsToday : (dayMetrics[0]?.totalLogins || 0), // Vistas de hoy = logins de hoy
         totalLogins: dayMetrics[0]?.totalLogins || 0
       });
     }

    // Análisis detallado de usuarios (si se solicita)
    let userAnalysis = null;
    if (analysisType === 'detailed') {
      // Usuarios más activos (ordenados por loginCount)
      const topUsers = await User.find({ isActive: true })
        .select('email accessType loginCount totalViews lastLogin createdAt')
        .sort({ loginCount: -1 })
        .limit(15)
        .lean();

      // Estadísticas de dispositivos
      const deviceStats = await User.aggregate([
        { $unwind: '$sessionHistory' },
        {
          $group: {
            _id: '$sessionHistory.deviceType',
            count: { $sum: 1 }
          }
        }
      ]);

      // Horarios más populares
      const timeStats = await User.aggregate([
        {
          $group: {
            _id: '$activityStats.preferredLoginTime',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);

      // Días más activos
      const dayStats = await User.aggregate([
        {
          $group: {
            _id: '$activityStats.mostActiveDay',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      userAnalysis = {
        topUsers,
        deviceStats,
        timeStats,
        dayStats
      };
    }

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
        totalLogins: totalLogins[0]?.total || 0,
        dailyMetrics: dailyMetrics.dailyStats,
        last7Days,
        userAnalysis
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
