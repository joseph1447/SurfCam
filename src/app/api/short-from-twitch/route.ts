import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TwitchShort from '@/models/TwitchShort';
import { getAppToken, getUserToken, getLiveStream, createClip, waitForClip, downloadClip } from '@/lib/twitch';
import { composeShort, uploadShort, surfCheckMeta, musicTracks, trackName, type Privacy } from '@/lib/shorts';
import { getSurfReport } from '@/lib/conditions';
import { renderOverlay, HOOKS } from '@/lib/short-overlay';

const CRON_SECRET = process.env.CRON_SECRET;

// Two uploads a day. Music alternates daily within each slot (so it isn't confounded with
// morning vs evening light), and hooks cycle through every slot.
function slotPlan(at: number, musicParam: string | null) {
  const crDay = Math.floor((at - 6 * 3_600_000) / 86_400_000);
  const evening = new Date(at - 6 * 3_600_000).getUTCHours() >= 12 ? 1 : 0;
  const tracks = musicTracks();
  const wantMusic = musicParam ? musicParam === 'on' : (crDay + evening) % 2 === 0;
  return {
    hook: HOOKS[(crDay * 2 + evening) % HOOKS.length],
    music: wantMusic && tracks.length ? tracks[Math.floor(Math.random() * tracks.length)] : null,
  };
}

// Clip creation → Twitch processing (up to 45s) → download (retries up to ~18s) →
// ffmpeg (up to 120s on Vercel's CPU) → YouTube upload. Runs twice a day, so the
// generous ceiling costs nothing unless a step is actually slow.
export const maxDuration = 300;

// Cuts a fresh clip from the live Twitch stream and uploads it straight to YouTube as a
// vertical Short. Scheduled from vercel.json at 7:00am and 5:46pm Costa Rica. Replaces the
// create-clip → promote-to-shorts chain, which needed two uploads and a views threshold.
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
      record.clipUrl = clip.url;

      const report = await reportPromise;
      record.report = report;
      const overlay = await renderOverlay({ hook, at, report });
      const vertical = composeShort(await downloadClip(clipId), overlay, music);
      const meta = surfCheckMeta(clip.url, privacy, report, music);
      const shortVideoId = await uploadShort(vertical, meta);

      record.shortVideoId = shortVideoId;
      record.title = meta.title;
      record.status = 'completed';
      await record.save();

      const url = `https://youtube.com/shorts/${shortVideoId}`;
      console.log(`✅ ${url}`);
      return NextResponse.json({ status: 'completed', clipId, clipUrl: clip.url, shortVideoId, url, privacy, hook, music: record.music, report });
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
