import { google } from 'googleapis';
import { Readable } from 'stream';
import { execFileSync } from 'child_process';
import { writeFileSync, readFileSync, unlinkSync, existsSync, readdirSync } from 'fs';
import { join, basename, extname } from 'path';
import { tmpdir } from 'os';
import { OVERLAY_W, OVERLAY_H, CARD_SECONDS } from '@/lib/short-overlay';
import type { SurfReport } from '@/lib/conditions';
import { surfDescription, surfTitle } from '@/lib/copy';

const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID!;
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET!;
const YOUTUBE_REFRESH_TOKEN = process.env.YOUTUBE_REFRESH_TOKEN!;

export type Privacy = 'public' | 'unlisted' | 'private';

export function youtubeAuth() {
  const auth = new google.auth.OAuth2(YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET);
  auth.setCredentials({ refresh_token: YOUTUBE_REFRESH_TOKEN });
  return auth;
}

export function youtubeClient() {
  return google.youtube({ version: 'v3', auth: youtubeAuth() });
}

export function ffmpegPath(): string {
  const candidates = [
    // Direct require (plain Node, and what Next's file tracing follows into the bundle)
    (() => { try { return require('ffmpeg-static') as string; } catch { return null; } })(),
    join(process.cwd(), 'node_modules', 'ffmpeg-static', process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg'),
  ].filter(Boolean) as string[];
  const found = candidates.find((p) => existsSync(p));
  if (!found) throw new Error('ffmpeg binary not found. Tried: ' + candidates.join(', '));
  return found;
}

// The cam's audio track is effectively silent (~-85 dB mean, measured 2026-09-23), so the
// music isn't tucked under anything: it's loudness-normalized to about YouTube's playback
// reference. loudnorm upsamples internally, hence the aresample back to 48k.
const MUSIC_FILTER = 'loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000';
const MUSIC_DIR = join(process.cwd(), 'assets', 'music');

// Tracks from the YouTube Audio Library, named "Artist - Title.mp3" so the description can
// carry the credit some of them require.
export function musicTracks(): string[] {
  if (!existsSync(MUSIC_DIR)) return [];
  return readdirSync(MUSIC_DIR)
    .filter((f) => ['.mp3', '.m4a', '.wav'].includes(extname(f).toLowerCase()))
    .map((f) => join(MUSIC_DIR, f));
}

export const trackName = (path: string) => basename(path, extname(path));

// ffmpeg-static ships without ffprobe; `ffmpeg -i` prints the same header on stderr.
function probe(path: string) {
  let header = '';
  try {
    execFileSync(ffmpegPath(), ['-hide_banner', '-i', path], { stdio: 'pipe' });
  } catch (err) {
    header = String((err as { stderr?: Buffer }).stderr ?? '');
  }
  const d = header.match(/Duration: (\d+):(\d+):([\d.]+)/);
  if (!d) throw new Error('Could not read clip duration');
  return { durationS: +d[1] * 3600 + +d[2] * 60 + +d[3], hasAudio: /Stream #.*Audio:/.test(header) };
}

// 16:9 → 9:16 at native height (608x1080 from a 1080p clip), then the PNG overlay on top.
// No upscale: YouTube does that itself, and encoding 1080x1920 timed out on Vercel's
// function CPU. ultrafast is what the old promote-to-shorts route shipped 66 Shorts with.
//
// The window sits a bit right of center: the cam burns a watermark bottom-left and a
// timestamp top-right, and this offset (~14% of frame height) lands the window in the
// gap between them so neither gets sliced mid-word.
export function composeShort(input: Buffer, overlay: Buffer, music: string | null, endCards: Buffer[] = []): Buffer {
  const stamp = Date.now();
  const inPath = join(tmpdir(), `short-in-${stamp}.mp4`);
  const overlayPath = join(tmpdir(), `short-overlay-${stamp}.png`);
  const cardPaths = endCards.map((_, i) => join(tmpdir(), `short-card${i}-${stamp}.png`));
  const outPath = join(tmpdir(), `short-out-${stamp}.mp4`);
  try {
    writeFileSync(inPath, input);
    writeFileSync(overlayPath, overlay);
    const { durationS, hasAudio } = probe(inPath);

    const inputs = ['-i', inPath, '-i', overlayPath];
    let filter =
      `[0:v]crop=ih*9/16:ih:(iw-ih*9/16)/2+ih*0.143:0,scale=${OVERLAY_W}:${OVERLAY_H},setsar=1[bg];` +
      `[bg][1:v]overlay=0:0[v0]`;
    let video = '[v0]';

    // Closing cards run back to back over the last CARD_SECONDS each, every one fading in
    // on top of the one before (which stays up through that fade, so nothing flashes in
    // between). Looped so the fade has a timeline to run on; -t caps it to the clip.
    endCards.forEach((card, i) => {
      writeFileSync(cardPaths[i], card);
      const start = Math.max(0, durationS - CARD_SECONDS * (endCards.length - i));
      const last = i === endCards.length - 1;
      const enable = last ? `gte(t,${start.toFixed(2)})` : `between(t,${start.toFixed(2)},${(start + CARD_SECONDS + 0.6).toFixed(2)})`;
      inputs.push('-loop', '1', '-framerate', '30', '-i', cardPaths[i]);
      filter +=
        `;[${i + 2}:v]format=rgba,fade=t=in:st=${start.toFixed(2)}:d=0.6:alpha=1[c${i}];` +
        `${video}[c${i}]overlay=0:0:enable='${enable}':shortest=1[v${i + 1}]`;
      video = `[v${i + 1}]`;
    });
    let audio = hasAudio ? ['-map', '0:a', '-c:a', 'copy'] : [];

    if (music) {
      const musicIdx = 2 + endCards.length;
      inputs.push('-stream_loop', '-1', '-i', music);
      const bed = `[${musicIdx}:a]${MUSIC_FILTER},afade=t=in:d=1`;
      const mixed = hasAudio ? `${bed}[m];[0:a][m]amix=inputs=2:duration=first:normalize=0` : bed;
      filter += `;${mixed},afade=t=out:st=${Math.max(0, durationS - 1.5).toFixed(2)}:d=1.5[a]`;
      audio = ['-map', '[a]', '-c:a', 'aac', '-b:a', '160k'];
    }

    execFileSync(ffmpegPath(), [
      '-hide_banner', '-loglevel', 'error',
      ...inputs,
      '-filter_complex', filter,
      '-map', video, ...audio,
      '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '23', '-pix_fmt', 'yuv420p',
      '-t', durationS.toFixed(2),
      '-movflags', '+faststart',
      '-y', outPath,
    ], { timeout: 120_000, stdio: 'pipe' });
    return readFileSync(outPath);
  } finally {
    for (const p of [inPath, overlayPath, ...cardPaths, outPath]) if (existsSync(p)) unlinkSync(p);
  }
}

// VOD segments arrive as MPEG-TS; compose and the thumbnail pipeline take MP4.
export function tsToMp4(ts: Buffer): Buffer {
  const stamp = Date.now();
  const inPath = join(tmpdir(), `vod-${stamp}.ts`);
  const outPath = join(tmpdir(), `vod-${stamp}.mp4`);
  try {
    writeFileSync(inPath, ts);
    execFileSync(ffmpegPath(), [
      '-hide_banner', '-loglevel', 'error', '-i', inPath,
      '-c', 'copy', '-bsf:a', 'aac_adtstoasc', '-movflags', '+faststart', '-y', outPath,
    ], { timeout: 60_000, stdio: 'pipe' });
    return readFileSync(outPath);
  } finally {
    for (const p of [inPath, outPath]) if (existsSync(p)) unlinkSync(p);
  }
}

export interface ShortMeta {
  title: string;
  description: string;
  tags: string[];
  privacy: Privacy;
}

export async function uploadShort(video: Buffer, meta: ShortMeta): Promise<string> {
  const res = await youtubeClient().videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: meta.title,
        description: meta.description,
        tags: meta.tags,
        categoryId: '17', // Sports
        defaultLanguage: 'es',
      },
      status: { privacyStatus: meta.privacy, selfDeclaredMadeForKids: false },
    },
    media: { body: Readable.from(video) },
  });
  const id = res.data.id;
  if (!id) throw new Error('YouTube returned no video id');
  return id;
}

export function surfCheckMeta(
  twitchClipUrl: string,
  privacy: Privacy,
  report: SurfReport | null,
  music: string | null,
  kind: 'short' | 'best' = 'short',
  at = Date.now(),
): ShortMeta {
  return {
    title: surfTitle(kind, report, at),
    description: surfDescription({ kind, report, twitchClipUrl, music: music && trackName(music) }),
    tags: [
      'santa teresa', 'surf', 'costa rica', 'surf report', 'surf cam', 'olas', 'surf en vivo',
      'santa teresa surf', 'mal pais', 'shorts', 'surfing', 'waves', 'pura vida',
    ],
    privacy,
  };
}
