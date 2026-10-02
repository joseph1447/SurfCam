import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TwitchShort from '@/models/TwitchShort';
import { getAppToken, getUserToken, getLiveStream, createClip, waitForClip, downloadClip } from '@/lib/twitch';
import { composeShort, uploadShort, surfCheckMeta, musicTracks, trackName, type Privacy } from '@/lib/shorts';
import { getSurfReport } from '@/lib/conditions';
import { renderOverlay, HOOKS } from '@/lib/short-overlay';
import { analyzeBuffer, recordClipScore, thumbnailVideo } from '@/lib/thumb-pipeline';
import { publishReel } from '@/lib/instagram';
import { reelCaption } from '@/lib/copy';

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
      const source = await downloadClip(clipId);
      const vertical = composeShort(source, overlay, music);
      const meta = surfCheckMeta(clip.url, privacy, report, music, 'short', at);
      const shortVideoId = await uploadShort(vertical, meta);

      record.shortVideoId = shortVideoId;
      record.title = meta.title;
      record.status = 'completed';
      await record.save();

      // The thumbnail is cut from the 16:9 source (sharper and wider than the vertical crop).
      // It's a bonus on top of a Short that's already live, so a failure here is only logged.
      let thumbnail: unknown = null;
      try {
        const analysis = analyzeBuffer(source);
        await recordClipScore({ clipId, clipUrl: clip.url, source: 'short', analysis, at });
        thumbnail = await thumbnailVideo({
          videoId: shortVideoId, kind: 'short', clipId, clip: source, analysis, report, at, title: meta.title, reason: 'upload',
        });
      } catch (err) {
        thumbnail = { error: err instanceof Error ? err.message : String(err) };
        console.error('⚠️ Thumbnail failed:', thumbnail);
      }

      const url = `https://youtube.com/shorts/${shortVideoId}`;
      console.log(`✅ ${url}`);

      // Same MP4 as the Short, cross-posted as a Reel on @eltrillo_santateresa, pointing
      // back at the channel. Public Shorts only, and never fatal for the Short itself.
      let instagram: unknown = null;
      if (privacy === 'public' && request.nextUrl.searchParams.get('instagram') !== 'off') {
        try {
          const reel = await publishReel({
            video: vertical,
            caption: reelCaption({ kind: 'short', report, at, youtubeUrl: url }),
            name: `short-${shortVideoId}`,
          });
          record.instagram = reel;
          instagram = reel;
          console.log(`📸 ${reel.permalink}`);
        } catch (err) {
          record.instagramError = err instanceof Error ? err.message : String(err);
          instagram = { error: record.instagramError };
          console.error('⚠️ Instagram failed:', record.instagramError);
        }
        await record.save();
      }

      return NextResponse.json({ status: 'completed', clipId, clipUrl: clip.url, shortVideoId, url, privacy, hook, music: record.music, report, thumbnail, instagram });
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
