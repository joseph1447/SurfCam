import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TwitchShort from '@/models/TwitchShort';
import { getAppToken, getUserToken, getLiveStream, createClip, waitForClip, downloadClip, downloadSegments, vodLink } from '@/lib/twitch';
import { trackName, tsToMp4, type Privacy } from '@/lib/shorts';
import { getSurfReport, crTime } from '@/lib/conditions';
import { slotPlan, finishShort, openOnWave } from '@/lib/short-publish';
import { analyzeBuffer } from '@/lib/thumb-pipeline';
import { findActionClip } from '@/lib/vod-pick';

const CRON_SECRET = process.env.CRON_SECRET;

// VOD scan (~30 s) → download 40 s → ffmpeg (up to 120 s on Vercel's CPU) → YouTube
// upload. Runs once a day, so the generous ceiling costs nothing unless a step is slow.
export const maxDuration = 300;

// How far back the morning Short looks for its footage, and how long it runs.
const LOOKBACK_MS = 45 * 60_000;
const SHORT_S = 30;

// The 7am Short (vercel.json). Since 2026-10-23 it no longer clips whatever is live at
// 7:00: it scans the last 45 min of the Twitch VOD for the 30 s with the most breaking
// waves and opens ~3 s before the best one. If the VOD can't be read it falls back to a
// live clip. ?dry=1 reports the pick without publishing; ?source=live forces the old path.
export async function GET(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
  if (!isLocalhost && CRON_SECRET) {
    const authorized =
      request.headers.get('authorization') === `Bearer ${CRON_SECRET}` ||
      request.headers.get('x-vercel-cron') !== null;
    if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const privacyParam = params.get('privacy');
  const privacy: Privacy = privacyParam === 'unlisted' || privacyParam === 'private' ? privacyParam : 'public';
  const dry = params.get('dry') === '1';

  try {
    const now = Date.now();
    const pick =
      params.get('source') === 'live'
        ? null
        : await findActionClip(now - LOOKBACK_MS, now - 15_000).catch((err) => {
            console.error('⚠️ VOD scan failed, falling back to a live clip:', err instanceof Error ? err.message : err);
            return null;
          });
    if (dry) {
      return NextResponse.json({
        status: 'dry',
        pick: pick && { from: crTime(pick.segs[0].at), to: crTime(pick.segs.at(-1)!.at), foam: pick.foam, clipUrl: vodLink(pick.segs[0]) },
        timeline: pick?.timeline,
      });
    }

    let source: Buffer, clipId: string, clipUrl: string, at: number;
    if (pick) {
      const first = pick.segs[0];
      clipId = `vod-${first.vodId}-${first.index}`;
      clipUrl = vodLink(first);
      at = first.at;
      source = tsToMp4(await downloadSegments(pick.segs.map((s) => s.url)));
    } else {
      const appToken = await getAppToken();
      if (!(await getLiveStream(appToken))) {
        // Expected outside the 5am-7pm CR window, when restream-toggle has the feed off.
        return NextResponse.json({ status: 'skipped', reason: 'no VOD pick and the Twitch stream is not live' });
      }
      at = Date.now();
      clipId = await createClip(await getUserToken());
      clipUrl = (await waitForClip(appToken, clipId)).url;
      source = await downloadClip(clipId);
    }

    const analysis = analyzeBuffer(source);
    const startS = openOnWave(analysis, pick ? SHORT_S : 20);
    at += startS * 1000;
    console.log(`🎬 ${pick ? 'VOD pick' : 'Live clip'} ${clipId}, opening at +${startS}s (${crTime(at)} CR)`);

    // A forecast outage shouldn't cost the Short: it just goes out without the data card.
    const report = await getSurfReport(at).catch((err) => {
      console.error('⚠️ Surf report unavailable:', err instanceof Error ? err.message : err);
      return null;
    });
    const { hook, music } = slotPlan(at, params.get('music'));

    await connectDB();
    const record = await TwitchShort.create({ clipId, clipUrl, status: 'processing', hook, music: music && trackName(music) });
    try {
      const result = await finishShort({
        record, source, clipId, clipUrl, at, report, hook, music, privacy, analysis, startS, maxS: SHORT_S,
        instagram: params.get('instagram') !== 'off',
      });
      return NextResponse.json({ status: 'completed', clipId, clipUrl, startS, privacy, hook, music: record.music, report: record.report, ...result });
    } catch (err) {
      record.status = 'failed';
      record.error = err instanceof Error ? err.message : String(err);
      await record.save();
      throw err;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ short-from-twitch:', message);
    const status = message.includes('quotaExceeded') ? 429 : 500;
    return NextResponse.json({ status: 'failed', error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
