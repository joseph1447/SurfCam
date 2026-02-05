import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';

const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID!;
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET!;
const YOUTUBE_REFRESH_TOKEN = process.env.YOUTUBE_REFRESH_TOKEN!;
const CRON_SECRET = process.env.CRON_SECRET;

interface ClipData {
  videoUrl: string;
  videoUrls?: string[]; // Multiple possible URLs to try
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

// Download video from URL with content-type verification
async function downloadVideo(url: string): Promise<{ buffer: Buffer; contentType: string }> {
  console.log(`📥 Attempting download from: ${url}`);

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'video/mp4,video/*,*/*',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') || '';
  console.log(`📋 Content-Type: ${contentType}`);

  const arrayBuffer = await response.arrayBuffer();
  const sizeMB = (arrayBuffer.byteLength / 1024 / 1024).toFixed(2);
  console.log(`📦 Downloaded ${sizeMB} MB`);

  return { buffer: Buffer.from(arrayBuffer), contentType };
}

// Try multiple URLs and return the first successful video download
async function downloadVideoFromUrls(urls: string[]): Promise<Buffer> {
  for (const url of urls) {
    try {
      const { buffer, contentType } = await downloadVideo(url);

      // Verify it's actually a video
      const isVideo = contentType.includes('video') ||
                      contentType.includes('mp4') ||
                      contentType.includes('octet-stream');

      // Also check magic bytes for MP4 (ftyp signature at offset 4)
      const magicBytes = buffer.slice(4, 8).toString('ascii');
      const isMp4MagicBytes = magicBytes === 'ftyp' ||
                              magicBytes === 'moov' ||
                              magicBytes === 'mdat' ||
                              magicBytes === 'free' ||
                              magicBytes === 'isom';

      console.log(`🔍 Magic bytes: "${magicBytes}" (MP4 check: ${isMp4MagicBytes})`);

      if (isVideo || isMp4MagicBytes) {
        console.log(`✅ Valid video found at: ${url}`);
        return buffer;
      }

      // Check if it's an image (JPEG starts with FFD8FF)
      const isJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
      const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E;

      if (isJpeg || isPng) {
        console.log(`⚠️ URL returned an image, not a video: ${url}`);
        continue; // Try next URL
      }

      // Unknown format but not image, might still work
      console.log(`⚠️ Unknown content type but attempting to use: ${contentType}`);
      return buffer;

    } catch (error) {
      console.log(`❌ Failed to download from ${url}:`, error);
      continue; // Try next URL
    }
  }

  throw new Error('Could not download video from any of the provided URLs');
}

// Extract clip slug from various URL formats
function extractClipSlug(clipUrl: string): string | null {
  // Format 1: https://clips.twitch.tv/SlugHere
  const clipsMatch = clipUrl.match(/clips\.twitch\.tv\/([^?/]+)/);
  if (clipsMatch) return clipsMatch[1];

  // Format 2: https://www.twitch.tv/channel/clip/SlugHere
  const channelClipMatch = clipUrl.match(/twitch\.tv\/[^/]+\/clip\/([^?/]+)/);
  if (channelClipMatch) return channelClipMatch[1];

  return null;
}

// Fetch video URL using Twitch's GQL API (most reliable method)
async function getVideoUrlFromGQL(clipSlug: string): Promise<string | null> {
  try {
    console.log(`🔍 Fetching clip URL via Twitch GQL API for: ${clipSlug}`);

    const gqlQuery = {
      operationName: 'VideoAccessToken_Clip',
      variables: { slug: clipSlug },
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash: '36b89d2507fce29e5ca551df756d27c1cfe079e2609642b4390aa4c35796eb11'
        }
      }
    };

    const response = await fetch('https://gql.twitch.tv/gql', {
      method: 'POST',
      headers: {
        'Client-ID': 'kimne78kx3ncx6brgo4mv6wki5h1ko', // Twitch's public web client ID
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gqlQuery),
    });

    if (!response.ok) {
      console.log(`⚠️ GQL request failed: ${response.status}`);
      return null;
    }

    const data = await response.json();

    // Extract video URL from GQL response
    const clip = data?.data?.clip;
    if (!clip) {
      console.log('⚠️ No clip data in GQL response');
      return null;
    }

    // Get the video playback access token
    const playbackAccessToken = clip.playbackAccessToken;
    if (!playbackAccessToken) {
      console.log('⚠️ No playback access token');
      return null;
    }

    // Get video qualities
    const videoQualities = clip.videoQualities;
    if (!videoQualities || videoQualities.length === 0) {
      console.log('⚠️ No video qualities available');
      return null;
    }

