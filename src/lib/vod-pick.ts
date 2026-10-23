// Picks footage after the fact from the Twitch VOD instead of clipping whatever is live.
// The 7am Short used to take the 30 s that happened to be on air at 7:00, flat or not, and
// held 51% of a view against 66% for the best-wave Short, which is picked by action.
import { getAppToken, recentArchives, vodSegments, segmentHead, type VodSegment } from '@/lib/twitch';
import { frameAction } from '@/lib/frames';
import { crTime } from '@/lib/conditions';

export async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]);
      }
    }),
  );
  return out;
}

// Every 10 s segment of the VODs that overlap [start, end], in time order.
export async function vodWindow(start: number, end: number): Promise<VodSegment[]> {
  const appToken = await getAppToken();
  const archives = (await recentArchives(appToken, 4)).filter(
    (a) => a.createdAt <= end && a.createdAt + a.durationS * 1000 >= start,
  );
  return (await Promise.all(archives.map((a) => vodSegments(a.id))))
    .flat()
    .filter((s) => s.at >= start && s.at <= end)
    .sort((a, b) => a.at - b.at);
}

const contiguous = (run: VodSegment[]) =>
  run.every((s, k) => k === 0 || (s.vodId === run[0].vodId && s.index === run[k - 1].index + 1));

// The `count` contiguous segments with the most foam between start and end, plus `lead`
// segments before them so the cut can open a few seconds ahead of the break. One frame per
// segment head (~1 MB of ~8): a coarse pass every 30 s, then every segment around the three
// busiest spots.
export async function findActionClip(start: number, end: number, count = 3, lead = 1) {
  const segs = await vodWindow(start, end);
  if (segs.length < count) return null;

  const foam = new Map<VodSegment, number>(); // -1 = unusable (dark, IR, fog) or unreadable
  const measure = (list: VodSegment[]) =>
    mapLimit(list.filter((s) => !foam.has(s)), 8, async (s) => {
      const a = await segmentHead(s.url).then(frameAction).catch(() => null);
      foam.set(s, a?.usable ? a.foamPct : -1);
    });
  const at = (i: number) => foam.get(segs[i]) ?? -1;

  await measure(segs.filter((_, i) => i % 3 === 0));
  const peaks = segs
    .map((_, i) => i)
    .filter((i) => at(i) >= 0)
    .sort((a, b) => at(b) - at(a))
    .slice(0, 3);
  if (!peaks.length) return null;
  await measure(peaks.flatMap((p) => segs.slice(Math.max(0, p - 3), p + 4)));

  let best: { i: number; score: number } | null = null;
  for (let i = 0; i + count <= segs.length; i++) {
    const run = segs.slice(i, i + count);
    const scores = run.map((_, k) => at(i + k));
    if (!contiguous(run) || scores.some((x) => x < 0)) continue;
    const score = scores.reduce((a, b) => a + b, 0);
    if (!best || score > best.score) best = { i, score };
  }
  if (!best) return null;

  let from = best.i;
  while (from > best.i - lead && from > 0 && contiguous([segs[from - 1], segs[from]])) from--;
  const timeline = [...foam]
    .sort((a, b) => a[0].at - b[0].at)
    .map(([s, f]) => `${crTime(s.at)}:${String(Math.round((s.at / 1000) % 60)).padStart(2, '0')} ${f < 0 ? 'n/a' : f}`);
  return { segs: segs.slice(from, best.i + count), foam: best.score, timeline };
}
