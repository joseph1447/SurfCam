// The evening Short: the day in three moments. It replaced the sunset Short on 2026-10-07
// (that one drew 26 and 66 views against a 192 median for the best wave). Footage comes
// from the clips score-clip and live-thumbnail cut and score through the day, so it runs
// after dark without caring that the cam is in IR by then.
import ClipScore from '@/models/ClipScore';
import { downloadClip } from '@/lib/twitch';
import { crTime, getSurfReport, type SurfReport } from '@/lib/conditions';
import { composeMontage } from '@/lib/shorts';
import { renderOverlay, renderEndCard, renderSponsorCard, type TimelineStop } from '@/lib/short-overlay';
import type { DayMoment } from '@/lib/copy';

// Title case so it holds one line: in caps it wraps and pushes the stops row under the
// sponsors and subscribe cards.
export const DAY_HOOK = 'Resumen del día';

// Costa Rica hours, [from, to).
const WINDOWS = [
  { label: 'MAÑANA', from: 5, to: 10 },
  { label: 'MEDIODÍA', from: 10, to: 14 },
  { label: 'TARDE', from: 14, to: 19 },
];

const crHour = (at: number) => {
  const [h, m] = crTime(at).split(':').map(Number);
  return h + m / 60;
};

export interface PickedMoment extends DayMoment {
  clipId: string;
  clipUrl?: string;
  score: number;
  focusS: number;
}

// Best-scoring clip in each window. Clips already on the channel are left out: the best
// wave of the day (usedForBest) and the Shorts' own sources, so no footage repeats.
export async function pickMoments(day: string): Promise<Omit<PickedMoment, 'report'>[]> {
  const rows = (await ClipScore.find({ day, score: { $ne: null }, source: { $ne: 'short' }, usedForBest: false })
    .sort({ score: -1 })
    .lean()) as unknown as { clipId: string; clipUrl?: string; score: number; bestT?: number; createdAt: Date }[];
  return WINDOWS.flatMap((w) => {
    const r = rows.find((row) => {
      const h = crHour(row.createdAt.getTime());
      return h >= w.from && h < w.to;
    });
    return r ? [{ label: w.label, at: r.createdAt.getTime(), clipId: r.clipId, clipUrl: r.clipUrl, score: r.score, focusS: r.bestT ?? 15 }] : [];
  });
}

export async function buildDaySummary(picks: Omit<PickedMoment, 'report'>[], music: string | null) {
  const [sources, reports] = await Promise.all([
    Promise.all(picks.map((p) => downloadClip(p.clipId))),
    Promise.all(picks.map((p) => getSurfReport(p.at).catch((): SurfReport | null => null))),
  ]);
  const moments: PickedMoment[] = picks.map((p, i) => ({ ...p, report: reports[i] }));
  const stops: TimelineStop[] = moments.map((m) => ({ label: m.label, at: m.at }));
  const [overlays, sponsorCard, subscribeCard] = await Promise.all([
    Promise.all(moments.map((m, i) => renderOverlay({ hook: DAY_HOOK, at: m.at, report: m.report, timeline: { stops, current: i } }))),
    renderSponsorCard(),
    renderEndCard('day'),
  ]);
  const video = composeMontage(
    moments.map((m, i) => ({ clip: sources[i], overlay: overlays[i], focusS: m.focusS })),
    music,
    { intro: sponsorCard, outro: subscribeCard },
  );
  // The thumbnail comes from the moment with the most action.
  const top = moments.reduce((a, m, i) => (m.score > moments[a].score ? i : a), 0);
  return { video, moments, top: { moment: moments[top], source: sources[top] } };
}
