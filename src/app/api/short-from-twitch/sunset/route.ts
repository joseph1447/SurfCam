import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TwitchShort from '@/models/TwitchShort';
import { cronAuthorized } from '@/lib/cron';
import { getAppToken, recentArchives, vodSegments, segmentHead, downloadSegments, vodLink, type VodSegment } from '@/lib/twitch';
import { frameColor } from '@/lib/frames';
import { getSurfReport, sunsetAt, crDate, crTime } from '@/lib/conditions';
import { tsToMp4, trackName, type Privacy } from '@/lib/shorts';
import { slotPlan, finishShort } from '@/lib/short-publish';

export const maxDuration = 300;

// The evening Short, cut from the Twitch VOD at the most colourful moment around sunset.
// No fixed hour works: in the VOD for 2026-10-02..05 the cam dropped to black-and-white IR
// anywhere from 0 to 17 min after sunset depending on cloud, and the best light (a pink glow
// on 10-03) came 7-9 min after sunset. So this waits until the light is gone and looks back:
// one frame a minute from 20 min before to 25 min after sunset, then every 10 s segment
// around the best minute, and it publishes the most colourful 30 s that stays out of IR.
// vercel.json ticks it every 5 min across the year's sunsets; the first tick past
// sunset + 25 min runs and the later ones find today's record.
const BEFORE_MS = 20 * 60_000;
const AFTER_MS = 25 * 60_000;
const CLIP_SEGMENTS = 3; // 30 s, the length of the live Twitch clips
const NIGHT_SAT_PCT = 3.5; // same cut as the thumbnail scorer's IR check

type Color = { warmPct: number; satPct: number };
const colorScore = (c: Color) => c.warmPct + c.satPct;
const isNight = (c: Color) => c.satPct < NIGHT_SAT_PCT;

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
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

async function findSunsetClip(start: number, end: number) {
  const appToken = await getAppToken();
  const archives = (await recentArchives(appToken, 4)).filter(
    (a) => a.createdAt <= end && a.createdAt + a.durationS * 1000 >= start,
  );
  const segs = (await Promise.all(archives.map((a) => vodSegments(a.id))))
    .flat()
    .filter((s) => s.at >= start && s.at <= end)
    .sort((a, b) => a.at - b.at);
  if (!segs.length) return null;

  const colors = new Map<VodSegment, Color | null>();
  const measure = (list: VodSegment[]) =>
    mapLimit(list.filter((s) => !colors.has(s)), 8, async (s) => {
      colors.set(s, await segmentHead(s.url).then(frameColor).catch((err) => {
        console.warn(`⚠️ Frame at ${crTime(s.at)} unreadable:`, err instanceof Error ? err.message : err);
        return null;
      }));
    });

  // Coarse pass, one frame a minute.
  await measure(segs.filter((_, i) => i % 6 === 0));
  const score = (i: number) => {
    const c = colors.get(segs[i]);
    return c && !isNight(c) ? colorScore(c) : -1;
  };
  let peak = -1;
  segs.forEach((_, i) => { if (score(i) >= 0 && (peak < 0 || score(i) > score(peak))) peak = i; });
  if (peak < 0) return null;

  // Fine pass, every 10 s segment around the peak. A glow can ramp for minutes past the
  // minute that caught it, so while the best fine frame sits at an edge, widen that way.
  let lo = Math.max(0, peak - 8), hi = Math.min(segs.length - 1, peak + 8);
  for (let step = 0; step < 6; step++) {
    // One past `hi` too, so the last window's follower is known.
    await measure(segs.slice(lo, hi + 2));
    let top = lo;
    for (let i = lo; i <= hi; i++) if (score(i) > score(top)) top = i;
    if (top - lo < 3 && lo > 0) lo = Math.max(0, lo - 8);
    else if (hi - top < 3 && hi < segs.length - 1) hi = Math.min(segs.length - 1, hi + 8);
    else break;
  }

  // Best 30 s inside the measured span: contiguous, all in colour, and not followed by IR,
  // so the clip never runs into the switch.
  let best: { segs: VodSegment[]; score: number } | null = null;
  for (let i = lo; i + CLIP_SEGMENTS - 1 <= hi; i++) {
    const run = segs.slice(i, i + CLIP_SEGMENTS);
    const contiguous = run.every((s, k) => k === 0 || (s.vodId === run[0].vodId && s.index === run[k - 1].index + 1));
    const scores = run.map((_, k) => score(i + k));
    if (!contiguous || scores.some((x) => x < 0)) continue;
    const after = colors.get(segs[i + CLIP_SEGMENTS]);
    if (after && isNight(after)) continue;
    const total = scores.reduce((a, b) => a + b, 0);
    if (!best || total > best.score) best = { segs: run, score: total };
  }
  if (!best) return null;

  const timeline = [...colors]
    .sort((a, b) => a[0].at - b[0].at)
    .map(([s, c]) => `${crTime(s.at)}:${String(Math.round((s.at / 1000) % 60)).padStart(2, '0')} ${c ? `warm ${c.warmPct} sat ${c.satPct}` : 'n/a'}`);
  return { segs: best.segs, colors: best.segs.map((s) => colors.get(s)!), timeline };
}

