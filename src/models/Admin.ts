import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'super_admin'],
    default: 'admin'
  },
  password: {
    type: String,
    required: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  permissions: {
    canManageUsers: {
      type: Boolean,
      default: true
    },
    canManageSubscriptions: {
      type: Boolean,
      default: true
    },
    canViewMetrics: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Índices
adminSchema.index({ email: 1 });
adminSchema.index({ role: 1 });

export default mongoose.models.Admin || mongoose.model('Admin', adminSchema);
