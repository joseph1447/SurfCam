import { google } from 'googleapis';
import { Readable } from 'stream';
import { execFileSync } from 'child_process';
import { writeFileSync, readFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID!;
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET!;
const YOUTUBE_REFRESH_TOKEN = process.env.YOUTUBE_REFRESH_TOKEN!;

export type Privacy = 'public' | 'unlisted' | 'private';

export function youtubeClient() {
  const auth = new google.auth.OAuth2(YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET);
  auth.setCredentials({ refresh_token: YOUTUBE_REFRESH_TOKEN });
  return google.youtube({ version: 'v3', auth });
}

function ffmpegPath(): string {
  const candidates = [
    // Direct require (plain Node, and what Next's file tracing follows into the bundle)
    (() => { try { return require('ffmpeg-static') as string; } catch { return null; } })(),
    join(process.cwd(), 'node_modules', 'ffmpeg-static', process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg'),
  ].filter(Boolean) as string[];
  const found = candidates.find((p) => existsSync(p));
  if (!found) throw new Error('ffmpeg binary not found. Tried: ' + candidates.join(', '));
  return found;
}

// 16:9 → 1080x1920. The 9:16 window sits a bit right of center: the cam burns a watermark
// bottom-left and a timestamp top-right, and this offset (~14% of frame height) lands the
// window in the gap between them so neither gets sliced mid-word.
export function cropToVertical(input: Buffer): Buffer {
  const stamp = Date.now();
  const inPath = join(tmpdir(), `short-in-${stamp}.mp4`);
  const outPath = join(tmpdir(), `short-out-${stamp}.mp4`);
  try {
    writeFileSync(inPath, input);
    execFileSync(ffmpegPath(), [
      '-hide_banner', '-loglevel', 'error',
      '-i', inPath,
      '-vf', 'crop=ih*9/16:ih:(iw-ih*9/16)/2+ih*0.143:0,scale=1080:1920:flags=lanczos',
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p',
      '-c:a', 'aac', '-b:a', '128k',
      '-movflags', '+faststart',
      '-y', outPath,
    ], { timeout: 45_000, stdio: 'pipe' });
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
        defaultLanguage: 'en',
        defaultAudioLanguage: 'en',
      },
      status: { privacyStatus: meta.privacy, selfDeclaredMadeForKids: false },
    },
    media: { body: Readable.from(video) },
  });
  const id = res.data.id;
  if (!id) throw new Error('YouTube returned no video id');
  return id;
}

export function surfCheckMeta(twitchClipUrl: string, privacy: Privacy): ShortMeta {
  const stamp = new Date().toLocaleString('en-US', {
    timeZone: 'America/Costa_Rica',
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  });
  return {
    title: `🌊 Santa Teresa Surf Check - ${stamp} #Shorts`,
    // Deliberately not "Original clip:" - that phrase is what promote-to-shorts keys on
    // to pick candidates, and these uploads must never re-enter that pipeline.
    description: `Live surf conditions from Santa Teresa, Costa Rica! 🏄‍♂️🌊

📍 Watch the live 24/7 stream: https://santateresasurfcam.com
🎬 Twitch clip: ${twitchClipUrl}

Santa Teresa is one of the best surf spots in Costa Rica, known for its consistent waves and beautiful beaches.

#Shorts #surf #santateresa #costarica #surfing #waves #beach #ocean #puravida #surfcam #livesurf #surfcheck`,
    tags: [
      'shorts', 'surf', 'surfing', 'santa teresa', 'costa rica',
      'waves', 'beach', 'ocean', 'pura vida', 'surfcam',
      'live surf', 'surf conditions', 'surf check', 'surf report',
    ],
    privacy,
  };
}
