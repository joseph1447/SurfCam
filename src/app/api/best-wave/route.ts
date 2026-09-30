import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ClipScore from '@/models/ClipScore';
import ThumbnailTest from '@/models/ThumbnailTest';
import TwitchShort from '@/models/TwitchShort';
import { cronAuthorized } from '@/lib/cron';
import { downloadClip } from '@/lib/twitch';
import { composeShort, uploadShort, surfCheckMeta, musicTracks, trackName, type Privacy } from '@/lib/shorts';
import { crDate, getSurfReport } from '@/lib/conditions';
import { renderOverlay } from '@/lib/short-overlay';
import { analyzeBuffer, thumbnailVideo } from '@/lib/thumb-pipeline';

export const maxDuration = 300;

// Once a day, before sunset: the clip with the most action that hasn't been uploaded yet
// becomes a "best wave of the day" Short with its own featured thumbnail. Clips already
// published as the morning/evening Shorts are skipped so the channel never repeats footage.
export async function GET(request: NextRequest) {
  if (!cronAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const privacyParam = request.nextUrl.searchParams.get('privacy');
  const privacy: Privacy = privacyParam === 'unlisted' || privacyParam === 'private' ? privacyParam : 'public';

  try {
    await connectDB();
    const day = crDate(Date.now());
    const startOfDay = new Date(`${day}T00:00:00-06:00`);
    if (await ThumbnailTest.exists({ kind: 'best', createdAt: { $gte: startOfDay } })) {
      return NextResponse.json({ status: 'skipped', reason: `best wave for ${day} already published` });
    }

    const pick = await ClipScore.findOne({ day, score: { $ne: null }, source: { $ne: 'short' }, usedForBest: false }).sort({ score: -1 });
    if (!pick) return NextResponse.json({ status: 'skipped', reason: `no usable clips scored on ${day}` });

    const at = pick.createdAt.getTime();
    const [source, report] = await Promise.all([downloadClip(pick.clipId), getSurfReport(at).catch(() => null)]);
    const tracks = musicTracks();
    const music = tracks.length ? tracks[Math.floor(Math.random() * tracks.length)] : null;
    const overlay = await renderOverlay({ hook: 'MEJOR OLA DEL DÍA', at, report });
    const meta = surfCheckMeta(pick.clipUrl ?? '', privacy, report, music, 'best', at);
    const videoId = await uploadShort(composeShort(source, overlay, music), meta);

    pick.usedForBest = true;
    await pick.save();
    await TwitchShort.create({
      clipId: pick.clipId, clipUrl: pick.clipUrl, shortVideoId: videoId, title: meta.title, status: 'completed',
      hook: 'MEJOR OLA DEL DÍA', music: music && trackName(music), report,
    });
    const thumbnail = await thumbnailVideo({
      videoId, kind: 'best', clipId: pick.clipId, clip: source, analysis: analyzeBuffer(source), report, at, title: meta.title, style: 'BEST', reason: 'best of day',
    }).catch((err) => ({ error: err instanceof Error ? err.message : String(err) }));

    return NextResponse.json({ status: 'completed', videoId, url: `https://youtube.com/shorts/${videoId}`, score: pick.score, clipId: pick.clipId, thumbnail });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ best-wave:', message);
    return NextResponse.json({ status: 'failed', error: message }, { status: 500 });
  }
}
