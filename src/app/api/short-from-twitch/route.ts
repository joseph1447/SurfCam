import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TwitchShort from '@/models/TwitchShort';
import { getAppToken, getUserToken, getLiveStream, createClip, waitForClip, downloadClip } from '@/lib/twitch';
import { cropToVertical, uploadShort, surfCheckMeta, type Privacy } from '@/lib/shorts';

const CRON_SECRET = process.env.CRON_SECRET;

// Clip creation → Twitch processing (~15s) → download → ffmpeg → YouTube upload.
// Comfortably under a minute in practice; the headroom is for a slow Twitch encode.
export const maxDuration = 120;

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

    const clipId = await createClip(await getUserToken());
    console.log(`🎬 Clip created: ${clipId}`);

    await connectDB();
    const record = await TwitchShort.create({ clipId, status: 'processing' });

    try {
      const clip = await waitForClip(appToken, clipId);
      record.clipUrl = clip.url;

      const vertical = cropToVertical(await downloadClip(clipId));
      const meta = surfCheckMeta(clip.url, privacy);
      const shortVideoId = await uploadShort(vertical, meta);

      record.shortVideoId = shortVideoId;
      record.title = meta.title;
      record.status = 'completed';
      await record.save();

      const url = `https://youtube.com/shorts/${shortVideoId}`;
      console.log(`✅ ${url}`);
      return NextResponse.json({ status: 'completed', clipId, clipUrl: clip.url, shortVideoId, url, privacy });
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
