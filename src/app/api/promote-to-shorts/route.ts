import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';
import { execSync } from 'child_process';
import { writeFileSync, readFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import connectDB from '@/lib/mongodb';
import PromotedShort from '@/models/PromotedShort';

const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID!;
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET!;
const YOUTUBE_REFRESH_TOKEN = process.env.YOUTUBE_REFRESH_TOKEN!;
const CHANNEL_ID = process.env.NEXT_PUBLIC_YT_CHANNEL_ID || 'UCa4397KS7YBwp7pkA8B5J6g';
const CRON_SECRET = process.env.CRON_SECRET;

// Minimum views to consider a video for promotion
const MIN_VIEWS_FOR_PROMOTION = 3;
// Max videos to promote per cron run
const MAX_PROMOTIONS_PER_RUN = 1;

// Vercel serverless config
export const maxDuration = 60;

function createOAuth2Client() {
  const oauth2Client = new google.auth.OAuth2(
    YOUTUBE_CLIENT_ID,
    YOUTUBE_CLIENT_SECRET
  );
  oauth2Client.setCredentials({ refresh_token: YOUTUBE_REFRESH_TOKEN });
  return oauth2Client;
}

// Parse ISO 8601 duration to seconds
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  return parseInt(match[1] || '0') * 3600 +
         parseInt(match[2] || '0') * 60 +
         parseInt(match[3] || '0');
}

// Extract Twitch clip URL from YouTube video description
function extractTwitchClipUrl(description: string): string | null {
  const match = description.match(/Original clip:\s*(https?:\/\/[^\s]+)/);
  return match ? match[1] : null;
}

// Extract clip slug from Twitch URL
function extractClipSlug(clipUrl: string): string | null {
  const clipsMatch = clipUrl.match(/clips\.twitch\.tv\/([^?/]+)/);
  if (clipsMatch) return clipsMatch[1];
  const channelClipMatch = clipUrl.match(/twitch\.tv\/[^/]+\/clip\/([^?/]+)/);
  if (channelClipMatch) return channelClipMatch[1];
  return null;
}

