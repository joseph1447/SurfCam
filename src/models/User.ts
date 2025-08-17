import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  plan: {
    type: String,
    enum: ['individual', 'business'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['SINPE', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
  },
  paymentProof: {
    type: String, // URL o referencia al comprobante
    required: false
  }
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  accessType: {
    type: String,
    enum: ['free', 'premium'],
    default: 'free'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscription: {
    type: subscriptionSchema,
    required: false
  },
  // Para usuarios premium, guardamos la contraseña hasheada
  password: {
    type: String,
    required: false
  },
  username: {
    type: String,
    required: false,
    trim: true,
    maxlength: 32,
    unique: false
  },
  // Métricas del usuario
  totalViews: {
    type: Number,
    default: 0
  },
  lastViewDate: {
    type: Date,
    required: false
  },
  // Análisis de comportamiento
  loginCount: {
    type: Number,
    default: 0
  },
  totalSessionTime: {
    type: Number, // en segundos
    default: 0
  },
  averageSessionTime: {
    type: Number, // en segundos
    default: 0
  },
  // Historial de sesiones
  sessionHistory: [{
    loginTime: {
      type: Date,
      required: true
    },
    logoutTime: {
      type: Date,
      required: false
    },
    sessionDuration: {
      type: Number, // en segundos
      default: 0
    },
    userAgent: String,
    ipAddress: String,
    deviceType: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop'],
      default: 'desktop'
    },
    browser: String,
    os: String
  }],
  // Análisis de actividad
  activityStats: {
    firstLogin: {
      type: Date,
      default: Date.now
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    totalDaysActive: {
      type: Number,
      default: 1
    },
    consecutiveDaysActive: {
      type: Number,
      default: 1
    },
    preferredLoginTime: {
      type: String, // hora del día (0-23)
      default: '12'
    },
    mostActiveDay: {
      type: String, // día de la semana (0-6)
      default: '1'
    }
  },
  // Configuración del usuario
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: false
    },
    autoPlay: {
      type: Boolean,
      default: true
    },
    quality: {
      type: String,
      enum: ['auto', '720p', '1080p'],
      default: 'auto'
    }
  }
}, {
  timestamps: true
});

// Índices para mejorar el rendimiento
userSchema.index({ email: 1 });
userSchema.index({ accessType: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ 'subscription.status': 1 });

export default mongoose.models.User || mongoose.model('User', userSchema);
