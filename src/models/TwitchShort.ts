import mongoose, { Document, Schema } from 'mongoose';

export interface TwitchShort extends Document {
  clipId: string;
  clipUrl: string;
  shortVideoId?: string;
  title?: string;
  status: 'processing' | 'completed' | 'failed' | 'skipped';
  error?: string;
  // What the Short carried, for comparing hooks / music on vs off in YouTube Analytics.
  hook?: string;
  music?: string | null;
  // 'day' for the evening day summary, 'sunset' for the old sunset run (retired
  // 2026-10-07); unset for the morning and best-wave ones.
  slot?: string;
  report?: Record<string, unknown> | null;
  // Instagram Reel on @eltrillo_santateresa, when the cross-post succeeded.
  instagram?: { mediaId: string; permalink: string } | null;
  instagramError?: string;
  instagramStory?: { mediaId: string; permalink: string } | null;
  instagramStoryError?: string;
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
  hook: { type: String, trim: true },
  music: { type: String, default: null },
  slot: { type: String, trim: true },
  report: { type: Schema.Types.Mixed, default: null },
  instagram: { type: new Schema({ mediaId: String, permalink: String }, { _id: false }), default: null },
  instagramError: { type: String, trim: true },
  instagramStory: { type: new Schema({ mediaId: String, permalink: String }, { _id: false }), default: null },
  instagramStoryError: { type: String, trim: true },
}, {
  timestamps: true,
});

export default mongoose.models.TwitchShort || mongoose.model<TwitchShort>('TwitchShort', twitchShortSchema);