    // Get the highest quality (first one is usually the best)
    const bestQuality = videoQualities[0];
    const sourceUrl = bestQuality.sourceURL;

    // Append the access token to the URL
    const token = encodeURIComponent(playbackAccessToken.value);
    const sig = playbackAccessToken.signature;

    const finalUrl = `${sourceUrl}?sig=${sig}&token=${token}`;
    console.log(`✅ Got video URL from GQL API (quality: ${bestQuality.quality})`);

    return finalUrl;
  } catch (error) {
    console.log('❌ Error fetching from GQL API:', error);
    return null;
  }
}

// Fetch video URL from Twitch clip embed page (fallback method)
async function getVideoUrlFromEmbed(clipUrl: string): Promise<string | null> {
  try {
    const slug = extractClipSlug(clipUrl);
    if (!slug) {
      console.log('⚠️ Could not extract clip slug from URL');
      return null;
    }

    // Fetch the clip embed page
    const embedUrl = `https://clips.twitch.tv/${slug}`;
    console.log(`📄 Fetching clip page: ${embedUrl}`);

    const response = await fetch(embedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      },
    });

    if (!response.ok) {
      console.log(`⚠️ Failed to fetch clip page: ${response.status}`);
      return null;
    }

    const html = await response.text();

    // Try to find video URL in the page
    // Pattern 1: Look for video source URL in script tags
    const videoUrlMatch = html.match(/"videoUrl"\s*:\s*"([^"]+\.mp4[^"]*)"/);
    if (videoUrlMatch) {
      const url = videoUrlMatch[1].replace(/\\u0026/g, '&');
      console.log(`✅ Found video URL in page: ${url}`);
      return url;
    }

    // Pattern 2: Look for quality_options with source URL
    const qualityMatch = html.match(/"source"\s*:\s*"([^"]+\.mp4[^"]*)"/);
    if (qualityMatch) {
      const url = qualityMatch[1].replace(/\\u0026/g, '&');
      console.log(`✅ Found quality source URL: ${url}`);
      return url;
    }

    // Pattern 3: Look for clip-video-url
    const clipVideoMatch = html.match(/clip-video-url="([^"]+)"/);
    if (clipVideoMatch) {
      console.log(`✅ Found clip-video-url: ${clipVideoMatch[1]}`);
      return clipVideoMatch[1];
    }

    console.log('⚠️ Could not find video URL in clip page');
    return null;
  } catch (error) {
    console.log('❌ Error fetching clip embed:', error);
    return null;
  }
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

    let videoBuffer: Buffer | null = null;

    // Step 1: Try GQL API method first (most reliable)
    if (clipData.twitchUrl) {
      const clipSlug = extractClipSlug(clipData.twitchUrl);
      if (clipSlug) {
        console.log(`📋 Attempting GQL API method for clip: ${clipSlug}`);
        const gqlVideoUrl = await getVideoUrlFromGQL(clipSlug);
        if (gqlVideoUrl) {
          try {
            videoBuffer = await downloadVideoFromUrls([gqlVideoUrl]);
            console.log('✅ GQL API method succeeded!');
          } catch (gqlError) {
            console.log('⚠️ GQL API download failed, trying fallback methods...');
          }
        }
      }
    }

    // Step 2: Try thumbnail URL conversion (fallback)
    if (!videoBuffer) {
      const urlsToTry = clipData.videoUrls || [clipData.videoUrl];
      console.log(`📋 Trying ${urlsToTry.length} URL(s) from thumbnail conversion`);
      try {
        videoBuffer = await downloadVideoFromUrls(urlsToTry);
        console.log('✅ Thumbnail URL method succeeded!');
      } catch (error) {
        console.log('⚠️ Thumbnail URL method failed, trying embed page method...');
      }
    }

    // Step 3: Try embed page scraping (last resort)
    if (!videoBuffer && clipData.twitchUrl) {
      const embedVideoUrl = await getVideoUrlFromEmbed(clipData.twitchUrl);
      if (embedVideoUrl) {
        console.log(`📋 Trying URL from embed page: ${embedVideoUrl}`);
        try {
          videoBuffer = await downloadVideoFromUrls([embedVideoUrl]);
          console.log('✅ Embed page method succeeded!');
        } catch (embedError) {
          console.log('❌ Embed page method also failed');
        }
      }
    }

    if (!videoBuffer) {
      throw new Error('Could not download video from any source. All methods failed.');
    }

    // Step 3: Upload to YouTube
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
