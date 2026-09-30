// Which thumbnail style the next upload gets. Round-robin until a style has 20 measured
// videos; from then the best click-through rate takes 70% and the others share 30%.
import ThumbnailTest, { type ThumbKind } from '@/models/ThumbnailTest';
import { ROTATING_STYLES, type ThumbStyle } from '@/lib/thumbnail';

const EXPLOIT_AFTER = 20;
// Below this a video's CTR is too noisy to count toward its style.
export const MIN_IMPRESSIONS = 50;

export interface StyleStats {
  style: string;
  videos: number;
  impressions: number;
  ctr: number | null;
}

export async function styleStats(kind: ThumbKind, since?: Date): Promise<StyleStats[]> {
  const rows: { _id: string; videos: number; impressions: number; clicks: number }[] = await ThumbnailTest.aggregate([
    { $match: { kind, impressions: { $gte: MIN_IMPRESSIONS }, ...(since ? { createdAt: { $gte: since } } : {}) } },
    { $group: { _id: '$style', videos: { $sum: 1 }, impressions: { $sum: '$impressions' }, clicks: { $sum: { $multiply: ['$impressions', '$ctr'] } } } },
  ]);
  return ROTATING_STYLES.map((style) => {
    const r = rows.find((x) => x._id === style);
    return { style, videos: r?.videos ?? 0, impressions: r?.impressions ?? 0, ctr: r?.impressions ? r.clicks / r.impressions : null };
  });
}

export async function pickStyle(kind: ThumbKind): Promise<{ style: ThumbStyle; reason: string }> {
  const stats = await styleStats(kind);
  if (stats.some((s) => s.videos >= EXPLOIT_AFTER)) {
    const winner = stats
      .filter((s) => s.ctr != null && s.videos >= 5)
      .sort((a, b) => (b.ctr ?? 0) - (a.ctr ?? 0))[0].style as ThumbStyle;
    if (Math.random() < 0.7) return { style: winner, reason: 'winner-70' };
    const others = ROTATING_STYLES.filter((s) => s !== winner);
    return { style: others[Math.floor(Math.random() * others.length)], reason: 'explore-30' };
  }
  const used: { _id: string; n: number }[] = await ThumbnailTest.aggregate([
    { $match: { kind } },
    { $group: { _id: '$style', n: { $sum: 1 } } },
  ]);
  const n = (s: string) => used.find((u) => u._id === s)?.n ?? 0;
  return { style: [...ROTATING_STYLES].sort((a, b) => n(a) - n(b))[0], reason: 'rotation' };
}
