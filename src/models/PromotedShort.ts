import mongoose, { Document, Schema } from 'mongoose';

export interface PromotedShort extends Document {
  originalVideoId: string;
  shortVideoId: string;
  originalTitle: string;
  shortTitle: string;
  viewsAtPromotion: number;
  twitchClipUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const promotedShortSchema = new Schema<PromotedShort>({
  originalVideoId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  shortVideoId: {
    type: String,
    trim: true,
  },
  originalTitle: {
    type: String,
    trim: true,
  },
  shortTitle: {
    type: String,
    trim: true,
  },
  viewsAtPromotion: {
    type: Number,
    default: 0,
  },
  twitchClipUrl: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  error: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

promotedShortSchema.index({ originalVideoId: 1 });
promotedShortSchema.index({ status: 1 });

export default mongoose.models.PromotedShort || mongoose.model<PromotedShort>('PromotedShort', promotedShortSchema);
