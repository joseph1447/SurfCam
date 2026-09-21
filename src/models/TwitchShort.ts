import mongoose, { Document, Schema } from 'mongoose';

export interface TwitchShort extends Document {
  clipId: string;
  clipUrl: string;
  shortVideoId?: string;
  title?: string;
  status: 'processing' | 'completed' | 'failed' | 'skipped';
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const twitchShortSchema = new Schema<TwitchShort>({
  clipId: { type: String, required: true, unique: true, trim: true },
  clipUrl: { type: String, trim: true },
  shortVideoId: { type: String, trim: true },
  title: { type: String, trim: true },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed', 'skipped'],
    default: 'processing',
  },
  error: { type: String, trim: true },
}, {
  timestamps: true,
});

export default mongoose.models.TwitchShort || mongoose.model<TwitchShort>('TwitchShort', twitchShortSchema);
