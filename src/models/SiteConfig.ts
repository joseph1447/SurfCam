import mongoose, { Document, Schema } from 'mongoose';
import connectDB from '@/lib/mongodb';

export interface SiteConfig extends Document {
  key: string;
  value: string;
  description?: string;
  updatedAt: Date;
  createdAt: Date;
}

const siteConfigSchema = new Schema<SiteConfig>({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  value: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for faster lookups
siteConfigSchema.index({ key: 1 });

export default mongoose.models.SiteConfig || mongoose.model<SiteConfig>('SiteConfig', siteConfigSchema);