// Download video from Twitch using GQL API
async function downloadFromTwitch(clipUrl: string): Promise<Buffer> {
  const slug = extractClipSlug(clipUrl);
  if (!slug) throw new Error('Could not extract clip slug from: ' + clipUrl);

  console.log(`📥 Downloading clip from Twitch: ${slug}`);

  const gqlQuery = {
    operationName: 'VideoAccessToken_Clip',
    variables: { slug },
    extensions: {
      persistedQuery: {
        version: 1,
        sha256Hash: '36b89d2507fce29e5ca551df756d27c1cfe079e2609642b4390aa4c35796eb11'
      }
    }
  };

  const gqlRes = await fetch('https://gql.twitch.tv/gql', {
    method: 'POST',
    headers: {
      'Client-ID': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(gqlQuery),
  });

  if (!gqlRes.ok) throw new Error(`GQL request failed: ${gqlRes.status}`);

  const data = await gqlRes.json();
  const clip = data?.data?.clip;
  if (!clip?.playbackAccessToken || !clip?.videoQualities?.length) {
    throw new Error('No video data in GQL response - clip may have been deleted');
  }

  const bestQuality = clip.videoQualities[0];
  const token = encodeURIComponent(clip.playbackAccessToken.value);
  const sig = clip.playbackAccessToken.signature;
  const videoUrl = `${bestQuality.sourceURL}?sig=${sig}&token=${token}`;

  const videoRes = await fetch(videoUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'video/mp4,video/*,*/*',
    },
  });

  if (!videoRes.ok) throw new Error(`Video download failed: ${videoRes.status}`);

  const arrayBuffer = await videoRes.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Verify it's actually a video (MP4 magic bytes)
  const magicBytes = buffer.slice(4, 8).toString('ascii');
  if (magicBytes !== 'ftyp' && magicBytes !== 'moov' && magicBytes !== 'mdat') {
    throw new Error(`Downloaded file is not a valid MP4 (magic: ${magicBytes})`);
  }

  console.log(`✅ Downloaded ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
  return buffer;
}

// Resolve ffmpeg binary path
function getFfmpegPath(): string {
  const { join } = require('path') as typeof import('path');
  // Try multiple resolution strategies
  const candidates = [
    // Direct require (works in plain Node.js)
    (() => { try { return require('ffmpeg-static') as string; } catch { return null; } })(),
    // Manual path resolution (works when bundler mangles require)
    join(process.cwd(), 'node_modules', 'ffmpeg-static', process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg'),
  ].filter(Boolean) as string[];

  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  throw new Error('ffmpeg binary not found. Tried: ' + candidates.join(', '));
}

// Crop video from 16:9 horizontal to 9:16 vertical using ffmpeg
// Center-crops the video to capture the main surf action
function cropToVertical(inputBuffer: Buffer): Buffer {
  const ffmpegPath = getFfmpegPath();
  const timestamp = Date.now();
  const inputPath = join(tmpdir(), `input-${timestamp}.mp4`);
  const outputPath = join(tmpdir(), `output-${timestamp}.mp4`);

  try {
    console.log('🎬 Cropping video from 16:9 → 9:16 vertical...');

    // Write input to temp file
    writeFileSync(inputPath, inputBuffer);

    // Crop: take center portion of 16:9 video and make it 9:16
    // crop=ih*9/16:ih crops width to (height * 9/16) and keeps full height, centered
    // This gives a vertical center-cut of the landscape video
    execSync(
      `"${ffmpegPath}" -i "${inputPath}" -vf "crop=ih*9/16:ih" -c:a copy -preset ultrafast -movflags +faststart -y "${outputPath}"`,
      { timeout: 30000, stdio: 'pipe' }
    );

    const outputBuffer = readFileSync(outputPath);
    console.log(`✅ Cropped: ${(inputBuffer.length / 1024 / 1024).toFixed(2)} MB → ${(outputBuffer.length / 1024 / 1024).toFixed(2)} MB`);

    return outputBuffer;
  } finally {
    // Clean up temp files
    if (existsSync(inputPath)) unlinkSync(inputPath);
    if (existsSync(outputPath)) unlinkSync(outputPath);
  }
}

// Upload cropped vertical video as a YouTube Short
async function uploadAsShort(
  videoBuffer: Buffer,
  originalTitle: string,
  twitchClipUrl: string,
): Promise<{ videoId: string; url: string }> {
  const oauth2Client = createOAuth2Client();
  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  // Shorts-optimized title
  const cleanTitle = originalTitle.replace(/#\s*shorts?\b/gi, '').trim();
  const shortTitle = cleanTitle.length > 90
    ? cleanTitle.substring(0, 90) + ' #Shorts'
    : cleanTitle + ' #Shorts';

  const description = `Live surf conditions from Santa Teresa, Costa Rica! 🏄‍♂️🌊

📍 Watch the live 24/7 stream: https://santateresasurfcam.com
🎬 Original clip: ${twitchClipUrl}

Santa Teresa is one of the best surf spots in Costa Rica, known for its consistent waves and beautiful beaches.

#Shorts #surf #santateresa #costarica #surfing #waves #beach #ocean #puravida #surfcam #livesurf #surfcheck`;

  console.log(`📤 Uploading Short: "${shortTitle}"`);

  const videoStream = Readable.from(videoBuffer);

  const response = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: shortTitle,
        description,
        tags: [
          'shorts', 'surf', 'surfing', 'santa teresa', 'costa rica',
          'waves', 'beach', 'ocean', 'pura vida', 'surfcam',
          'live surf', 'surf conditions', 'surf check', 'surf report',
        ],
        categoryId: '17', // Sports
        defaultLanguage: 'en',
        defaultAudioLanguage: 'en',
      },
      status: {
        privacyStatus: 'public',
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      body: videoStream,
    },
  });

  const videoId = response.data.id;
  if (!videoId) throw new Error('No video ID returned from YouTube');

  const url = `https://youtube.com/shorts/${videoId}`;
  console.log(`✅ Uploaded Short: ${url}`);
  return { videoId, url };
}

