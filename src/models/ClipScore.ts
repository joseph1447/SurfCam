import mongoose, { Document, Schema } from 'mongoose';

// Action score of every clip cut during the day, so the evening job can pick the best wave.
export interface ClipScore extends Document {
  clipId: string;
  clipUrl?: string;
  day: string; // Costa Rica calendar date
  source: 'score' | 'short' | 'live';
  score: number | null; // null when every frame was rejected (dark, IR, rain)
  foamPct?: number;
  bestT?: number;
  usedForBest?: boolean;
  createdAt: Date;
}

const schema = new Schema<ClipScore>(
  {
    clipId: { type: String, required: true, unique: true, trim: true },
    clipUrl: String,
    day: { type: String, required: true, index: true },
    source: { type: String, enum: ['score', 'short', 'live'], required: true },
    score: { type: Number, default: null },
    foamPct: Number,
    bestT: Number,
    usedForBest: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.models.ClipScore || mongoose.model<ClipScore>('ClipScore', schema);
