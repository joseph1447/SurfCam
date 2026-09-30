// Clip → scored frames → styled thumbnail → YouTube, with every choice logged so the
// metrics job can learn which style wins.
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { analyzeClip, type ClipAnalysis } from '@/lib/frames';
import { renderThumbnail, setThumbnail, thumbText, type ThumbStyle } from '@/lib/thumbnail';
import { pickStyle } from '@/lib/experiments';
import { crDate, type SurfReport } from '@/lib/conditions';
import ThumbnailTest, { type ThumbKind } from '@/models/ThumbnailTest';
import ClipScore from '@/models/ClipScore';

export function analyzeBuffer(clip: Buffer): ClipAnalysis {
  const path = join(tmpdir(), `analyze-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.mp4`);
  try {
    writeFileSync(path, clip);
    return analyzeClip(path);
  } finally {
    if (existsSync(path)) unlinkSync(path);
  }
}

export async function recordClipScore(opts: {
  clipId: string;
  clipUrl?: string;
  source: 'score' | 'short' | 'live';
  analysis: ClipAnalysis;
  at: number;
}) {
  const { clipId, clipUrl, source, analysis, at } = opts;
  await ClipScore.updateOne(
    { clipId },
    {
      $setOnInsert: { clipId, day: crDate(at), source },
      $set: { clipUrl, score: analysis.best?.score ?? null, foamPct: analysis.best?.foamPct, bestT: analysis.best?.t },
    },
    { upsert: true },
  );
}

export async function thumbnailVideo(opts: {
  videoId: string;
  kind: ThumbKind;
  clipId: string;
  clip: Buffer;
  analysis?: ClipAnalysis;
  report: SurfReport | null;
  at: number;
  title: string;
  style?: ThumbStyle;
  reason: string;
  // Render only: no upload, no DB write. For checking a run before it touches YouTube.
  dry?: boolean;
}) {
  const { videoId, kind, clipId, clip, report, at, title, reason } = opts;
  const analysis = opts.analysis ?? analyzeBuffer(clip);
  if (!analysis.best) return { skipped: 'no usable frame (dark, IR night mode, rain or blur)' as const };

  const picked = opts.style ? { style: opts.style, reason } : await pickStyle(kind);
  const text = thumbText(picked.style, report, at);
  const jpg = await renderThumbnail({ clip, analysis, style: picked.style, text, orientation: kind === 'live' ? 'landscape' : 'portrait' });
  if (opts.dry) return { dry: true as const, style: picked.style, text, jpg, frameT: analysis.best.t, score: analysis.best.score };
  await setThumbnail(videoId, jpg);

  const textLabel = text.sub ? `${text.headline} / ${text.sub}` : text.headline;
  const existing = await ThumbnailTest.findOne({ videoId });
  const entry = { style: picked.style, text: textLabel, at: new Date(at), reason: picked.reason };
  const fields = {
    kind,
    style: picked.style,
    text: textLabel,
    title,
    clipId,
    frameT: analysis.best.t,
    frameScore: analysis.best.score,
    crop: picked.style === 'C' ? analysis.mediumCrop : analysis.zoomCrop,
    report,
  };
  if (existing) {
    Object.assign(existing, fields, { generation: existing.generation + 1 });
    existing.history.push(entry);
    await existing.save();
  } else {
    await ThumbnailTest.create({ videoId, ...fields, generation: 1, history: [entry] });
  }
  return { style: picked.style, text: textLabel, bytes: jpg.length, frameT: analysis.best.t, score: analysis.best.score };
}
