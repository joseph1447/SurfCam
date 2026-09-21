#!/usr/bin/env node
/**
 * Captures a slice of the live YouTube surf cam, crops it to vertical, uploads it as a Short.
 *
 * Runs from .github/workflows/daily-shorts.yml (twice a day). Needs `yt-dlp` and `ffmpeg`
 * on PATH. yt-dlp is required because YouTube no longer exposes hlsManifestUrl to plain
 * HTTP clients - the innertube player response only returns SABR formats.
 *
 * Local run:  node scripts/capture-short.mjs --dry-run
 */

import { execFileSync } from 'child_process';
import { existsSync, mkdirSync, rmSync, statSync, createReadStream } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { google } from 'googleapis';
import mongoose from 'mongoose';

const {
  YOUTUBE_CLIENT_ID,
  YOUTUBE_CLIENT_SECRET,
  YOUTUBE_REFRESH_TOKEN,
  MONGODB_URI,
  YT_COOKIES_FILE,
} = process.env;

const CHANNEL_ID = process.env.NEXT_PUBLIC_YT_CHANNEL_ID || 'UCa4397KS7YBwp7pkA8B5J6g';
const YTDLP = process.env.YTDLP_PATH || 'yt-dlp';
const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';
const CLIP_SECONDS = Number(process.env.CLIP_SECONDS || 40);
const PRIVACY = process.env.SHORT_PRIVACY || 'public';
// Horizontal nudge of the 9:16 window, in source pixels. Negative = left, positive = right.
// Default lands the window in the gap between the cam's two burned-in overlays (the
// seataya watermark ends around x=800, the timestamp starts around x=1450), so neither
// gets sliced mid-word. Bump it if the break shifts.
const CROP_OFFSET = Number(process.env.CROP_OFFSET || 154);
const DRY_RUN = process.argv.includes('--dry-run') || process.env.DRY_RUN === 'true';

const work = join(tmpdir(), `short-${Date.now()}`);
const rawPath = join(work, 'raw.mp4');
const vertPath = join(work, 'vertical.mp4');

function run(cmd, args) {
  return execFileSync(cmd, args, { stdio: 'inherit' });
}

async function withDb(fn) {
  await mongoose.connect(MONGODB_URI);
  try {
    return await fn(mongoose.connection.db);
  } finally {
    await mongoose.disconnect();
  }
}

function youtubeClient() {
  const auth = new google.auth.OAuth2(YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET);
  auth.setCredentials({ refresh_token: YOUTUBE_REFRESH_TOKEN });
  return google.youtube({ version: 'v3', auth });
}

// The refresh-live-video cron keeps siteconfigs.youtube_video_id pointing at the current
// broadcast, so read that first (1 quota unit to verify) and fall back to search (100 units).
async function resolveLiveVideoId(youtube) {
  if (MONGODB_URI) {
    const doc = await withDb((db) => db.collection('siteconfigs').findOne({ key: 'youtube_video_id' }));
    if (doc?.value) {
      const res = await youtube.videos.list({ part: ['snippet'], id: [doc.value] });
      const state = res.data.items?.[0]?.snippet?.liveBroadcastContent;
      if (state === 'live') {
        console.log(`📺 Live video from siteconfigs: ${doc.value}`);
        return doc.value;
      }
      console.log(`⚠️  siteconfigs video ${doc.value} is "${state}", falling back to search`);
    }
  }

  const res = await youtube.search.list({
    part: ['id'],
    channelId: CHANNEL_ID,
    eventType: 'live',
    type: ['video'],
    maxResults: 1,
  });
  const videoId = res.data.items?.[0]?.id?.videoId;
  if (videoId) console.log(`📺 Live video from search: ${videoId}`);
  return videoId || null;
}