// ?dry=1 reports the pick without publishing; ?day=YYYY-MM-DD looks at an earlier day while
// its VOD is still up (Twitch keeps them for a few weeks).
export async function GET(request: NextRequest) {
  if (!cronAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const params = request.nextUrl.searchParams;
  const privacyParam = params.get('privacy');
  const privacy: Privacy = privacyParam === 'unlisted' || privacyParam === 'private' ? privacyParam : 'public';
  const dry = params.get('dry') === '1';
  const day = params.get('day');

  try {
    const now = Date.now();
    const sunset = sunsetAt(day ? Date.parse(`${day}T12:00:00-06:00`) : now);
    if (now < sunset + AFTER_MS) {
      return NextResponse.json({ status: 'skipped', reason: `runs after ${crTime(sunset + AFTER_MS)} CR (sunset ${crTime(sunset)})` });
    }
    await connectDB();
    const startOfDay = new Date(`${crDate(sunset)}T00:00:00-06:00`);
    if (!dry && !day && (await TwitchShort.exists({ slot: 'sunset', createdAt: { $gte: startOfDay } }))) {
      return NextResponse.json({ status: 'skipped', reason: 'sunset Short already made today' });
    }

    const pick = await findSunsetClip(sunset - BEFORE_MS, sunset + AFTER_MS);
    if (!pick) return NextResponse.json({ status: 'skipped', reason: 'no colour frames in the VOD around sunset' });
    const first = pick.segs[0];
    const at = first.at;
    const clipId = `vod-${first.vodId}-${first.index}`;
    const clipUrl = vodLink(first);
    console.log(`🌅 Sunset pick ${crTime(at)} CR (sunset ${crTime(sunset)}):`, pick.colors);
    if (dry) {
      return NextResponse.json({ status: 'dry', sunset: crTime(sunset), pick: crTime(at), clipUrl, colors: pick.colors, timeline: pick.timeline });
    }

    const reportPromise = getSurfReport(at).catch((err) => {
      console.error('⚠️ Surf report unavailable:', err instanceof Error ? err.message : err);
      return null;
    });
    const { hook, music } = slotPlan(at, params.get('music'));
    const record = await TwitchShort.create({ clipId, clipUrl, status: 'processing', hook, music: music && trackName(music), slot: 'sunset' });

    try {
      const source = tsToMp4(await downloadSegments(pick.segs.map((s) => s.url)));
      const result = await finishShort({
        record, source, clipId, clipUrl, at, report: await reportPromise, hook, music, privacy,
        instagram: params.get('instagram') !== 'off',
      });
      return NextResponse.json({
        status: 'completed', sunset: crTime(sunset), pick: crTime(at), colors: pick.colors, clipId, clipUrl, privacy, hook, music: record.music, ...result,
      });
    } catch (err) {
      record.status = 'failed';
      record.error = err instanceof Error ? err.message : String(err);
      await record.save();
      throw err;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ sunset short:', message);
    return NextResponse.json({ status: 'failed', error: message }, { status: message.includes('quotaExceeded') ? 429 : 500 });
  }
}