export async function GET(request: NextRequest) {
  // Auth check
  const host = request.headers.get('host') || '';
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');

  if (!isLocalhost && CRON_SECRET) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  if (!YOUTUBE_CLIENT_ID || !YOUTUBE_CLIENT_SECRET || !YOUTUBE_REFRESH_TOKEN) {
    return NextResponse.json({ error: 'Missing YouTube config' }, { status: 500 });
  }

  try {
    await connectDB();

    const oauth2Client = createOAuth2Client();
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    // Step 1: Get channel uploads playlist
    console.log('📋 Fetching channel uploads...');
    const channelRes = await youtube.channels.list({
      part: ['contentDetails'],
      id: [CHANNEL_ID],
    });

    const uploadsPlaylistId =
      channelRes.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylistId) {
      return NextResponse.json({ error: 'No uploads playlist found' }, { status: 500 });
    }

    // Step 2: Get recent uploads (up to 50)
    const playlistRes = await youtube.playlistItems.list({
      part: ['snippet', 'contentDetails'],
      playlistId: uploadsPlaylistId,
      maxResults: 50,
    });

    const videoIds = (playlistRes.data.items || [])
      .map((item) => item.contentDetails?.videoId)
      .filter(Boolean) as string[];

    if (videoIds.length === 0) {
      return NextResponse.json({ message: 'No videos found on channel', promoted: 0 });
    }

    // Step 3: Get video details (duration, views, description)
    const videosRes = await youtube.videos.list({
      part: ['contentDetails', 'snippet', 'statistics'],
      id: videoIds,
    });

    // Step 4: Get already promoted video IDs from DB
    const alreadyPromoted = await PromotedShort.find({
      originalVideoId: { $in: videoIds },
    }).select('originalVideoId');
    const promotedSet = new Set(alreadyPromoted.map((p) => p.originalVideoId));

    // Step 5: Filter candidates
    const candidates = (videosRes.data.items || [])
      .filter((video) => {
        const duration = video.contentDetails?.duration || '';
        const totalSeconds = parseDuration(duration);
        const views = parseInt(video.statistics?.viewCount || '0');
        const videoId = video.id!;
        const description = video.snippet?.description || '';
        const hasTwitchUrl = extractTwitchClipUrl(description) !== null;

        return (
          totalSeconds > 0 &&
          totalSeconds <= 60 &&
          views >= MIN_VIEWS_FOR_PROMOTION &&
          !promotedSet.has(videoId) &&
          hasTwitchUrl
        );
      })
      .sort((a, b) => {
        const viewsA = parseInt(a.statistics?.viewCount || '0');
        const viewsB = parseInt(b.statistics?.viewCount || '0');
        return viewsB - viewsA;
      })
      .slice(0, MAX_PROMOTIONS_PER_RUN);

    if (candidates.length === 0) {
      console.log('📭 No eligible videos to promote');
      return NextResponse.json({
        message: 'No eligible videos to promote',
        promoted: 0,
        totalVideos: videoIds.length,
        alreadyPromoted: promotedSet.size,
      });
    }

    const results = [];

    for (const video of candidates) {
      const videoId = video.id!;
      const title = video.snippet?.title || '';
      const description = video.snippet?.description || '';
      const views = parseInt(video.statistics?.viewCount || '0');
      const twitchClipUrl = extractTwitchClipUrl(description)!;

      console.log(`\n🎯 Promoting: "${title}" (${views} views)`);

      // Create tracking record
      const record = await PromotedShort.create({
        originalVideoId: videoId,
        originalTitle: title,
        viewsAtPromotion: views,
        twitchClipUrl,
        status: 'processing',
      });

      try {
        // 1. Download original video from Twitch
        const originalBuffer = await downloadFromTwitch(twitchClipUrl);

        // 2. Crop from 16:9 → 9:16 vertical using ffmpeg
        const verticalBuffer = cropToVertical(originalBuffer);

        // 3. Upload vertical video as YouTube Short
        const result = await uploadAsShort(verticalBuffer, title, twitchClipUrl);

        // Update tracking record
        record.shortVideoId = result.videoId;
        record.shortTitle = title + ' #Shorts';
        record.status = 'completed';
        await record.save();

        results.push({
          originalVideoId: videoId,
          shortVideoId: result.videoId,
          shortUrl: result.url,
          views,
          status: 'completed',
        });

        console.log(`✅ Promoted "${title}" → ${result.url}`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Failed to promote "${title}":`, errorMsg);

        record.status = 'failed';
        record.error = errorMsg;
        await record.save();

        results.push({
          originalVideoId: videoId,
          views,
          status: 'failed',
          error: errorMsg,
        });
      }
    }

    return NextResponse.json({
      message: `Processed ${results.length} video(s)`,
      promoted: results.filter((r) => r.status === 'completed').length,
      failed: results.filter((r) => r.status === 'failed').length,
      results,
    });
  } catch (error) {
    console.error('❌ promote-to-shorts error:', error);

    if (error instanceof Error && error.message.includes('quotaExceeded')) {
      return NextResponse.json({ error: 'YouTube API quota exceeded. Try again tomorrow.' }, { status: 429 });
    }

    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
