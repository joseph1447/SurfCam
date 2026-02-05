import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';

const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID!;
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET!;
const YOUTUBE_REFRESH_TOKEN = process.env.YOUTUBE_REFRESH_TOKEN!;
const CRON_SECRET = process.env.CRON_SECRET;

interface ClipData {
  videoUrl: string;
  clipId: string;
  title: string;
  duration: number;
  createdAt: string;
  thumbnailUrl: string;
  twitchUrl: string;
}

// Format date for title
function formatDateForTitle(isoDate: string): string {
  const date = new Date(isoDate);
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Costa_Rica', // Costa Rica timezone
  };
  return date.toLocaleString('en-US', options);
}

// Generate YouTube Short title
function generateTitle(clipData: ClipData): string {
  const formattedDate = formatDateForTitle(clipData.createdAt);
  return `🌊 Santa Teresa Surf - ${formattedDate}`;
}

// Generate YouTube Short description
function generateDescription(clipData: ClipData): string {
  return `Live surf conditions from Santa Teresa, Costa Rica! 🏄‍♂️

📍 Watch the live 24/7 stream: https://santateresasurfcam.com
🎬 Original clip: ${clipData.twitchUrl}

Santa Teresa is one of the best surf spots in Costa Rica, known for its consistent waves and beautiful beaches.

#shorts #surf #santateresa #costarica #surfing #waves #beach #ocean #puravida #surfcam #livesurf`;
}

// Download video from URL
async function downloadVideo(url: string): Promise<Buffer> {
  console.log(`📥 Downloading video from: ${url}`);

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download video: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  console.log(`✅ Downloaded ${(arrayBuffer.byteLength / 1024 / 1024).toFixed(2)} MB`);

  return Buffer.from(arrayBuffer);
}

// Create OAuth2 client
function createOAuth2Client() {
  const oauth2Client = new google.auth.OAuth2(
    YOUTUBE_CLIENT_ID,
    YOUTUBE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    refresh_token: YOUTUBE_REFRESH_TOKEN,
  });

  return oauth2Client;
}

// Upload video to YouTube
async function uploadToYouTube(
  videoBuffer: Buffer,
  clipData: ClipData
): Promise<{ videoId: string; url: string }> {
  const oauth2Client = createOAuth2Client();
  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  const title = generateTitle(clipData);
  const description = generateDescription(clipData);

  console.log(`📤 Uploading to YouTube: "${title}"`);

  // Convert buffer to readable stream
  const videoStream = Readable.from(videoBuffer);

  const response = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title,
        description,
        tags: [
          'surf',
          'surfing',
          'santa teresa',
          'costa rica',
          'waves',
          'beach',
          'ocean',
          'pura vida',
          'surfcam',
          'live surf',
          'surf conditions',
          'surf check',
          'shorts',
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
  if (!videoId) {
    throw new Error('No video ID returned from YouTube');
  }

  const youtubeUrl = `https://youtube.com/shorts/${videoId}`;
  console.log(`✅ Uploaded to YouTube: ${youtubeUrl}`);

  return { videoId, url: youtubeUrl };
}

export async function POST(request: NextRequest) {
  // Allow localhost requests without auth (for testing)
  const host = request.headers.get('host') || '';
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');

  // Verify authentication (skip for localhost)
  if (!isLocalhost) {
    const authHeader = request.headers.get('authorization');
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Validate environment
  if (!YOUTUBE_CLIENT_ID || !YOUTUBE_CLIENT_SECRET || !YOUTUBE_REFRESH_TOKEN) {
    return NextResponse.json({
      success: false,
      error: 'Missing YouTube configuration',
      missing: {
        YOUTUBE_CLIENT_ID: !YOUTUBE_CLIENT_ID,
        YOUTUBE_CLIENT_SECRET: !YOUTUBE_CLIENT_SECRET,
        YOUTUBE_REFRESH_TOKEN: !YOUTUBE_REFRESH_TOKEN,
      }
    }, { status: 500 });
  }

  try {
    const clipData: ClipData = await request.json();

    if (!clipData.videoUrl) {
      return NextResponse.json({
        success: false,
        error: 'videoUrl is required'
      }, { status: 400 });
    }

    console.log('🎬 Starting YouTube upload process...');

    // Step 1: Download the video
    const videoBuffer = await downloadVideo(clipData.videoUrl);

    // Step 2: Upload to YouTube
    const result = await uploadToYouTube(videoBuffer, clipData);

    console.log('🎉 Successfully uploaded to YouTube!');

    return NextResponse.json({
      success: true,
      videoId: result.videoId,
      youtubeUrl: result.url,
      title: generateTitle(clipData),
    });

  } catch (error) {
    console.error('Error uploading to YouTube:', error);

    // Handle specific Google API errors
    if (error instanceof Error) {
      // Check for quota exceeded
      if (error.message.includes('quotaExceeded')) {
        return NextResponse.json({
          success: false,
          error: 'YouTube API quota exceeded. Try again tomorrow.',
          errorType: 'quota_exceeded',
        }, { status: 429 });
      }

      // Check for authentication errors
      if (error.message.includes('invalid_grant') || error.message.includes('Token')) {
        return NextResponse.json({
          success: false,
          error: 'YouTube authentication failed. Please refresh the OAuth token.',
          errorType: 'auth_error',
        }, { status: 401 });
      }
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
