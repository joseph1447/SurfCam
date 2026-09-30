import mongoose, { Document, Schema } from 'mongoose';

export type ThumbKind = 'short' | 'live' | 'best';

// One row per video: which thumbnail style/text/frame it carries and how it performed.
// Lives are one row per broadcast (a new video id every day) and keep a single style for
// the day, since the reach report only splits by video and day.
export interface ThumbnailTest extends Document {
  videoId: string;
  kind: ThumbKind;
  style: string;
  text: string;
  title: string;
  clipId?: string;
  frameT?: number;
  frameScore?: number;
  crop?: Record<string, number>;
  report?: Record<string, unknown> | null;
  generation: number;
  history: { style: string; text: string; at: Date; reason: string }[];
  // Reach report rows keyed by YYYY-MM-DD: thumbnail impressions and click-through rate.
  daily: Map<string, { impressions: number; ctr: number }>;
  impressions: number;
  ctr: number | null;
  views: number;
  avgViewPct: number | null;
  metricsAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<ThumbnailTest>(
  {
    videoId: { type: String, required: true, unique: true, trim: true },
    kind: { type: String, enum: ['short', 'live', 'best'], required: true },
    style: { type: String, required: true },
    text: { type: String, required: true },
    title: { type: String, required: true },
    clipId: String,
    frameT: Number,
    frameScore: Number,
    crop: Schema.Types.Mixed,
    report: { type: Schema.Types.Mixed, default: null },
    generation: { type: Number, default: 1 },
    history: [{ style: String, text: String, at: Date, reason: String, _id: false }],
    daily: { type: Map, of: new Schema({ impressions: Number, ctr: Number }, { _id: false }), default: {} },
    impressions: { type: Number, default: 0 },
    ctr: { type: Number, default: null },
    views: { type: Number, default: 0 },
    avgViewPct: { type: Number, default: null },
    metricsAt: Date,
  },
  { timestamps: true },
);

schema.index({ kind: 1, style: 1, createdAt: -1 });

export default mongoose.models.ThumbnailTest || mongoose.model<ThumbnailTest>('ThumbnailTest', schema);
