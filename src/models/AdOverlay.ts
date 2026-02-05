import mongoose, { Document, Schema } from 'mongoose';
import connectDB from '@/lib/mongodb';

export interface AdOverlay extends Document {
  logoUrl: string;
  text: string;
  redirectUrl: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  clickCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const adOverlaySchema = new Schema<AdOverlay>({
  logoUrl: {
    type: String,
    required: true,
    trim: true
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  redirectUrl: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    enum: ['bottom-right', 'bottom-left', 'top-right', 'top-left'],
    default: 'bottom-right'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  clickCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better performance
adOverlaySchema.index({ isActive: 1, startDate: 1, endDate: 1 });
adOverlaySchema.index({ position: 1 });

export default mongoose.models.AdOverlay || mongoose.model<AdOverlay>('AdOverlay', adOverlaySchema);
