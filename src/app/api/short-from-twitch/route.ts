import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TwitchShort from '@/models/TwitchShort';
import { getAppToken, getUserToken, getLiveStream, createClip, waitForClip, downloadClip } from '@/lib/twitch';
import { trackName, type Privacy } from '@/lib/shorts';
import { getSurfReport } from '@/lib/conditions';
import { slotPlan, finishShort } from '@/lib/short-publish';

const CRON_SECRET = process.env.CRON_SECRET;

// Clip creation → Twitch processing (up to 45s) → download (retries up to ~18s) →
// ffmpeg (up to 120s on Vercel's CPU) → YouTube upload. Runs once a day, so the
// generous ceiling costs nothing unless a step is actually slow.
export const maxDuration = 300;

// Cuts a fresh clip from the live Twitch stream and uploads it straight to YouTube as a
// vertical Short. Scheduled from vercel.json at 7:00am Costa Rica; the evening Short is
// ./sunset, cut from the VOD at the best light. Replaces the create-clip → promote-to-shorts
// chain, which needed two uploads and a views threshold.
export async function GET(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
  if (!isLocalhost && CRON_SECRET) {
    const authorized =
      request.headers.get('authorization') === `Bearer ${CRON_SECRET}` ||
      request.headers.get('x-vercel-cron') !== null;
    if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const privacyParam = request.nextUrl.searchParams.get('privacy');
  const privacy: Privacy =
    privacyParam === 'unlisted' || privacyParam === 'private' ? privacyParam : 'public';

  try {
    const appToken = await getAppToken();
    const stream = await getLiveStream(appToken);
    if (!stream) {
      // Expected outside the 5am-7pm CR window, when restream-toggle has the feed off.
      return NextResponse.json({ status: 'skipped', reason: 'Twitch stream is not live' });
    }

    const at = Date.now();
    const clipId = await createClip(await getUserToken());
    console.log(`🎬 Clip created: ${clipId}`);

    // A forecast outage shouldn't cost the Short: it just goes out without the data card.
    const reportPromise = getSurfReport(at).catch((err) => {
      console.error('⚠️ Surf report unavailable:', err instanceof Error ? err.message : err);
      return null;
    });
    const { hook, music } = slotPlan(at, request.nextUrl.searchParams.get('music'));

    await connectDB();
    const record = await TwitchShort.create({ clipId, status: 'processing', hook, music: music && trackName(music) });

    try {
      const clip = await waitForClip(appToken, clipId);
      const source = await downloadClip(clipId);
      const result = await finishShort({
        record, source, clipId, clipUrl: clip.url, at, report: await reportPromise, hook, music, privacy,
        instagram: request.nextUrl.searchParams.get('instagram') !== 'off',
      });
      return NextResponse.json({ status: 'completed', clipId, clipUrl: clip.url, privacy, hook, music: record.music, report: record.report, ...result });
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
