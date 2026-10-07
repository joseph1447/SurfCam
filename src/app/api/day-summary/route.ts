import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TwitchShort from '@/models/TwitchShort';
import { cronAuthorized } from '@/lib/cron';
import { crDate, crTime } from '@/lib/conditions';
import { uploadShort, musicTracks, trackName, SHORT_TAGS, type Privacy } from '@/lib/shorts';
import { DAY_HOOK, pickMoments, buildDaySummary } from '@/lib/day-summary';
import { REEL_COVER_MS } from '@/lib/short-overlay';
import { analyzeBuffer, thumbnailVideo } from '@/lib/thumb-pipeline';
import { publishReel, publishStory } from '@/lib/instagram';
import { reelCaption, surfDescription, surfTitle } from '@/lib/copy';

export const maxDuration = 300;

// The evening Short: the day's best morning, midday and afternoon moments in one clip.
// ?dry=1 reports the picks without publishing; ?day=YYYY-MM-DD rebuilds an earlier day
// (its Twitch clips stay up); ?music=on|off, ?instagram=off, ?privacy=unlisted|private.
export async function GET(request: NextRequest) {
  if (!cronAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const params = request.nextUrl.searchParams;
  const privacyParam = params.get('privacy');
  const privacy: Privacy = privacyParam === 'unlisted' || privacyParam === 'private' ? privacyParam : 'public';
  const dry = params.get('dry') === '1';
  const dayParam = params.get('day');
  const day = dayParam ?? crDate(Date.now());

  try {
    await connectDB();
    if (!dry && !dayParam && (await TwitchShort.exists({ slot: 'day', createdAt: { $gte: new Date(`${day}T00:00:00-06:00`) } }))) {
      return NextResponse.json({ status: 'skipped', reason: `day summary for ${day} already published` });
    }

    const picks = await pickMoments(day);
    const summary = picks.map((p) => ({ label: p.label, at: crTime(p.at), clipId: p.clipId, score: p.score }));
    if (picks.length < 2) return NextResponse.json({ status: 'skipped', reason: `only ${picks.length} usable moment(s) on ${day}`, picks: summary });
    if (dry) return NextResponse.json({ status: 'dry', day, picks: summary });

    const tracks = params.get('music') === 'off' ? [] : musicTracks();
    const music = tracks.length ? tracks[Math.floor(Math.random() * tracks.length)] : null;
    const at = picks[picks.length - 1].at;
    const record = await TwitchShort.create({
      clipId: `day-${day}-${Date.now().toString(36)}`, clipUrl: picks[0].clipUrl, status: 'processing',
      hook: DAY_HOOK, music: music && trackName(music), slot: 'day',
    });

    try {
      const { video, moments, top } = await buildDaySummary(picks, music);
      const title = surfTitle('day', null, at);
      const description = surfDescription({ kind: 'day', report: null, music: music && trackName(music), moments });
      const videoId = await uploadShort(video, { title, description, tags: SHORT_TAGS, privacy });
      const url = `https://youtube.com/shorts/${videoId}`;
      Object.assign(record, { shortVideoId: videoId, title, status: 'completed', report: top.moment.report });
      await record.save();
      console.log(`✅ ${url}`);

      const thumbnail = await thumbnailVideo({
        videoId, kind: 'short', clipId: top.moment.clipId, clip: top.source, analysis: analyzeBuffer(top.source),
        report: top.moment.report, at: top.moment.at, title, reason: 'upload',
      }).catch((err) => ({ error: err instanceof Error ? err.message : String(err) }));

      let instagram: unknown = null;
      if (privacy === 'public' && params.get('instagram') !== 'off') {
        try {
          const reel = await publishReel({
            video, caption: reelCaption({ kind: 'day', report: null, at, youtubeUrl: url, moments }), thumbnailOffsetMs: REEL_COVER_MS, name: `day-${videoId}`,
          });
          record.instagram = reel;
          instagram = reel;
        } catch (err) {
          record.instagramError = err instanceof Error ? err.message : String(err);
          instagram = { error: record.instagramError };
        }
        try {
          record.instagramStory = await publishStory({ video, name: `day-${videoId}` });
        } catch (err) {
          record.instagramStoryError = err instanceof Error ? err.message : String(err);
        }
        await record.save();
      }

      return NextResponse.json({ status: 'completed', videoId, url, picks: summary, thumbnail, instagram, instagramStory: record.instagramStory ?? { error: record.instagramStoryError } });
    } catch (err) {
      record.status = 'failed';
      record.error = err instanceof Error ? err.message : String(err);
      await record.save();
      throw err;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ day-summary:', message);
    return NextResponse.json({ status: 'failed', error: message }, { status: message.includes('quotaExceeded') ? 429 : 500 });
  }
}
