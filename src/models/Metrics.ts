import mongoose from 'mongoose';

const metricsSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  activeUsers: {
    type: Number,
    default: 0
  },
  freeUsers: {
    type: Number,
    default: 0
  },
  premiumUsers: {
    type: Number,
    default: 0
  },
  totalViews: {
    type: Number,
    default: 0
  },
  // Métricas por hora
  hourlyStats: {
    views: {
      type: Number,
      default: 0
    },
    uniqueUsers: {
      type: Number,
      default: 0
    }
  },
  // Métricas por día
  dailyStats: {
    views: {
      type: Number,
      default: 0
    },
    uniqueUsers: {
      type: Number,
      default: 0
    },
    newUsers: {
      type: Number,
      default: 0
    },
    premiumConversions: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Índices para consultas eficientes
metricsSchema.index({ timestamp: 1 });
metricsSchema.index({ createdAt: 1 });

export default mongoose.models.Metrics || mongoose.model('Metrics', metricsSchema);
