// Everything a Short run does once its 16:9 source clip is in hand: overlay, vertical
// compose, YouTube upload, thumbnail, and the Instagram Reel + Story. Shared by the live-clip
// run (short-from-twitch) and the sunset run, which cuts its clip from the VOD instead.
import { composeShort, uploadShort, surfCheckMeta, musicTracks, type Privacy } from '@/lib/shorts';
import type { SurfReport } from '@/lib/conditions';
import { renderOverlay, renderEndCard, renderSponsorCard, HOOKS, REEL_COVER_MS } from '@/lib/short-overlay';
import { analyzeBuffer, recordClipScore, thumbnailVideo } from '@/lib/thumb-pipeline';
import { publishReel, publishStory } from '@/lib/instagram';
import { reelCaption } from '@/lib/copy';
import type { TwitchShort } from '@/models/TwitchShort';

// Two uploads a day. Music alternates daily within each slot (so it isn't confounded with
// morning vs evening light), and hooks cycle through every slot.
export function slotPlan(at: number, musicParam: string | null) {
  const crDay = Math.floor((at - 6 * 3_600_000) / 86_400_000);
  const evening = new Date(at - 6 * 3_600_000).getUTCHours() >= 12 ? 1 : 0;
  const tracks = musicTracks();
  const wantMusic = musicParam ? musicParam === 'on' : (crDay + evening) % 2 === 0;
  return {
    hook: HOOKS[(crDay * 2 + evening) % HOOKS.length],
    music: wantMusic && tracks.length ? tracks[Math.floor(Math.random() * tracks.length)] : null,
  };
}

export async function finishShort(opts: {
  record: TwitchShort;
  source: Buffer;
  clipId: string;
  clipUrl: string;
  at: number;
  report: SurfReport | null;
  hook: string;
  music: string | null;
  privacy: Privacy;
  instagram: boolean;
}) {
  const { record, source, clipId, clipUrl, at, report, hook, music, privacy } = opts;
  record.clipUrl = clipUrl;
  record.report = report as TwitchShort['report'];

  const [overlay, subscribeCard, sponsorCard] = await Promise.all([renderOverlay({ hook, at, report }), renderEndCard(), renderSponsorCard()]);
  const vertical = composeShort(source, overlay, music, { intro: sponsorCard, outro: subscribeCard });
  const meta = surfCheckMeta(clipUrl, privacy, report, music, 'short', at);
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
    await recordClipScore({ clipId, clipUrl, source: 'short', analysis, at });
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
  if (privacy === 'public' && opts.instagram) {
    try {
      const reel = await publishReel({
        video: vertical,
        caption: reelCaption({ kind: 'short', report, at, youtubeUrl: url }),
        thumbnailOffsetMs: REEL_COVER_MS,
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
    try {
      record.instagramStory = await publishStory({ video: vertical, name: `short-${shortVideoId}` });
    } catch (err) {
      record.instagramStoryError = err instanceof Error ? err.message : String(err);
      console.error('⚠️ Instagram story failed:', record.instagramStoryError);
    }
    await record.save();
  }

  return {
    shortVideoId, url, thumbnail, instagram,
    instagramStory: record.instagramStory ?? { error: record.instagramStoryError },
  };
}
