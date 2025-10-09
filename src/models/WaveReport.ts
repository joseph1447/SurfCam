import mongoose from 'mongoose';

const waveReportSchema = new mongoose.Schema({
  waveHeight: {
    type: Number, // altura en pies
    required: true,
    min: 0,
    max: 20
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reporterName: {
    type: String,
    required: true
  },
  location: {
    type: String,
    default: 'Santa Teresa'
  },
  notes: {
    type: String,
    maxlength: 500
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para mejorar el rendimiento
waveReportSchema.index({ createdAt: -1 });
waveReportSchema.index({ isActive: 1 });
waveReportSchema.index({ reportedBy: 1 });

export default mongoose.models.WaveReport || mongoose.model('WaveReport', waveReportSchema);
