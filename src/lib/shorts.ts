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

// Named "Artist - Title.mp3" so the description can carry the credit (copy.ts). The first
// four are Kevin MacLeod tracks (CC BY 4.0), cut to 60 s since no Short runs longer.
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
const VERTICAL = `crop=ih*9/16:ih:(iw-ih*9/16)/2+ih*0.143:0,scale=${OVERLAY_W}:${OVERLAY_H},setsar=1`;

export type Cards = { outro?: Buffer };

// One full-frame overlay PNG, shown from `from` seconds until the next layer takes over.
export interface OverlayLayer {
  png: Buffer;
  from: number;
}

const tempPath = (name: string) => join(tmpdir(), `${name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);

// Shared tail of both composers: cards, music bed, encode. `video` is the label of the
// finished vertical picture in `filter`; inputs are numbered in the order they were added.
function encode(job: {
  inputs: string[];
  filter: string;
  video: string;
  durationS: number;
  cards: Cards;
  music: string | null;
  camAudio: boolean;
}): Buffer {
  const { inputs, durationS, cards, music, camAudio } = job;
  let { filter, video } = job;
  let next = inputs.filter((x) => x === '-i').length;
  const outroPath = tempPath('short-outro') + '.png';
  const outPath = tempPath('short-out') + '.mp4';
  try {
    // The outro is a looped still so its alpha fade has a timeline to run on; -t on the
    // output caps everything to the clip.
    if (cards.outro) {
      writeFileSync(outroPath, cards.outro);
      const start = Math.max(0, durationS - CARD_SECONDS).toFixed(2);
      inputs.push('-loop', '1', '-framerate', '30', '-i', outroPath);
      filter +=
        `;[${next}:v]format=rgba,fade=t=in:st=${start}:d=0.3:alpha=1[outro];` +
        `${video}[outro]overlay=0:0:enable='gte(t,${start})':shortest=1[vo]`;
      video = '[vo]';
      next++;
    }
    let audio = camAudio ? ['-map', '0:a', '-c:a', 'copy'] : [];

    if (music) {
      inputs.push('-stream_loop', '-1', '-i', music);
      // Music replaces the cam track instead of mixing with it: the cam's audio is 8 kHz mono
      // silence, and amix takes the first input's format, so the mix came out phone-quality.
      filter += `;[${next}:a]${MUSIC_FILTER},afade=t=in:d=1,afade=t=out:st=${Math.max(0, durationS - 1.5).toFixed(2)}:d=1.5[a]`;
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
    ], { timeout: 180_000, stdio: 'pipe' });
    return readFileSync(outPath);
  } finally {
    for (const p of [outroPath, outPath]) if (existsSync(p)) unlinkSync(p);
  }
}

// `layers` swap in over time (the staged conditions reveal); `startS` drops the head of the
// clip so the Short opens just before its best break, and `maxS` caps the length.
export function composeShort(
  input: Buffer,
  layers: OverlayLayer[],
  music: string | null,
  cards: Cards = {},
  cut: { startS?: number; maxS?: number } = {},
): Buffer {
  const inPath = tempPath('short-in') + '.mp4';
  const layerPaths = layers.map((_, i) => tempPath(`short-layer-${i}`) + '.png');
  try {
    writeFileSync(inPath, input);
    layers.forEach((l, i) => writeFileSync(layerPaths[i], l.png));
    const { durationS: full, hasAudio } = probe(inPath);
    const startS = Math.max(0, Math.min(cut.startS ?? 0, full - 1));
    const durationS = Math.min(full - startS, cut.maxS ?? Infinity);

    const inputs = ['-ss', startS.toFixed(2), '-t', durationS.toFixed(2), '-i', inPath];
    let filter = `[0:v]${VERTICAL},setpts=PTS-STARTPTS[v0]`;
    layers.forEach((l, i) => {
      inputs.push('-i', layerPaths[i]);
      const until = layers[i + 1]?.from;
      const enable = until === undefined ? `gte(t,${l.from})` : `between(t,${l.from},${until - 0.001})`;
      filter += `;[v${i}][${i + 1}:v]overlay=0:0:enable='${enable}'[v${i + 1}]`;
    });
    return encode({ inputs, filter, video: `[v${layers.length}]`, durationS, cards, music, camAudio: hasAudio });
  } finally {
    for (const p of [inPath, ...layerPaths]) if (existsSync(p)) unlinkSync(p);
  }
}

export interface MontagePart {
  clip: Buffer;
  overlay: Buffer;
  focusS: number; // the moment the segment is centred on (the clip's best frame)
}

const XFADE_S = 0.5;

// Several clips cut to `segmentS` around their focus, each under its own overlay, joined
// with short dissolves. The cam's own audio is dropped: it's silent, and a bed that
// restarts at every cut would only draw attention to the cuts.
export function composeMontage(parts: MontagePart[], music: string | null, cards: Cards = {}, segmentS = 12): Buffer {
  const paths: string[] = [];
  try {
    const inputs: string[] = [];
    const chains: string[] = [];
    const lengths: number[] = [];
    parts.forEach((p, i) => {
      const clipPath = tempPath(`montage-${i}`) + '.mp4';
      const overlayPath = tempPath(`montage-${i}`) + '.png';
      writeFileSync(clipPath, p.clip);
      writeFileSync(overlayPath, p.overlay);
      paths.push(clipPath, overlayPath);
      const { durationS } = probe(clipPath);
      const length = Math.min(segmentS, durationS - 0.1);
      const start = Math.min(Math.max(0, p.focusS - length / 2), durationS - length - 0.05);
      lengths.push(length);
      inputs.push('-ss', Math.max(0, start).toFixed(2), '-t', length.toFixed(2), '-i', clipPath, '-i', overlayPath);
      // fps again after the overlay: ffmpeg 7 (the Linux ffmpeg-static on Vercel) leaves an
      // overlay with a still PNG at frame rate 1/0, and xfade refuses non-constant rates.
      // ffmpeg 6.1 on Windows doesn't, which is why the local preview passed.
      chains.push(`[${2 * i}:v]${VERTICAL},fps=30,settb=AVTB,setpts=PTS-STARTPTS[s${i}];[s${i}][${2 * i + 1}:v]overlay=0:0,fps=30,format=yuv420p[p${i}]`);
    });

    let filter = chains.join(';');
    let video = '[p0]';
    let offset = 0;
    for (let i = 1; i < parts.length; i++) {
      offset += lengths[i - 1] - XFADE_S;
      filter += `;${video}[p${i}]xfade=transition=fade:duration=${XFADE_S}:offset=${offset.toFixed(2)}[x${i}]`;
      video = `[x${i}]`;
    }
    const durationS = lengths.reduce((a, b) => a + b, 0) - XFADE_S * (parts.length - 1);
    return encode({ inputs, filter, video, durationS, cards, music, camAudio: false });
  } finally {
    for (const p of paths) if (existsSync(p)) unlinkSync(p);
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
    tags: SHORT_TAGS,
    privacy,
  };
}

export const SHORT_TAGS = [
  'santa teresa', 'surf', 'costa rica', 'surf report', 'surf cam', 'olas', 'surf en vivo',
  'santa teresa surf', 'mal pais', 'shorts', 'surfing', 'waves', 'pura vida',
];
