import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import connectDB from '@/lib/mongodb';
import SiteConfig from '@/models/SiteConfig';
import ThumbnailTest from '@/models/ThumbnailTest';
import { cronAuthorized } from '@/lib/cron';
import { youtubeClient } from '@/lib/shorts';
import { getAppToken, getUserToken, getLiveStream, createClip, waitForClip, downloadClip } from '@/lib/twitch';
import { getSurfReport } from '@/lib/conditions';
import { surfDescription, surfTitle } from '@/lib/copy';
import { analyzeBuffer, recordClipScore, thumbnailVideo } from '@/lib/thumb-pipeline';
import { pickStyle } from '@/lib/experiments';
import type { ThumbStyle } from '@/lib/thumbnail';

export const maxDuration = 300;

// Our block goes on top of whatever Restream wrote; this line separates the two so each
// refresh replaces only our part.
const MARKER = '———';

// Refreshes the 24/7 broadcast's thumbnail, title and conditions line a few times a day.
// A broadcast keeps one style for its whole day (each day is a new video id), because the
// reach report only splits by video and day. Quota: ~101 units per run.
export async function GET(request: NextRequest) {
  if (!cronAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    // Kept current by refresh-live-video; reading it here avoids spending search quota.
    const videoId = (await SiteConfig.findOne({ key: 'youtube_video_id' }))?.value;
    if (!videoId) return NextResponse.json({ status: 'skipped', reason: 'no youtube_video_id in site config' });

    const yt = youtubeClient();
    const video = (await yt.videos.list({ part: ['snippet'], id: [videoId] })).data.items?.[0];
    if (!video?.snippet || video.snippet.liveBroadcastContent !== 'live') {
      return NextResponse.json({ status: 'skipped', reason: `video ${videoId} is not live` });
    }

    const appToken = await getAppToken();
    if (!(await getLiveStream(appToken))) return NextResponse.json({ status: 'skipped', reason: 'Twitch stream is not live' });

    const at = Date.now();
    const clipId = await createClip(await getUserToken());
    const [clip, report] = await Promise.all([
      waitForClip(appToken, clipId),
      getSurfReport(at).catch(() => null),
    ]);
    const source = await downloadClip(clipId);
    const analysis = analyzeBuffer(source);
    await recordClipScore({ clipId, clipUrl: clip.url, source: 'live', analysis, at });

    const existing = await ThumbnailTest.findOne({ videoId });
    const style = (existing?.style as ThumbStyle | undefined) ?? (await pickStyle('live')).style;
    const title = surfTitle('live', report, at);
    const dry = request.nextUrl.searchParams.get('dry') === '1';
    const thumbnail = await thumbnailVideo({
      videoId, kind: 'live', clipId, clip: source, analysis, report, at, title, style, reason: existing ? 'refresh' : 'new broadcast', dry,
    });
    if (dry) {
      const { jpg, ...rest } = thumbnail as { jpg?: Buffer };
      const file = join(tmpdir(), `live-thumb-dry-${at}.jpg`);
      if (jpg) writeFileSync(file, jpg);
      return NextResponse.json({ status: 'dry-run', videoId, title, description: surfDescription({ kind: 'live', report }), thumbnail: rest, file });
    }

    // videos.update replaces the whole snippet, so carry every writable field over.
    const s = video.snippet;
    const original = (s.description ?? '').includes(MARKER) ? (s.description ?? '').split(MARKER).slice(1).join(MARKER).trim() : (s.description ?? '').trim();
    const description = `${surfDescription({ kind: 'live', report })}\n\n${MARKER}\n\n${original}`.slice(0, 4900);
    await yt.videos.update({
      part: ['snippet'],
      requestBody: {
        id: videoId,
        snippet: {
          title,
          description,
          categoryId: s.categoryId ?? '17',
          tags: s.tags ?? undefined,
          defaultLanguage: s.defaultLanguage ?? undefined,
          defaultAudioLanguage: s.defaultAudioLanguage ?? undefined,
        },
      },
    });

    return NextResponse.json({ status: 'completed', videoId, title, clipId, thumbnail });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ live-thumbnail:', message);
    return NextResponse.json({ status: 'failed', error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