function captureClip(videoId) {
  const args = [
    '--no-update',
    '--no-playlist',
    '--force-overwrites',
    '-f', 'best[height<=1080]',
    '--downloader', 'ffmpeg',
    '--downloader-args', `ffmpeg_i:-t ${CLIP_SECONDS}`,
    '-o', rawPath,
  ];
  if (process.env.FFMPEG_PATH) args.push('--ffmpeg-location', process.env.FFMPEG_PATH);
  if (process.env.YTDLP_EXTRA_ARGS) args.push(...process.env.YTDLP_EXTRA_ARGS.split(' ').filter(Boolean));
  if (YT_COOKIES_FILE && existsSync(YT_COOKIES_FILE)) args.push('--cookies', YT_COOKIES_FILE);
  args.push(`https://www.youtube.com/watch?v=${videoId}`);

  console.log(`📥 Capturing ${CLIP_SECONDS}s from the live stream...`);
  run(YTDLP, args);

  if (!existsSync(rawPath)) throw new Error('yt-dlp produced no output file');
  const mb = statSync(rawPath).size / 1024 / 1024;
  if (mb < 0.2) throw new Error(`Capture is suspiciously small (${mb.toFixed(2)} MB)`);
  console.log(`✅ Captured ${mb.toFixed(2)} MB`);
}

function toVertical() {
  // Center 9:16 window out of the 16:9 frame, then up to full Shorts resolution.
  const x = `(iw-ih*9/16)/2+${CROP_OFFSET}`;
  console.log('🎬 Cropping to 1080x1920...');
  run(FFMPEG, [
    '-hide_banner', '-loglevel', 'error',
    '-i', rawPath,
    '-vf', `crop=ih*9/16:ih:${x}:0,scale=1080:1920:flags=lanczos`,
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '128k',
    '-movflags', '+faststart',
    '-y', vertPath,
  ]);

  const mb = statSync(vertPath).size / 1024 / 1024;
  console.log(`✅ Vertical clip: ${mb.toFixed(2)} MB`);
}

function clipMeta(liveVideoId) {
  const stamp = new Date().toLocaleString('en-US', {
    timeZone: 'America/Costa_Rica',
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  });

  return {
    title: `🌊 Santa Teresa Surf Check - ${stamp} #Shorts`,
    description: `Live surf conditions from Santa Teresa, Costa Rica! 🏄‍♂️🌊

📍 Watch the live 24/7 stream: https://santateresasurfcam.com
🔴 Live right now: https://youtube.com/watch?v=${liveVideoId}

Santa Teresa is one of the best surf spots in Costa Rica, known for its consistent waves and beautiful beaches.

#Shorts #surf #santateresa #costarica #surfing #waves #beach #ocean #puravida #surfcam #livesurf #surfcheck`,
    tags: [
      'shorts', 'surf', 'surfing', 'santa teresa', 'costa rica',
      'waves', 'beach', 'ocean', 'pura vida', 'surfcam',
      'live surf', 'surf conditions', 'surf check', 'surf report',
    ],
  };
}

async function uploadShort(youtube, meta) {
  console.log(`📤 Uploading: "${meta.title}"`);
  const res = await youtube.videos.insert({
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
      status: { privacyStatus: PRIVACY, selfDeclaredMadeForKids: false },
    },
    media: { body: createReadStream(vertPath) },
  });

  const videoId = res.data.id;
  if (!videoId) throw new Error('No video ID returned from YouTube');
  console.log(`✅ https://youtube.com/shorts/${videoId}`);
  return videoId;
}

async function log(record) {
  if (!MONGODB_URI) return;
  try {
    await withDb((db) => db.collection('capturedshorts').insertOne({ ...record, createdAt: new Date() }));
  } catch (err) {
    console.error('⚠️  Could not write log record:', err.message);
  }
}

async function main() {
  for (const [name, value] of Object.entries({ YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN })) {
    if (!value) throw new Error(`Missing ${name}`);
  }

  const youtube = youtubeClient();
  const liveVideoId = await resolveLiveVideoId(youtube);

  if (!liveVideoId) {
    // Expected between 7pm and 5am CR, when restream-toggle has the stream off.
    console.log('📭 Nothing live right now - skipping.');
    await log({ status: 'skipped', reason: 'no live broadcast' });
    return;
  }

  mkdirSync(work, { recursive: true });
  try {
    captureClip(liveVideoId);
    toVertical();

    if (DRY_RUN) {
      console.log(`🧪 Dry run - kept ${vertPath}, nothing uploaded.`);
      return;
    }

    const meta = clipMeta(liveVideoId);
    const shortVideoId = await uploadShort(youtube, meta);
    await log({ status: 'completed', liveVideoId, shortVideoId, title: meta.title, clipSeconds: CLIP_SECONDS });
  } catch (err) {
    await log({ status: 'failed', liveVideoId, error: err.message });
    throw err;
  } finally {
    if (!DRY_RUN) rmSync(work, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
